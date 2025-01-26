// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console2} from "forge-std/Script.sol";
import {IBTToken} from "../src/IBTToken.sol";

contract CheckOwnerScript is Script {
    function run() external view {
        // Get the deployed token contract
        IBTToken token = IBTToken(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        
        // Get the owner
        address owner = token.owner();
        console2.log("Token owner is:", owner);
    }
} 