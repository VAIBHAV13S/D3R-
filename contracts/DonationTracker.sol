// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DonationTracker - Campaign and milestone management with on-chain donations and controlled releases
/// @notice Implements required structs and functions per specification.
contract DonationTracker {
    // --- Ownable ---
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // --- ReentrancyGuard ---
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        _status = _NOT_ENTERED;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // --- Data structures ---
    enum CampaignStatus { Active, Closed, Cancelled }

    struct Milestone {
        uint256 id;          // index within campaign
        string proofCID;     // IPFS CID provided via submitProof
        bool approved;       // set by owner via approveMilestone
        uint256 fundAmount;  // wei to release when approved
        bool released;       // whether funds were released
    }

    struct Campaign {
        uint256 id;
        uint256 target;            // target goal in wei
        uint256 current;           // accumulated donations in wei
        CampaignStatus status;     // campaign lifecycle
        Milestone[] milestones;    // dynamic list of milestones
        uint256 deadline;          // optional deadline timestamp; 0 means none
    }

    // campaignId => Campaign
    mapping(uint256 => Campaign) private campaigns;
    uint256 private nextCampaignId = 1;

    // --- Events ---
    event CampaignCreated(uint256 indexed campaignId, uint256 target, uint256 deadline);
    event MilestoneSubmitted(uint256 indexed campaignId, uint256 indexed milestoneId, string proofCID);
    event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount, address indexed to);

    // --- Create campaign ---
    function createCampaign(uint256 target, uint256 deadline) external returns (uint256 campaignId) {
        require(target > 0, "Target > 0");
        require(deadline == 0 || deadline > block.timestamp, "Deadline in future");
        campaignId = nextCampaignId++;
        Campaign storage c = campaigns[campaignId];
        c.id = campaignId;
        c.target = target;
        c.current = 0;
        c.status = CampaignStatus.Active;
        c.deadline = deadline;
        emit CampaignCreated(campaignId, target, deadline);
    }

    // --- Add milestone ---
    function addMilestone(uint256 campaignId, uint256 fundAmount) external {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(c.status == CampaignStatus.Active, "Inactive");
        require(fundAmount > 0, "Amount > 0");
        uint256 mId = c.milestones.length;
        c.milestones.push(Milestone({
            id: mId,
            proofCID: "",
            approved: false,
            fundAmount: fundAmount,
            released: false
        }));
    }

    // --- Submit proof (IPFS CID) ---
    function submitProof(uint256 campaignId, uint256 milestoneId, string calldata ipfsCID) external {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(milestoneId < c.milestones.length, "Milestone not found");
        Milestone storage m = c.milestones[milestoneId];
        m.proofCID = ipfsCID;
        emit MilestoneSubmitted(campaignId, milestoneId, ipfsCID);
    }

    // --- Approve milestone (owner only) ---
    function approveMilestone(uint256 campaignId, uint256 milestoneId) external onlyOwner {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(milestoneId < c.milestones.length, "Milestone not found");
        Milestone storage m = c.milestones[milestoneId];
        require(!m.approved, "Already approved");
        m.approved = true;
    }

    // --- Release funds (owner triggers; sends to owner) ---
    function releaseFunds(uint256 campaignId, uint256 milestoneId) external onlyOwner nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(milestoneId < c.milestones.length, "Milestone not found");
        Milestone storage m = c.milestones[milestoneId];
        require(m.approved, "Not approved");
        require(!m.released, "Already released");
        require(address(this).balance >= m.fundAmount, "Insufficient balance");
        m.released = true;
        (bool ok, ) = payable(owner).call{value: m.fundAmount}("");
        require(ok, "Transfer failed");
        emit FundsReleased(campaignId, milestoneId, m.fundAmount, owner);
    }

    // --- Receive donation for a specific campaign ---
    function receiveDonation(uint256 campaignId) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(c.status == CampaignStatus.Active, "Inactive");
        if (c.deadline != 0) {
            require(block.timestamp <= c.deadline, "Closed");
        }
        require(msg.value > 0, "No value");
        c.current += msg.value;
    }

    // --- Views ---
    function getCampaign(uint256 campaignId)
        external
        view
        returns (
            uint256 id,
            uint256 target,
            uint256 current,
            CampaignStatus status,
            uint256 milestoneCount,
            uint256 deadline
        )
    {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        return (c.id, c.target, c.current, c.status, c.milestones.length, c.deadline);
    }

    function getMilestone(uint256 campaignId, uint256 milestoneId)
        external
        view
        returns (uint256 id, string memory proofCID, bool approved, uint256 fundAmount, bool released)
    {
        Campaign storage c = campaigns[campaignId];
        require(c.id != 0, "Campaign not found");
        require(milestoneId < c.milestones.length, "Milestone not found");
        Milestone storage m = c.milestones[milestoneId];
        return (m.id, m.proofCID, m.approved, m.fundAmount, m.released);
    }
}
