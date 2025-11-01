// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IPFSVerifier - Simple on-chain registry and verification for IPFS CIDs
contract IPFSVerifier {
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    struct IPFSEntry {
        string cid;
        uint256 timestamp;
        bool approved;
        string metadata; // free-form JSON or details
    }

    // cid => entry
    mapping(string => IPFSEntry) private entries;

    event CIDRegistered(string indexed cid, string metadata);
    event CIDVerified(string indexed cid, bool approved, string reason);

    function registerCID(string calldata cid, string calldata metadata) external {
        IPFSEntry storage e = entries[cid];
        require(bytes(e.cid).length == 0, "Already exists");
        e.cid = cid;
        e.timestamp = block.timestamp;
        e.approved = false;
        e.metadata = metadata;
        emit CIDRegistered(cid, metadata);
    }

    function verifyCID(string calldata cid) external view returns (bool) {
        IPFSEntry storage e = entries[cid];
        return e.approved;
    }

    function rejectCID(string calldata cid, string calldata reason) external onlyOwner {
        IPFSEntry storage e = entries[cid];
        require(bytes(e.cid).length != 0, "Not found");
        e.approved = false;
        emit CIDVerified(cid, false, reason);
    }

    // Optional: owner can set approval true for a CID
    function approveCID(string calldata cid, string calldata reason) external onlyOwner {
        IPFSEntry storage e = entries[cid];
        require(bytes(e.cid).length != 0, "Not found");
        e.approved = true;
        emit CIDVerified(cid, true, reason);
    }

    function getEntry(string calldata cid) external view returns (string memory, uint256, bool, string memory) {
        IPFSEntry storage e = entries[cid];
        require(bytes(e.cid).length != 0, "Not found");
        return (e.cid, e.timestamp, e.approved, e.metadata);
    }
}
