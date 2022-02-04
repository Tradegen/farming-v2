// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Internal references
import './StakingRewards.sol';

abstract contract StakingRewardsFactory {

    address public poolManager;
    address public rewardToken;
    address public stakingToken;

    constructor(address _poolManager, address _rewardToken, address _stakingToken) {
        poolManager = _poolManager;
        rewardToken = _rewardToken;
        stakingToken = _stakingToken;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function _createFarm(address poolAddress) internal returns(address) {
        require(poolAddress != address(0), "StakingRewardsFactory: invalid address.");
        
        //Create farm
        address farmAddress = address(new StakingRewards(poolManager, rewardToken, stakingToken, poolAddress));

        return farmAddress;
    }
}