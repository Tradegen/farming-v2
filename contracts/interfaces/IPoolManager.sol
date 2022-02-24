// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IPoolManager {
    // Views

    /**
     * @dev Returns the pool info for the given address.
     * @param poolAddress address of the pool.
     * @return (bool, bool, address, uint256) whether the pool is valid, whether the pool is eligible for rewards, address of the pool's farm, and the pool's unrealized profits.
     */
    function getPoolInfo(address poolAddress) external view returns (bool, bool, address, uint256);

    /**
     * @dev Calculates the amount of unclaimed rewards the pool has available.
     * @param poolAddress address of the pool.
     * @return (uint256) amount of available unclaimed rewards.
     */
    function earned(address poolAddress) external view returns (uint256);

    /**
     * @dev Calculates the amount of rewards per "token" a pool has.
     * @notice For the PoolManager contract, one "token" represents one unit of "weight" (derived from a pool's unrealized profits and token price).
     * @return (uint256) reward per "token".
     */
    function rewardPerToken() external view returns (uint256);

    /**
     * @dev Calculates the period index corresponding to the given timestamp.
     * @param timestamp timestamp to calculate the period for.
     * @return (uint256) index of the period to which the timestamp belongs to.
     */
    function getPeriodIndex(uint256 timestamp) external view returns (uint256);

    /**
     * @dev Calculates the starting timestamp of the given period.
     * @notice This function is used for time-scaling a pool's weight.
     * @param periodIndex index of the period.
     * @return (uint256) timestamp at which the period started.
     */
    function getStartOfPeriod(uint256 periodIndex) external view returns (uint256);

    // Restricted

    /**
     * @dev Updates the pool's weight based on the pool's unrealized profits and change in token price from the last period.
     * @notice This function is meant to be called by a pool contract at the end of deposit(), withdraw(), and executeTransaction() functions.
     * @param newUnrealizedProfits the new unrealized profits for the pool, after calling the parent function.
     * @param poolTokenPrice the current price of the pool's token.
     */
    function updateWeight(uint256 newUnrealizedProfits, uint256 poolTokenPrice) external;

    /**
     * @dev Registers a pool in the farming system.
     * @notice This function is meant to be called by the PoolFactory contract when creating a pool.
     * @param poolAddress address of the pool.
     * @param seedPrice initial price of the pool.
     */
    function registerPool(address poolAddress, uint256 seedPrice) external;

    /**
     * @dev Marks a pool as eligible for farming rewards, if it meets the minimum criteria.
     * @notice This function is meant to be called by a pool contract, from the pool's owner.
     * @param totalValueLocked current value of the pool in USD.
     * @param numberOfInvestors number of unique investors in the pool.
     * @return (bool) whether the pool was marked as eligible.
     */
    function markPoolAsEligible(uint256 totalValueLocked, uint256 numberOfInvestors) external returns (bool);

    /**
     * @dev Claims the pool's available rewards.
     * @notice This function is meant to be called by the pool's farm whenever a user claims their farming rewards.
     * @param poolAddress address of the pool.
     * @return (uint256) amount of rewards claimed.
     */
    function claimLatestRewards(address poolAddress) external returns (uint256);
}