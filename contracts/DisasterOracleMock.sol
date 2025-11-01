// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DisasterOracleMock {
    address public owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    constructor() { owner = msg.sender; emit OwnershipTransferred(address(0), msg.sender); }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    event DisasterVerified(bytes32 indexed disasterIdHash, string disasterId, bool verified, uint256 confidence);

    mapping(bytes32 => bool) public requested;

    function requestVerification(string memory disasterId, int256 /*lat*/, int256 /*lon*/, string memory /*eventType*/) external returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(disasterId, block.timestamp, msg.sender));
        requested[requestId] = true;
    }

    function setResult(string memory disasterId, bool verified, uint256 confidence) external onlyOwner {
        bytes32 idHash = keccak256(abi.encodePacked(disasterId));
        emit DisasterVerified(idHash, disasterId, verified, confidence);
    }
}
