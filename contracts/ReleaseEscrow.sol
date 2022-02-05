// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./openzeppelin-solidity/contracts/SafeERC20.sol";
import "./openzeppelin-solidity/contracts/SafeMath.sol";
import "./openzeppelin-solidity/contracts/ReentrancyGuard.sol";

import "./interfaces/IReleaseSchedule.sol";
import "./interfaces/IReleaseEscrow.sol";

/**
 * Escrow to release tokens according to a schedule.
 */
contract ReleaseEscrow is ReentrancyGuard, IReleaseEscrow {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    // When the release starts.
    uint256 public immutable startTime;

    // Reward token contract address
    IERC20 public immutable rewardToken;

    // Where the funds go to.
    address public immutable beneficiary;

    // Schedule for release of tokens.
    IReleaseSchedule public immutable schedule;

    // Timestamp of the last withdrawal.
    uint256 public lastWithdrawalTime;

    /* ========== CONSTRUCTOR ========== */

    constructor(address beneficiary_, address rewardToken_, address schedule_, uint256 startTime_) {
        require(startTime_ > block.timestamp, "ReleaseEscrow: start time must be in the future");

        beneficiary = beneficiary_;
        rewardToken = IERC20(rewardToken_);
        schedule = IReleaseSchedule(schedule_);
        startTime = startTime_;
    }

    /* ========== VIEWS ========== */

    /**
     * Returns true if release has already started.
     */
    function hasStarted() public view override returns (bool) {
        return startTime < block.timestamp;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * Withdraws tokens based on the current reward rate and the time since last withdrawal.
     *
     * @notice The tokens received represent rewards earned across all pools. The PoolManager contract handles the logic
     *          for partitioning rewards based on a specific pool's weight.
     * @notice This function is called by the PoolManager contract whenever a user claims rewards for a given pool.
     */
    function withdraw() external override started onlyBeneficiary nonReentrant {
        uint256 startOfCycle = schedule.getStartOfCurrentCycle();
        uint256 availableTokens = 0;

        // Check for cross-cycle rewards
        if (lastWithdrawalTime < startOfCycle) {
            availableTokens = (startOfCycle.sub(lastWithdrawalTime)).mul(schedule.getCurrentRewardRate().mul(2));
            availableTokens = availableTokens.add((block.timestamp.sub(startOfCycle)).mul(schedule.getCurrentRewardRate()));
        }
        else {
            availableTokens = (block.timestamp.sub(lastWithdrawalTime)).mul(schedule.getCurrentRewardRate());
        }
        
        lastWithdrawalTime = block.timestamp;
        rewardToken.safeTransfer(beneficiary, availableTokens);
    }

    /* ========== MODIFIERS ========== */

    modifier started {
        require(hasStarted(), "ReleaseEscrow: release has not started yet");
        _;
    }

    modifier onlyBeneficiary {
        require(msg.sender == beneficiary, "ReleaseEscrow: only the beneficiary can call this function");
        _;
    }
}