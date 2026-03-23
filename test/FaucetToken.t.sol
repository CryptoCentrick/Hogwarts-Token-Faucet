// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {FaucetToken} from "../src/FaucetToken.sol";

contract FaucetTest is Test {

    FaucetToken public faucetToken;

    uint constant FAUCET_AMOUNT = 100 * 10 ** 18; // 100 tokens with 18 decimals
    uint constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // 10 million tokens with 18 decimals
    uint constant FAUCET_COOLDOWN = 1 days; // 24 hours in seconds

    address public owner;
    address public user1;
    address public user2;
    
    function setUp() public {
        faucetToken = new FaucetToken();
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
    }

    function test_RequestToken_FirstClaim_Succeeds() public {
        vm.prank(user1);
        faucetToken.requestToken();
        assertEq(faucetToken.balanceOf(user1), FAUCET_AMOUNT);
        assertEq(faucetToken.totalSupply(), FAUCET_AMOUNT);        
    }

    function test_RequestToken_BeforeCooldown_Reverts() public {
        vm.prank(user1);
        faucetToken.requestToken();
        vm.prank(user1);
        vm.expectRevert(bytes("Cooldown Active: Wait 24 hours"));
        faucetToken.requestToken();
    }

    function test_RequestToken_AfterCooldown_Succceeds() public {
        vm.prank(user1);
        faucetToken.requestToken();
        vm.warp(block.timestamp + FAUCET_COOLDOWN + 1); // Move time forward by more than cooldown
        vm.prank(user1);
        faucetToken.requestToken();
        assertEq(faucetToken.balanceOf(user1), FAUCET_AMOUNT * 2);
    }

    function test_RequestToken_DifferentUsers_IndependentCooldowns() public {
        vm.prank(user1);
        faucetToken.requestToken();
        vm.prank(user2);
        faucetToken.requestToken();
        assertEq(faucetToken.balanceOf(user1), FAUCET_AMOUNT);
        assertEq(faucetToken.balanceOf(user2), FAUCET_AMOUNT);   
    }

    function test_RequestToken_AtMaxSupply_Reverts() public {
        // Mint tokens to reach the maximum supply
        vm.prank(owner);
        faucetToken.mint(user1, MAX_SUPPLY - FAUCET_AMOUNT + 1);
        vm.prank(user1);
        vm.expectRevert(bytes("Max Supply Reached"));
        faucetToken.requestToken();
    }

    function test_Mint_ByOwner_Succeeds() public {
        uint mintAmount = 500 * 10 ** 18;
        faucetToken.mint(user1, mintAmount);
        assertEq(faucetToken.balanceOf(user1), mintAmount);
        assertEq(faucetToken.totalSupply(), mintAmount);
    } 

    function test_mint_Non_Owner_Reverts() public {
        vm.prank(user1);
        vm.expectRevert();
        faucetToken.mint(user1, 100 * 10 ** 18);
    }

    function test_GetRemainingCooldown() public view {
        uint remaining = faucetToken.getRemainingCooldown(user1);
        assertEq(remaining, 0);
    }

    function test_GetRemainingCooldown_AfterClaim_ReturnCorrectTime() public {
        vm.prank(user1);
        faucetToken.requestToken();
        uint remaining = faucetToken.getRemainingCooldown(user1);
        assertGt(remaining, 0);
        assertEq(remaining, FAUCET_COOLDOWN);
    }  
}
