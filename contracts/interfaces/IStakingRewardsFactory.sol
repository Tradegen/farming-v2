// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IStakingRewardsFactory {

    function getFarm(address poolAddress) external view returns (address);

    function createFarm(address poolAddress) external returns (address);
}
