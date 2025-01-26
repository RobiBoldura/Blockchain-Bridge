// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/IBTToken.sol";

contract InteractScript is Script {
    function run() external {
        // Conectare la contractul implementat
        address contractAddress = 0x5FbDB2315678afecb367f032d93F642f64180aa3;
        IBTToken token = IBTToken(contractAddress);

        // Apelează funcții de la contract
        uint256 supply = token.totalSupply();
        console.log("Total Supply: ", supply);
    }
}
