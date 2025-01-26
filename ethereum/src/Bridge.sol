// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract Bridge is Ownable {
    IERC20 public token;
    
    // Events
    event TokensLocked(address indexed from, uint256 amount, string suiAddress);
    event TokensUnlocked(address indexed to, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function bridgeToSui(uint256 amount, string calldata suiAddress) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit TokensLocked(msg.sender, amount, suiAddress);
    }

    function unlockTokens(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
        emit TokensUnlocked(to, amount);
    }
} 