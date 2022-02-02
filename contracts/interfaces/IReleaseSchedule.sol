// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

/**
 * A token release schedule that lasts indefinitely.
 */
interface IReleaseSchedule {
    /**
     * Gets the tokens scheduled to be released for a cycle.
     */
    function getTokensForCycle(uint256 _cycleIndex) external view returns (uint256);

    /**
     * Gets the index of the current cycle.
     */
    function getCurrentCycle() external view returns (uint256);
}
