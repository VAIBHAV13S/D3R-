require('dotenv').config();
const { ethers } = require('ethers');
const { getProvider, getSigner } = require('./provider');

// DonationTracker ABI (expanded with view functions)
const DonationTrackerABI = [
  // Read functions
  'function campaignCount() view returns (uint256)',
  'function campaigns(uint256) view returns (uint256 id, address creator, string memory title, uint256 targetAmount, uint256 deadline, bool isActive, uint256 totalDonated, uint256 milestonesCount)',
  'function getCampaignMilestones(uint256 campaignId) view returns (uint256[] memory)',
  'function getMilestone(uint256 campaignId, uint256 milestoneId) view returns (uint256 id, string memory proofCID, bool approved, uint256 fundAmount, bool released)',
  'function getCampaignDonations(uint256 campaignId) view returns (address[] memory, uint256[] memory)',
  
  // Write functions
  'function createCampaign(string memory title, uint256 targetAmount, uint256 deadline) external',
  'function donate(uint256 campaignId) external payable',
  'function addMilestone(uint256 campaignId, string memory title, string memory proofCID, uint256 fundAmount) external',
  'function approveMilestone(uint256 campaignId, uint256 milestoneId) external',
  'function releaseFunds(uint256 campaignId, uint256 milestoneId) external',
  'function cancelCampaign(uint256 campaignId) external',
  
  // Events
  'event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)',
  'event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)',
  'event MilestoneAdded(uint256 indexed campaignId, uint256 indexed milestoneId, string title, uint256 fundAmount)',
  'event MilestoneApproved(uint256 indexed campaignId, uint256 indexed milestoneId)',
  'event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneId, uint256 amount, address indexed recipient)'
];

// IPFSVerifier ABI
const IPFSVerifierABI = [
  // Read functions
  'function owner() view returns (address)',
  'function getEntry(string memory cid) view returns (string memory, uint256, bool, string memory)',
  'function isVerified(string memory cid) view returns (bool)',
  
  // Write functions
  'function addEntry(string memory cid, string memory metadata) external',
  'function verifyEntry(string memory cid, bool isValid) external',
  'function transferOwnership(address newOwner) external',
  
  // Events
  'event EntryAdded(string indexed cid, address indexed submitter, uint256 timestamp)',
  'event EntryVerified(string indexed cid, bool isValid, address indexed verifier)'
];

// DisasterOracle ABI
const DisasterOracleABI = [
  // Read functions
  'function owner() view returns (address)',
  'function requested(bytes32) view returns (bool)',
  'function getStatus(string memory disasterId) view returns (bool verified, uint256 confidence)',
  
  // Write functions
  'function requestVerification(string memory disasterId, int256 lat, int256 lon, string memory eventType) external returns (bytes32 requestId)',
  'function setResult(string memory disasterId, bool verified, uint256 confidence) external',
  'function transferOwnership(address newOwner) external',
  
  // Events
  'event DisasterVerified(bytes32 indexed disasterIdHash, string disasterId, bool verified, uint256 confidence)'
];

function getDonationTracker(readOnly = false) {
  const addr = process.env.DONATION_TRACKER_ADDRESS;
  if (!addr) throw new Error('DONATION_TRACKER_ADDRESS not set');
  const provider = getProvider();
  const signerOrProvider = readOnly ? provider : getSigner(provider);
  return new ethers.Contract(addr, DonationTrackerABI, signerOrProvider);
}

function getIPFSVerifier(readOnly = false) {
  const addr = process.env.IPFS_VERIFIER_ADDRESS;
  if (!addr) throw new Error('IPFS_VERIFIER_ADDRESS not set');
  const provider = getProvider();
  const signerOrProvider = readOnly ? provider : getSigner(provider);
  return new ethers.Contract(addr, IPFSVerifierABI, signerOrProvider);
}

function getDisasterOracle(readOnly = false) {
  const addr = process.env.DISASTER_ORACLE_ADDRESS;
  if (!addr) throw new Error('DISASTER_ORACLE_ADDRESS not set');
  const provider = getProvider();
  const signerOrProvider = readOnly ? provider : getSigner(provider);
  return new ethers.Contract(addr, DisasterOracleABI, signerOrProvider);
}

module.exports = { getDonationTracker, getIPFSVerifier, getDisasterOracle, DonationTrackerABI, IPFSVerifierABI, DisasterOracleABI };
