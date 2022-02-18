// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.3;

// Inheritance
import "../StakingRewards.sol";

contract TestStakingRewards is StakingRewards {

    /* ========== CONSTRUCTOR ========== */

    constructor(address _poolManager, address _rewardsToken, address _poolAddress) StakingRewards(_poolManager, _rewardsToken, _poolAddress) {}

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @dev Claims available rewards for the user.
     * @notice Claims pool's share of global rewards first, then claims the user's share of those rewards.
     * @notice Nearly identical to the non-test version, except this version doesn't call PoolManager.claimLatestRewards() before calling _getReward().
     * @notice PoolManager.claimLatestRewards() is simulated by calling StakingRewards.addReward() with a manual weight from the contract deloyer.
     */
    function getRewardTest() public nonReentrant {
        _getReward();
    }
}