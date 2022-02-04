// SPDX-License-Identifier: MIT
// solhint-disable not-rely-on-time

pragma solidity ^0.8.3;

import "./openzeppelin-solidity/contracts/Math.sol";
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";
import "./openzeppelin-solidity/contracts/SafeERC20.sol";
import "./openzeppelin-solidity/contracts/IERC1155.sol";
import "./openzeppelin-solidity/contracts/ERC1155Holder.sol";

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
    uint256 private _weightedTotalSupply;
    mapping(address => uint256[4]) private _balances;
    mapping(address => uint256) private _weightedBalance;

    //Weights per token class
    uint256[4] public WEIGHTS = [65, 20, 10, 5];

    /* ========== CONSTRUCTOR ========== */

    constructor(address _poolManager, address _rewardsToken, address _stakingToken, address _poolAddress) {
        rewardsToken = IERC20(_rewardsToken);
        stakingToken = IERC1155(_stakingToken);
        poolManager = IPoolManager(_poolManager);
        poolAddress = _poolAddress;
    }

    /* ========== VIEWS ========== */

    function balanceOf(address account, uint256 tokenClass) external view override returns (uint256) {
        require(tokenClass > 0 && tokenClass < 5, "Token class must be between 1 and 4");

        return _balances[account][tokenClass - 1];
    }

    function earned(address account) public view override returns (uint256) {
        return _weightedBalance[account].mul(rewardPerTokenStored.sub(userRewardPerTokenPaid[account])).add(rewards[account]);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount, uint256 tokenClass) external override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        require(tokenClass > 0 && tokenClass < 5, "Token class must be between 1 and 4");
        require(stakingToken.balanceOf(msg.sender, tokenClass) >= amount, "Not enough tokens");

        uint256 weightedAmount = amount.mul(WEIGHTS[tokenClass - 1]);
        totalSupply = totalSupply.add(amount);
        _weightedTotalSupply = _weightedTotalSupply.add(weightedAmount);
        _weightedBalance[msg.sender] = _weightedBalance[msg.sender].add(weightedAmount);
        _balances[msg.sender][tokenClass - 1] = _balances[msg.sender][tokenClass - 1].add(amount);

        stakingToken.safeTransferFrom(msg.sender, address(this), tokenClass, amount, "0x0");

        emit Staked(msg.sender, tokenClass, amount);
    }

    function withdraw(uint256 amount, uint256 tokenClass) public override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(tokenClass > 0 && tokenClass < 5, "Token class must be between 1 and 4");

        uint256 weightedAmount = amount.mul(WEIGHTS[tokenClass - 1]);
        totalSupply = totalSupply.sub(amount);
        _weightedTotalSupply = _weightedTotalSupply.sub(weightedAmount);
        _weightedBalance[msg.sender] = _weightedBalance[msg.sender].sub(weightedAmount);
        _balances[msg.sender][tokenClass - 1] = _balances[msg.sender][tokenClass - 1].sub(amount);

        stakingToken.setApprovalForAll(msg.sender, true);
        stakingToken.safeTransferFrom(address(this), msg.sender, tokenClass, amount, "0x0");

        emit Withdrawn(msg.sender, tokenClass, amount);
    }

    function getReward() public override nonReentrant {
        poolManager.claimLatestRewards(poolAddress);
        _getReward();
    }

    function exit() external override {
        for (uint i = 0; i < 4; i++)
        {
            if (_balances[msg.sender][i] > 0)
            {
                withdraw(_balances[msg.sender][i], i + 1);
            }
        }
        
        getReward();
    }

    /* ========== INTERNAL FUNCTIONS ========== */

    function _getReward() internal updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function addReward(uint256 reward) external override onlyPoolManager {
        uint newTotalAvailableRewards = totalAvailableRewards.add(reward);

        if (_weightedTotalSupply > 0) {
            rewardPerTokenStored = rewardPerTokenStored.add((newTotalAvailableRewards.sub(totalAvailableRewards)).div(_weightedTotalSupply));
        }

        totalAvailableRewards = newTotalAvailableRewards;

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