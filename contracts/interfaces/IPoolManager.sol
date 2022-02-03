// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IPoolManager {
    // Views

    function getPoolInfo(address poolAddress) external view returns (bool, bool, address, uint256);

    function earned(address poolAddress) external view returns (uint256);

    function totalUnrealizedProfits() external view returns (uint256);

    function getRewardRate() external view returns (uint256);

    function rewardPerToken()external view returns (uint256);

    // Restricted

    function updateWeight(uint256 newUnrealizedProfits) external;

    function registerPool(address poolAddress) external;

    function markPoolAsEligible(uint32 createdOn, uint256 totalValueLocked, uint256 numberOfInvestors) external returns (bool);

    function claimLatestRewards(address poolAddress) external returns (uint256);
}