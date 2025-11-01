// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import { IPFSVerifier } from "../contracts/IPFSVerifier.sol";

contract IPFSVerifierTest is Test {
    IPFSVerifier v;
    address owner = address(this);
    address user = address(0xBEEF);

    function setUp() public {
        v = new IPFSVerifier();
    }

    function testRegisterAndVerifyFlow() public {
        string memory cid = "QmCID";
        v.registerCID(cid, "meta");
        // Initially not approved
        bool ok = v.verifyCID(cid);
        assertEq(ok, false);
        // Owner approves
        v.approveCID(cid, "ok");
        ok = v.verifyCID(cid);
        assertEq(ok, true);
        // Owner can reject
        v.rejectCID(cid, "bad");
        ok = v.verifyCID(cid);
        assertEq(ok, false);
    }

    function testCannotRegisterTwice() public {
        string memory cid = "Qm123";
        v.registerCID(cid, "meta");
        vm.expectRevert(bytes("Already exists"));
        v.registerCID(cid, "meta2");
    }
}
