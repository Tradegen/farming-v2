// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

/**
 * Escrow to release tokens according to a schedule.
 */
interface IReleaseEscrow {
    /**
     * Returns true if release has already started.
     */
    function hasStarted() external view returns (bool);

    /**
     * Withdraws tokens based on the current reward rate and the time since last withdrawal.
     */
    function withdraw() external;
}
