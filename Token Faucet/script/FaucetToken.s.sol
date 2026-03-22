// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {FaucetToken} from "../src/FaucetToken.sol";

contract FaucetTokenScript is Script {
    FaucetToken public faucetToken;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        faucetToken = new FaucetToken();

        vm.stopBroadcast();
    }
}
