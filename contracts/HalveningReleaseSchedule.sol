// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

import "./openzeppelin-solidity/contracts/SafeMath.sol";

import "./interfaces/IReleaseSchedule.sol";

/**
 * A release schedule with a "halvening" event occuring every 26 weeks.
 * Halvening events last indefinitely.
 */
contract HalveningReleaseSchedule is IReleaseSchedule {
    using SafeMath for uint256;

    uint256 public constant cycleDuration = 26 weeks;
    uint256 public immutable firstCycleDistribution;
    uint256 public immutable distributionStartTime;

    /**
     * @param firstCycleDistribution_ Number of tokens to distribute in the first cycle.
     */
    constructor(uint256 firstCycleDistribution_) {
        distributionStartTime = block.timestamp;
        firstCycleDistribution = firstCycleDistribution_;
    }

    /**
     * Gets the tokens scheduled to be distributed for a specific cycle.
     */
    function getTokensForCycle(uint256 _cycleIndex) external view override returns (uint256) {
        return firstCycleDistribution.div(2 ** _cycleIndex);
    }

    /**
     * Gets the index of the current cycle.
     */
    function getCurrentCycle() external view override returns (uint256) {
        return (block.timestamp.sub(distributionStartTime)).div(cycleDuration);
    }
}