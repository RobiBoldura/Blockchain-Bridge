// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {Bridge} from "../src/Bridge.sol";

contract DeployBridgeScript is Script {
    function run() public {
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Bridge with token address
        Bridge bridge = new Bridge(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        
        console2.log("Bridge deployed to:", address(bridge));

        vm.stopBroadcast();
    }
} 