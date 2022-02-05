// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IPoolManager {
    // Views

    function getPoolInfo(address poolAddress) external view returns (bool, bool, address, uint256);

    function earned(address poolAddress) external view returns (uint256);

    function rewardPerToken()external view returns (uint256);

    // Restricted

    function updateWeight(uint256 newUnrealizedProfits, uint256 poolTokenPrice) external;

    function registerPool(address poolAddress, uint256 seedPrice) external;

    function markPoolAsEligible(uint32 createdOn, uint256 totalValueLocked, uint256 numberOfInvestors) external returns (bool);

    function claimLatestRewards(address poolAddress) external returns (uint256);
}