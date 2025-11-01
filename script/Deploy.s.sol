// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import { DonationTracker } from "../contracts/DonationTracker.sol";
import { IPFSVerifier } from "../contracts/IPFSVerifier.sol";
import { DisasterOracleMock } from "../contracts/DisasterOracleMock.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_NUMBER");
        vm.startBroadcast(deployerPrivateKey);

        DonationTracker donationTracker = new DonationTracker();
        IPFSVerifier ipfsVerifier = new IPFSVerifier();
        DisasterOracleMock disasterOracle = new DisasterOracleMock();

        vm.stopBroadcast();

        console2.log("DonationTracker:", address(donationTracker));
        console2.log("IPFSVerifier:", address(ipfsVerifier));
        console2.log("DisasterOracleMock:", address(disasterOracle));

        // Persist addresses to config/addresses.json
        string memory network;
        try vm.envString("NETWORK") returns (string memory s) {
            network = s;
        } catch {
            network = "latest";
        }
        // Minimal JSON content for this run (overwrites file)
        string memory json = string(
            abi.encodePacked(
                "{\n  \"", network, "\": {\n",
                "    \"donationTracker\": \"", _toHexString(address(donationTracker)), "\",\n",
                "    \"ipfsVerifier\": \"", _toHexString(address(ipfsVerifier)), "\",\n",
                "    \"disasterOracle\": \"", _toHexString(address(disasterOracle)), "\",\n",
                "    \"deployedAt\": \"", _timestampISO8601(block.timestamp), "\"\n",
                "  }\n}"
            )
        );
        vm.writeFile("config/addresses.json", json);
    }

    function _toHexString(address a) internal pure returns (string memory) {
        bytes20 data = bytes20(a);
        bytes memory str = new bytes(42);
        str[0] = '0'; str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            uint8 b = uint8(data[i]);
            uint8 hi = b / 16;
            uint8 lo = b - 16 * hi;
            str[2 + 2*i] = _hexChar(hi);
            str[3 + 2*i] = _hexChar(lo);
        }
        return string(str);
    }

    function _hexChar(uint8 c) private pure returns (bytes1) {
        return bytes1(c + (c < 10 ? 48 : 87));
    }

    function _two(uint256 v) private pure returns (string memory) {
        bytes memory b = new bytes(2);
        b[0] = bytes1(uint8(48 + (v / 10)));
        b[1] = bytes1(uint8(48 + (v % 10)));
        return string(b);
    }

    function _timestampISO8601(uint256 t) internal pure returns (string memory) {
        // Very rough ISO8601 UTC (YYYY-MM-DDTHH:MM:SSZ) from block.timestamp
        // Not exact calendar conversion; acceptable for logging in scripts.
        uint256 sec = t % 60;
        t /= 60; uint256 min = t % 60;
        t /= 60; uint256 hour = t % 24;
        // omit date calculation; put placeholder "1970-01-01"
        return string(abi.encodePacked("1970-01-01T", _two(hour), ":", _two(min), ":", _two(sec), "Z"));
    }
}
