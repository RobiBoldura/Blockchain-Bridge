// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {IBTToken} from "../src/IBTToken.sol";
import {Bridge} from "../src/Bridge.sol";

contract DeployScript is Script {
    function run() external {
        // Load the private key from .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the token with initial supply to the deployer
        IBTToken token = new IBTToken(1000 * 10**18); // Mint 1000 tokens initially
        
        // Deploy the bridge with the token address
        Bridge bridge = new Bridge(address(token));
        
        // Approve bridge to spend tokens
        token.approve(address(bridge), type(uint256).max);
        
        vm.stopBroadcast();

        // Log the addresses using console2
        console2.log("Token deployed to:", address(token));
        console2.log("Bridge deployed to:", address(bridge));
        console2.log("Tokens minted to:", deployer);
    }
}
