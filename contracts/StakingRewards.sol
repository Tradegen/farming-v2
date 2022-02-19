// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.3;

import "./openzeppelin-solidity/contracts/Math.sol";
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "./openzeppelin-solidity/contracts/ERC20/SafeERC20.sol";
import "./openzeppelin-solidity/contracts/ERC1155/IERC1155.sol";
import "./openzeppelin-solidity/contracts/ERC1155/ERC1155Holder.sol";

// Inheritance
import "./interfaces/IStakingRewards.sol";

// Interfaces
import "./interfaces/IPoolManager.sol";

contract StakingRewards is IStakingRewards, ReentrancyGuard, ERC1155Holder {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public rewardsToken;
    IERC1155 public stakingToken;
    IPoolManager public poolManager;
    address public poolAddress;
    uint256 public totalAvailableRewards;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 public override totalSupply;
    uint256 public weightedTotalSupply;
    mapping(address => uint256[4]) public balances;
    mapping(address => uint256) public weightedBalance;

    //Weights per token class
    uint256[4] public WEIGHTS = [65, 20, 10, 5];

    /* ========== CONSTRUCTOR ========== */

    constructor(address _poolManager, address _rewardsToken, address _poolAddress) {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC1155(_poolAddress);
        poolManager = IPoolManager(_poolManager);
        poolAddress = _poolAddress;
    }

    /* ========== VIEWS ========== */

    /**
     * @dev Returns the number of tokens a user has staked for the given token class.
     * @param account address of the user.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     * @return (uint256) amount of tokens staked for the given class.
     */
    function balanceOf(address account, uint256 tokenClass) external view override returns (uint256) {
        require(tokenClass > 0 && tokenClass < 5, "Token class must be between 1 and 4");

        return balances[account][tokenClass - 1];
    }

    /**
     * @dev Calculates the amount of unclaimed rewards the user has available.
     * @param account address of the user.
     * @return (uint256) amount of available unclaimed rewards.
     */
    function earned(address account) public view override returns (uint256) {
        return weightedBalance[account].mul(rewardPerTokenStored.sub(userRewardPerTokenPaid[account])).add(rewards[account]);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @dev Stakes tokens of the given class in the farm.
     * @param amount number of tokens to stake.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     */
    function stake(uint256 amount, uint256 tokenClass) external override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: Amount must be positive.");
        require(tokenClass > 0 && tokenClass < 5, "StakingRewards: Token class must be between 1 and 4");
        require(stakingToken.balanceOf(msg.sender, tokenClass) >= amount, "StakingRewards: Not enough tokens");

        uint256 weightedAmount = amount.mul(WEIGHTS[tokenClass - 1]);
        totalSupply = totalSupply.add(amount);
        weightedTotalSupply = weightedTotalSupply.add(weightedAmount);
        weightedBalance[msg.sender] = weightedBalance[msg.sender].add(weightedAmount);
        balances[msg.sender][tokenClass - 1] = balances[msg.sender][tokenClass - 1].add(amount);

        stakingToken.safeTransferFrom(msg.sender, address(this), tokenClass, amount, "0x0");

        emit Staked(msg.sender, tokenClass, amount);
    }

    /**
     * @dev Withdraws tokens of the given class from the farm.
     * @param amount number of tokens to stake.
     * @param tokenClass class of the token (in range [1, 4] depending on the scarcity).
     */
    function withdraw(uint256 amount, uint256 tokenClass) public override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: Amount must be positive.");
        require(tokenClass > 0 && tokenClass < 5, "StakingRewards: Token class must be between 1 and 4");

        stakingToken.setApprovalForAll(msg.sender, true);
        _withdraw(msg.sender, amount, tokenClass);
    }

    /**
     * @dev Claims available rewards for the user.
     * @notice Claims pool's share of global rewards first, then claims the user's share of those rewards.
     */
    function getReward() public override nonReentrant {
        poolManager.claimLatestRewards(poolAddress);
        _getReward();
    }

    /**
     * @dev Withdraws all tokens a user has staked for each token class.
     */
    function exit() external override {
        stakingToken.setApprovalForAll(msg.sender, true);
        getReward();

        for (uint i = 0; i < 4; i++)
        {
            if (balances[msg.sender][i] > 0)
            {
                _withdraw(msg.sender, balances[msg.sender][i], i.add(1));
            }
        }
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    /**
     * @dev Claims available rewards for the user.
     */
    function _getReward() internal updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function _withdraw(address _user, uint _amount, uint _tokenClass) internal {
        uint256 weightedAmount = _amount.mul(WEIGHTS[_tokenClass - 1]);
        totalSupply = totalSupply.sub(_amount);
        weightedTotalSupply = weightedTotalSupply.sub(weightedAmount);
        weightedBalance[_user] = weightedBalance[_user].sub(weightedAmount);
        balances[_user][_tokenClass - 1] = balances[_user][_tokenClass - 1].sub(_amount);

        stakingToken.safeTransferFrom(address(this), _user, _tokenClass, _amount, "0x0");

        emit Withdrawn(_user, _tokenClass, _amount);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /**
     * @dev Updates the available rewards for the pool, based on the pool's share of global rewards.
     * @notice This function is meant to be called by the PoolManager contract.
     * @param reward number of tokens to add to the pool.
     */
    function addReward(uint256 reward) external override onlyPoolManager {
        if (weightedTotalSupply > 0) {
            rewardPerTokenStored = rewardPerTokenStored.add(reward.div(weightedTotalSupply));
        }

        totalAvailableRewards = totalAvailableRewards.add(reward);

        emit RewardAdded(reward);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }

    modifier onlyPoolManager() {
        require(msg.sender == address(poolManager), "StakingRewards: only the PoolManager contract can call this function");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint tokenClass, uint256 amount);
    event Withdrawn(address indexed user, uint tokenClass, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
}