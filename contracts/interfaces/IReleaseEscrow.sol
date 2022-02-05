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
     *
     * @notice The tokens received represent rewards earned across all pools. The PoolManager contract handles the logic
     *          for partitioning rewards based on a specific pool's weight.
     * @notice This function is called by the PoolManager contract whenever a user claims rewards for a given pool.
     */
    function withdraw() external;
}
