// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Inheritance
import './interfaces/IStakingRewardsFactory.sol';

//Internal references
import './StakingRewards.sol';

contract StakingRewardsFactory is IStakingRewardsFactory {

    address public poolManager;
    address public rewardsToken;
    address public stakingToken;

    mapping (address => address) public farms; // Keyed by pool address

    constructor(address _poolManager, address _rewardsToken, address _stakingToken) {
        poolManager = _poolManager;
        rewardsToken = _rewardsToken;
        stakingToken = _stakingToken;
    }

    /* ========== VIEWS ========== */

    function getFarm(address poolAddress) external view override returns(address) {
        require(poolAddress != address(0), "StakingRewardsFactory: invalid address.");

        return farms[poolAddress];
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function createFarm(address poolAddress) external override onlyPoolManager returns(address) {
        require(poolAddress != address(0), "StakingRewardsFactory: invalid address.");
        
        //Create farm
        address farmAddress = address(new StakingRewards(poolManager, rewardsToken, stakingToken, poolAddress));

        //Update state variables
        farms[poolAddress] = farmAddress;

        emit CreatedFarm(poolAddress, farmAddress);

        return farmAddress;
    }

    modifier onlyPoolManager() {
        require(msg.sender == poolManager, "StakingRewardsFactory: only the PoolManager contract can call this function.");
        _;
    }

    /* ========== EVENTS ========== */

    event CreatedFarm(address indexed poolAddress, address farmAddress);
}