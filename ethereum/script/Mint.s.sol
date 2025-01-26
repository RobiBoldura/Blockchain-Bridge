// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {IBTToken} from "../src/IBTToken.sol";

contract MintScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Get the deployed token contract
        IBTToken token = IBTToken(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        
        // Mint tokens
        token.mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 1000 * 10**18);
        
        console2.log("Minted 1000 IBT tokens to:", 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);

        vm.stopBroadcast();
    }
} 