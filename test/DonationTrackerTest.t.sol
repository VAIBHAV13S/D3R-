// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import { DonationTracker } from "../contracts/DonationTracker.sol";

contract DonationTrackerTest is Test {
    DonationTracker dt;
    address owner = address(this);
    address donor = address(0xBEEF);
    receive() external payable {}

    function setUp() public {
        dt = new DonationTracker();
    }

    function testCreateCampaign() public {
        uint256 id = dt.createCampaign(1 ether, 0);
        (uint256 cid, uint256 target,, , uint256 mcount, ) = dt.getCampaign(id);
        assertEq(cid, id);
        assertEq(target, 1 ether);
        assertEq(mcount, 0);
    }

    function testMilestoneSubmission() public {
        uint256 id = dt.createCampaign(1 ether, 0);
        dt.addMilestone(id, 0.5 ether);
        dt.submitProof(id, 0, "QmCID");
        (,, bool approved, uint256 fundAmount, bool released) = dt.getMilestone(id, 0);
        assertEq(approved, false);
        assertEq(fundAmount, 0.5 ether);
        assertEq(released, false);
    }

    function testDonateAndRelease() public {
        uint256 id = dt.createCampaign(1 ether, 0);
        dt.addMilestone(id, 0.25 ether);
        // donate
        vm.deal(donor, 1 ether);
        vm.prank(donor);
        dt.receiveDonation{value: 0.3 ether}(id);
        // approve and release
        dt.approveMilestone(id, 0);
        uint256 balBefore = owner.balance;
        dt.releaseFunds(id, 0);
        assertEq(owner.balance, balBefore + 0.25 ether);
    }

    function testReentrancyPrevention() public {
        uint256 id = dt.createCampaign(1 ether, 0);
        dt.addMilestone(id, 0.1 ether);
        // prefund contract so release can send
        vm.deal(address(this), 1 ether);
        // donate to count current
        dt.receiveDonation{value: 0.2 ether}(id);
        dt.approveMilestone(id, 0);
        // reentrant attacker
        Reentrant r = new Reentrant(dt, id);
        vm.deal(address(r), 1 ether);
        vm.expectRevert();
        r.attackRelease();
    }
}

contract Reentrant {
    DonationTracker public dt;
    uint256 public id;
    constructor(DonationTracker _dt, uint256 _id) { dt = _dt; id = _id; }
    receive() external payable { dt.releaseFunds(id, 0); }
    function attackRelease() external { dt.releaseFunds(id, 0); }
}
