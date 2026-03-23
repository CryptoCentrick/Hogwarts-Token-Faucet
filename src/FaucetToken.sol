// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FaucetToken is ERC20, Ownable {

    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // Maximum supply of 10 million tokens
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;     // Amount dispensed per request (100 tokens)
    uint256 public constant FAUCET_COOLDOWN = 1 days;           // Cooldown period (24 hours)

    mapping(address => uint256) public lastFaucetClaim;

    event TokensRequested(address indexed claimant, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("Hogwarts Faucet Token", "HFTK") Ownable(msg.sender) {}

    function requestToken() external {
        uint256 lastClaim = lastFaucetClaim[msg.sender];
        if (lastClaim != 0) {
            require(block.timestamp >= lastClaim + FAUCET_COOLDOWN, "Cooldown Active: Wait 24 hours"); // ✅ fixed variable name
        }
        require(totalSupply() + FAUCET_AMOUNT <= MAX_SUPPLY, "Max Supply Reached");
        _mint(msg.sender, FAUCET_AMOUNT); // ✅ internal _mint, not public mint()
        lastFaucetClaim[msg.sender] = block.timestamp;
        emit TokensRequested(msg.sender, FAUCET_AMOUNT);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount); // ✅ correct arguments
    }

    function getRemainingCooldown(address claimant) external view returns (uint256) { // ✅ fixed typo
        uint256 lastClaim = lastFaucetClaim[claimant]; // ✅ use parameter, not msg.sender
        if (lastClaim == 0) { // ✅ == not =
            return 0;
        }
        uint256 nextAllowed = lastClaim + FAUCET_COOLDOWN;
        if (block.timestamp >= nextAllowed) {
            return 0;
        }
        return nextAllowed - block.timestamp;
    }
}