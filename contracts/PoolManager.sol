// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.3;

// OpenZeppelin
import "./openzeppelin-solidity/contracts/Ownable.sol";
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";

// Inheritance
import "./interfaces/IPoolManager.sol";
import "./StakingRewardsFactory.sol";

// Interfaces
import "./interfaces/IReleaseEscrow.sol";
import "./interfaces/IReleaseSchedule.sol";
import "./interfaces/IStakingRewards.sol";

//Libraries
import "./libraries/TradegenMath.sol";

contract PoolManager is IPoolManager, ReentrancyGuard, StakingRewardsFactory, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct PoolInfo {
        bool isValid;
        bool isEligible;
        address farmAddress;
        uint256 unrealizedProfits;
        uint256 latestRecordedPrice;
        uint256 latestRecordedPeriodIndex;
        uint256 previousRecordedPrice;
        uint256 previousRecordedPeriodIndex;
        uint256 lastUpdated;
        uint256 createdOn;
    }

    struct GlobalPeriodInfo {
        uint256 totalWeight;
    }

    struct PoolPeriodInfo {
        uint256 unrealizedProfits;
        uint256 tokenPrice;
        uint256 weight;
    }

    /* ========== STATE VARIABLES ========== */

    // Configuration 
    uint32 public constant PERIOD_DURATION = 14 days;
    uint256 public constant MINIMUM_POOL_DURATION = 30 days;
    uint256 public constant MINIMUM_NUMBER_OF_INVESTORS = 10;
    uint256 public constant MINIMUM_TOTAL_VALUE_LOCKED = 10 ** 21; // $1,000

    // Contracts
    IERC20 public rewardsToken;
    IReleaseEscrow public releaseEscrow;
    IReleaseSchedule public releaseSchedule;
    address public immutable poolFactory;

    mapping(address => PoolInfo) public pools; // Keyed by pool address
    mapping(uint256 => GlobalPeriodInfo) public globalPeriods; // Keyed by period index
    mapping(address => mapping(uint256 => PoolPeriodInfo)) public poolPeriods; // Keyed by pool address and period index

    mapping(address => uint256) public poolAPC; // The average price change of each pool
    uint256 public totalWeightedAPC; // Sum of (pool APC * pool duration)
    uint256 public totalDuration; // Sum of pool duration; used for calculating average APC

    uint256 public lastUpdateTime;
    uint256 public startTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public poolRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    /* ========== CONSTRUCTOR ========== */

    constructor(address _rewardsToken, address _releaseSchedule, address _poolFactory) Ownable()
        StakingRewardsFactory(address(this), _rewardsToken) {
            rewardsToken = IERC20(_rewardsToken);
            releaseSchedule = IReleaseSchedule(_releaseSchedule);
            poolFactory = _poolFactory;
            startTime = block.timestamp;
            lastUpdateTime = block.timestamp;
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the pool info for the given address.
     * @param poolAddress address of the pool.
     * @return (bool, bool, address, uint256) whether the pool is valid, whether the pool is eligible for rewards, address of the pool's farm, and the pool's unrealized profits.
     */
    function getPoolInfo(address poolAddress) external view override returns (bool, bool, address, uint256) {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");

        PoolInfo memory data = pools[poolAddress];

        return (data.isValid, data.isEligible, data.farmAddress, data.unrealizedProfits);
    }

    /**
     * @dev Calculates the amount of rewards per "token" a pool has.
     * @notice Scaled by a factor of 1e18.
     * @notice For the PoolManager contract, one "token" represents one unit of "weight" (derived from a pool's unrealized profits and token price).
     * @return (uint256) reward per "token".
     */
    function rewardPerToken() public view override returns (uint256) {
        uint256 currentPeriodIndex = getPeriodIndex(block.timestamp);
        uint256 startOfCycle = releaseSchedule.getStartOfCurrentCycle();
        uint256 scaledWeight = TradegenMath.scaleByTime(globalPeriods[currentPeriodIndex].totalWeight,
                                    currentPeriodIndex > 0 ? globalPeriods[currentPeriodIndex.sub(1)].totalWeight : 0,
                                    block.timestamp,
                                    getStartOfPeriod(currentPeriodIndex),
                                    PERIOD_DURATION);

        // Prevent division by 0 from TradegenMath.scaleByTime() returning 0
        if (scaledWeight == 0) {
            return rewardPerTokenStored;
        }

        uint256 availableTokens = 0;
        // Check for cross-cycle rewards
        if (lastUpdateTime < startOfCycle) {
            availableTokens = (startOfCycle.sub(lastUpdateTime)).mul(releaseSchedule.getCurrentRewardRate().mul(2));
            availableTokens = availableTokens.add((block.timestamp.sub(startOfCycle)).mul(releaseSchedule.getCurrentRewardRate()));
        }
        else {
            availableTokens = (block.timestamp.sub(lastUpdateTime)).mul(releaseSchedule.getCurrentRewardRate());
        }

        return rewardPerTokenStored.add(availableTokens.mul(1e18).div(scaledWeight));
    }

    /**
     * @dev Calculates the amount of unclaimed rewards the pool has available.
     * @param poolAddress address of the pool.
     * @return (uint256) amount of available unclaimed rewards.
     */
    function earned(address poolAddress) public view override returns (uint256) {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");

        uint256 currentPeriodIndex = getPeriodIndex(block.timestamp);

        return TradegenMath.scaleByTime(poolPeriods[poolAddress][currentPeriodIndex].weight,
                                        currentPeriodIndex > 0 ? poolPeriods[poolAddress][currentPeriodIndex.sub(1)].weight : 0,
                                        block.timestamp,
                                        getStartOfPeriod(currentPeriodIndex),
                                        PERIOD_DURATION)
                                    .mul(rewardPerToken().sub(poolRewardPerTokenPaid[poolAddress])).div(1e18).add(rewards[poolAddress]);
    }

    /**
     * @dev Calculates the period index corresponding to the given timestamp.
     * @param timestamp timestamp to calculate the period for.
     * @return (uint256) index of the period to which the timestamp belongs to.
     */
    function getPeriodIndex(uint256 timestamp) public view override returns (uint256) {
        require(timestamp >= startTime, "PoolManager: timestamp must be greater than start time.");

        return (timestamp.sub(startTime)).div(PERIOD_DURATION);
    }

    /**
     * @dev Calculates the starting timestamp of the given period.
     * @notice This function is used for time-scaling a pool's weight.
     * @param periodIndex index of the period.
     * @return (uint256) timestamp at which the period started.
     */
    function getStartOfPeriod(uint256 periodIndex) public view override returns (uint256) {
        require(periodIndex >= 0, "PoolManager: period index must be positive.");

        return startTime.add(periodIndex.mul(PERIOD_DURATION));
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
     * @dev Claims the pool's available rewards.
     * @notice This function is meant to be called by the pool's farm whenever a user claims their farming rewards.
     * @param poolAddress address of the pool.
     * @return (uint256) amount of rewards claimed.
     */
    function claimLatestRewards(address poolAddress) external override releaseEscrowIsSet poolIsValid(poolAddress) onlyFarm(poolAddress) updateReward(poolAddress) returns (uint256) {
        uint256 reward = rewards[poolAddress];

        _getReward(poolAddress);

        return reward;
    }

    /**
     * @dev Updates the pool's weight based on the pool's unrealized profits and change in token price from the last period.
     * @notice This function is meant to be called by a pool contract at the end of deposit(), withdraw(), and executeTransaction() functions.
     * @param newUnrealizedProfits the new unrealized profits for the pool, after calling the parent function.
     * @param poolTokenPrice the current price of the pool's token.
     */
    function updateWeight(uint256 newUnrealizedProfits, uint256 poolTokenPrice) external override nonReentrant releaseEscrowIsSet poolIsValid(msg.sender) updateReward(msg.sender) {
        require(newUnrealizedProfits >= 0, "PoolManager: unrealized profits cannot be negative.");
        require(poolTokenPrice > 0, "PoolManager: pool token price must be greater than 0.");

        uint256 currentPeriodIndex = getPeriodIndex(block.timestamp);
        uint256 currentPoolWeight = poolPeriods[msg.sender][currentPeriodIndex].weight;

        // Update pool info
        if (currentPeriodIndex > pools[msg.sender].latestRecordedPeriodIndex) {
            pools[msg.sender].previousRecordedPrice = pools[msg.sender].latestRecordedPrice;
            pools[msg.sender].previousRecordedPeriodIndex = pools[msg.sender].latestRecordedPeriodIndex; 
        }
        
        pools[msg.sender].unrealizedProfits = newUnrealizedProfits;
        pools[msg.sender].latestRecordedPrice = poolTokenPrice;
        pools[msg.sender].latestRecordedPeriodIndex = currentPeriodIndex;

        if (!pools[msg.sender].isEligible) {
            pools[msg.sender].lastUpdated = block.timestamp;
            return;
        }

        totalWeightedAPC = totalWeightedAPC.sub(poolAPC[msg.sender].mul(pools[msg.sender].lastUpdated.sub(pools[msg.sender].createdOn)));
        totalDuration = totalDuration.sub(pools[msg.sender].lastUpdated.sub(pools[msg.sender].createdOn));

        poolAPC[msg.sender] = _calculateAveragePriceChange(msg.sender);
        pools[msg.sender].lastUpdated = block.timestamp;
        
        totalWeightedAPC = totalWeightedAPC.add(poolAPC[msg.sender].mul(block.timestamp.sub(pools[msg.sender].createdOn)));
        totalDuration = totalDuration.add(block.timestamp.sub(pools[msg.sender].createdOn));

        uint256 newPoolWeight = _calculatePoolWeight(msg.sender);

        // Update pool info for current period
        poolPeriods[msg.sender][currentPeriodIndex] = PoolPeriodInfo({
            unrealizedProfits: newUnrealizedProfits,
            tokenPrice: poolTokenPrice,
            weight: newPoolWeight
        });

        // Update global info for current period
        globalPeriods[currentPeriodIndex] = GlobalPeriodInfo({
            totalWeight: globalPeriods[currentPeriodIndex].totalWeight.sub(currentPoolWeight).add(newPoolWeight)
        });

        _getReward(msg.sender);
    }

    /**
     * @dev Registers a pool in the farming system.
     * @notice This function is meant to be called by the PoolFactory contract when creating a pool.
     * @param poolAddress address of the pool.
     * @param seedPrice initial price of the pool.
     */
    function registerPool(address poolAddress, uint256 seedPrice) external override onlyPoolFactory {
        require(poolAddress != address(0), "PoolManager: invalid pool address.");
        require(!pools[poolAddress].isValid, "PoolManager: pool already exists.");
        require(seedPrice > 0, "PoolManager: seed price must be greater than 0.");

        address farmAddress = _createFarm(msg.sender);
        uint256 currentPeriodIndex = getPeriodIndex(block.timestamp);

        pools[poolAddress] = PoolInfo({
            isValid: true,
            isEligible: false,
            farmAddress: farmAddress,
            unrealizedProfits: 0,
            latestRecordedPrice: seedPrice,
            latestRecordedPeriodIndex: currentPeriodIndex,
            previousRecordedPrice: seedPrice,
            previousRecordedPeriodIndex: currentPeriodIndex,
            lastUpdated: block.timestamp,
            createdOn: block.timestamp
        });

        emit RegisteredPool(poolAddress, farmAddress);
    }

    /**
     * @dev Marks a pool as eligible for farming rewards, if it meets the minimum criteria.
     * @notice This function is meant to be called by a pool contract, from the pool's owner.
     * @param totalValueLocked current value of the pool in USD.
     * @param numberOfInvestors number of unique investors in the pool.
     * @return (bool) whether the pool was marked as eligible.
     */
    function markPoolAsEligible(uint256 totalValueLocked, uint256 numberOfInvestors) external override poolIsValid(msg.sender) returns (bool) {
        require(totalValueLocked >= 0, "PoolManager: total value locked must be positive.");
        require(numberOfInvestors >= 0, "PoolManager: numberOfInvestors must be positive.");

        if (block.timestamp.sub(pools[msg.sender].createdOn) < MINIMUM_POOL_DURATION) {
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

    /**
     * @dev Sets the address of the ReleaseEscrow contract.
     * @notice This function can only be called once, and must be called before users can interact with PoolManager.
     */
    function setReleaseEscrow(address _releaseEscrow) external onlyOwner releaseEscrowIsNotSet {
        require(_releaseEscrow != address(0), "PoolManager: invalid address.");

        releaseEscrow = IReleaseEscrow(_releaseEscrow);

        emit SetReleaseEscrow(_releaseEscrow);
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @dev Withdraws available tokens from the ReleaseEscrow contract and transfers the pool's share of those rewards to the pool's farm.
     * @param poolAddress address of the pool.
     */
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

    /**
     * @dev Calculates the pool's weight.
     * @notice The weight is calculated by [unrealizedProfits / 1e18 * x].
     * @notice If pool's APC >= average APC, x = sqrt(pool APC - average APC).
     * @notice Else, x = log2(pool APC) / sqrt(average APC - pool APC).
     * @notice Average APC = totalWeightedAPC / totalDuration.
     * @param poolAddress address of the pool.
     * @return (uint256) weight of the pool.
     */
    function _calculatePoolWeight(address poolAddress) internal view returns (uint256) {
        if (poolAPC[poolAddress] >= totalWeightedAPC.div(totalDuration)) {
            return pools[poolAddress].unrealizedProfits.div(1e18).mul(TradegenMath.sqrt(poolAPC[poolAddress].sub(totalWeightedAPC.div(totalDuration))));
        }

        return pools[poolAddress].unrealizedProfits.div(1e18).mul(TradegenMath.log(poolAPC[poolAddress])).div((totalWeightedAPC.div(totalDuration)).sub(poolAPC[poolAddress]));
    }

    /**
     * @dev Calculates the pool's average price change over the last 2 periods.
     * @notice Average price change is the difference between latest price and previous price, divided by the number of periods between the two prices.
     * @param poolAddress address of the pool.
     * @return (uint256) average price change.
     */
    function _calculateAveragePriceChange(address poolAddress) internal view returns (uint256) {
        PoolInfo memory data = pools[poolAddress];

        // Return early if the pool's token has declined in price.
        if (data.latestRecordedPrice <= data.previousRecordedPrice) {
            return 0;
        }

        // Prevent division by 0
        if (data.previousRecordedPrice == 0) {
            return 0;
        }

        // Prevent division by 0 or negative values
        if (data.previousRecordedPeriodIndex > data.latestRecordedPeriodIndex) {
            return 0;
        }

        // Average price change is scaled by 1000x to preserve fractional percent changes.
        return (data.latestRecordedPrice.sub(data.previousRecordedPrice)).mul(1e18)
                                        .div(data.previousRecordedPrice)
                                        .div((data.latestRecordedPeriodIndex == data.previousRecordedPeriodIndex)
                                                ? 1 : data.latestRecordedPeriodIndex.sub(data.previousRecordedPeriodIndex)).div(1e15);
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

    modifier releaseEscrowIsSet() {
        require(address(releaseEscrow) != address(0), "PoolManager: ReleaseEscrow contract must be set before calling this function.");
        _;
    }

    modifier releaseEscrowIsNotSet() {
        require(address(releaseEscrow) == address(0), "PoolManager: ReleaseEscrow contract already set.");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardPaid(address indexed user, uint256 reward);
    event RegisteredPool(address indexed poolAddress, address farmAddress);
    event MarkedPoolAsEligible(address indexed poolAddress);
    event UpdatedWeight(address indexed poolAddress, uint256 newUnrealizedProfits);
    event SetReleaseEscrow(address releaseEscrowAddress);
}