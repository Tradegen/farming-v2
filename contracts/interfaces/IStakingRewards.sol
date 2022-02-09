// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IStakingRewards {
    // Views

    /**
     * @dev Calculates the amount of unclaimed rewards the user has available.
     * @param account address of the user.
     * @return (uint256) amount of available unclaimed rewards.
     */
    function earned(address account) external view returns (uint256);

    /**
     * @dev Returns the total number of tokens staked in the farm.
     * @return (uint256) total supply.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the number of tokens a user has staked for the given token class.
     * @param account address of the user.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     * @return (uint256) amount of tokens staked for the given class.
     */
    function balanceOf(address account, uint256 tokenClass) external view returns (uint256);

    // Mutative

    /**
     * @dev Stakes tokens of the given class in the farm.
     * @param amount number of tokens to stake.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     */
    function stake(uint256 amount, uint256 tokenClass) external;

    /**
     * @dev Withdraws tokens of the given class from the farm.
     * @param amount number of tokens to stake.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     */
    function withdraw(uint256 amount, uint256 tokenClass) external;

    /**
     * @dev Claims available rewards for the user.
     * @notice Claims pool's share of global rewards first, then claims the user's share of those rewards.
     */
    function getReward() external;

    /**
     * @dev Withdraws all tokens a user has staked for each token class.
     */
    function exit() external;

    // Restricted

    /**
     * @dev Updates the available rewards for the pool, based on the pool's share of global rewards.
     * @notice This function is meant to be called by the PoolManager contract.
     * @param reward number of tokens to add to the pool.
     */
    function addReward(uint256 reward) external;
}