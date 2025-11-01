require('dotenv').config();
const { ethers } = require('ethers');
const { getProvider, getSigner } = require('./provider');

// Minimal ABIs: replace with full ABIs if needed
const DonationTrackerABI = [
  'function createCampaign(string title, uint256 targetAmount, uint256 deadline) returns (uint256)',
  'function cancelCampaign(uint256 campaignId)',
  'function addMilestone(uint256 campaignId, string title, string proofCID, uint256 fundAmount)',
  'function approveMilestone(uint256 campaignId, uint256 index)',
  'function releaseMilestoneFunds(uint256 campaignId, uint256 index, address recipient)',
  'function donate(uint256 campaignId) payable',
  'event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 targetAmount, uint256 deadline)',
  'event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount)',
  'event MilestoneApproved(uint256 indexed campaignId, uint256 indexed index)',
  'event MilestoneFundsReleased(uint256 indexed campaignId, uint256 indexed index, uint256 amount, address indexed to)'
];

// Placeholders for other contracts
const IPFSVerifierABI = [
  'event Verified(bytes32 indexed cidHash, bool valid)'
];
const DisasterOracleABI = [
  'function requestVerification(string disasterId, int256 latitude, int256 longitude, string eventType) returns (bytes32 requestId)',
  'function getStatus(string disasterId) view returns (bool verified, uint256 confidence)',
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
