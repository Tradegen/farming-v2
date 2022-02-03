// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.3;

import "./openzeppelin-solidity/contracts/Math.sol";
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "./openzeppelin-solidity/contracts/SafeERC20.sol";

// Inheritance
import "./interfaces/IPoolManager.sol";

// Interfaces
import "./interfaces/IReleaseEscrow.sol";
import "./interfaces/IReleaseSchedule.sol";
import "./interfaces/IStakingRewards.sol";

contract PoolManager is IPoolManager, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct PoolInfo {
        bool isValid;
        bool isEligible;
        address farmAddress;
        uint256 unrealizedProfits;
    }

    /* ========== STATE VARIABLES ========== */

    uint256 public constant MINIMUM_POOL_DURATION = 30 days;
    uint256 public constant MINIMUM_NUMBER_OF_INVESTORS = 10;
    uint256 public constant MINIMUM_TOTAL_VALUE_LOCKED = 10 ** 21; // $1,000

    IERC20 public rewardsToken;
    IReleaseEscrow public releaseEscrow;
    IReleaseSchedule public releaseSchedule;
    address public immutable poolFactory;

    mapping(address => PoolInfo) public pools;

    uint256 public override totalUnrealizedProfits;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public poolRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _rewardsToken, address _releaseEscrow, address _releaseSchedule, address _poolFactory) {
        rewardsToken = IERC20(_rewardsToken);
        releaseEscrow = IReleaseEscrow(_releaseEscrow);
        releaseSchedule = IReleaseSchedule(_releaseSchedule);
        poolFactory = _poolFactory;
    }

    /* ========== VIEWS ========== */

    function getPoolInfo(address poolAddress) external view override returns (bool, bool, address, uint256) {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");

        PoolInfo memory data = pools[poolAddress];

        return (data.isValid, data.isEligible, data.farmAddress, data.unrealizedProfits);
    }

    function getRewardRate() public view override returns (uint256) {
        uint256 cycleDuration = releaseSchedule.cycleDuration();
        uint256 cycleIndex = releaseSchedule.getCurrentCycle();
        uint256 tokensForCycle = releaseSchedule.getTokensForCycle(cycleIndex);

        return tokensForCycle.div(cycleDuration);
    }

    function rewardPerToken() public view override returns (uint256) {
        if (totalUnrealizedProfits == 0) {
            return rewardPerTokenStored;
        }

        uint256 rewardRate = getRewardRate();

        return rewardPerTokenStored.add(block.timestamp.sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(totalUnrealizedProfits));
    }

    function earned(address poolAddress) public view override returns (uint256) {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");

        uint256 poolUnrealizedProfits = pools[poolAddress].unrealizedProfits;

        return poolUnrealizedProfits.mul(rewardPerToken().sub(poolRewardPerTokenPaid[poolAddress])).div(1e18).add(rewards[poolAddress]);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function claimLatestRewards(address poolAddress) external override poolIsValid(poolAddress) onlyFarm(poolAddress) updateReward(poolAddress) returns (uint256) {
        uint256 reward = rewards[poolAddress];

        _getReward(poolAddress);

        return reward;
    }

    function updateWeight(uint256 newUnrealizedProfits) external override nonReentrant poolIsValid(msg.sender) updateReward(msg.sender) {
        require(newUnrealizedProfits >= 0, "PoolManager: unrealized profits cannot be negative.");

        if (!pools[msg.sender].isEligible) {
            return;
        }

        uint256 currentUnrealizedProfits = pools[msg.sender].unrealizedProfits;

        totalUnrealizedProfits = totalUnrealizedProfits.sub(currentUnrealizedProfits).add(newUnrealizedProfits);
        pools[msg.sender].unrealizedProfits = newUnrealizedProfits;

        _getReward(msg.sender);
    }

    function registerPool(address poolAddress) external override onlyPoolFactory {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");

        pools[poolAddress].isValid = true;

        emit RegisteredPool(poolAddress);
    }

    function markPoolAsEligible(uint32 createdOn, uint256 totalValueLocked, uint256 numberOfInvestors) external override poolIsValid(msg.sender) returns (bool) {
        require(createdOn >= 0, "PoolManager: timestamp must be positive.");
        require(totalValueLocked >= 0, "PoolManager: total value locked must be positive.");
        require(numberOfInvestors >= 0, "PoolManager: numberOfInvestors must be positive.");

        if (block.timestamp.sub(createdOn) < MINIMUM_POOL_DURATION) {
            return false;
        }

        if (totalValueLocked < MINIMUM_TOTAL_VALUE_LOCKED) {
            return false;
        }

        if (numberOfInvestors < MINIMUM_NUMBER_OF_INVESTORS) {
            return false;
        }

        pools[msg.sender].isEligible = true;

        emit MarkedPoolAsEligible(msg.sender);

        return true;
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function _getReward(address poolAddress) internal {
        releaseEscrow.withdraw();

        uint256 reward = rewards[poolAddress];
        if (reward > 0) {
            rewards[poolAddress] = 0;
            rewardsToken.transfer(poolAddress, reward);
            IStakingRewards(pools[poolAddress].farmAddress).addReward(reward);

            emit RewardPaid(poolAddress, reward);
        }
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address poolAddress) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (poolAddress != address(0)) {
            rewards[poolAddress] = earned(poolAddress);
            poolRewardPerTokenPaid[poolAddress] = rewardPerTokenStored;
        }
        _;
    }

    modifier onlyPoolFactory() {
        require(msg.sender == poolFactory, "PoolManager: only the PoolFactory contract can call this function.");
        _;
    }

    modifier poolIsValid(address poolAddress) {
        require(pools[poolAddress].isValid, "PoolManager: only registered pools can call this function.");
        _;
    }

    modifier onlyFarm(address poolAddress) {
        require(msg.sender == pools[poolAddress].farmAddress, "PoolManager: only the StakingRewards contract can call this function.");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardPaid(address indexed user, uint256 reward);
    event RegisteredPool(address indexed poolAddress);
    event MarkedPoolAsEligible(address indexed poolAddress);
    event UpdatedWeight(address indexed poolAddress, uint256 newUnrealizedProfits);
}