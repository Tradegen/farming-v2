// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IStakingRewardsFactory {
     /**
     * @dev Creates a farm for the given pool.
     * @notice This function can only be called by the PoolManager contract.
     * @param poolAddress address of the pool.
     * @return (uint256) address of the newly created farm.
     */
    function createFarm(address poolAddress) external returns(address);
}
