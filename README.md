# Tradegen Yield Farming

A fully on-chain yield farming system for pools (permissionless hedge funds that intereact with white-listed protocols on Celo). A pool's weight is updated automatically when the pool's deposit(), withdraw(), takeSnapshot(), and executeTransaction() functions are called. Rewards are released on a halvening schedule with 26-week cycles, lasting indefinitely.

Testnet rewards begin on September 1, 2022 at 12AM UTC.

## Purpose

Create a self-sustaining reward system that can be seamlessly integrated by other protocols.

## Eligibility

Pools will be eligible for rewards after meeting the following requirements:
- Pool has lasted for at least 30 days
- At least 10 investors in the pool
- At least $1,000 TVL

The pool manager can manually mark a pool as eligible once all requirements are met.

## System Design

### Smart Contracts

* HalveningReleaseSchedule - Used for calculating the number of tokens unlocked based on the time elapsed since the contract was deployed. Tokens are unlocked on a halvening schedule to ensure there will always be tokens to distribute.
* PoolManager - The main contract of the farming system. It is responsible for registering pools, marking pools as eligible to receive rewards after meeting minimum criteria, updating pool weights after each external transaction, and withdrawing unlocked tokens from escrow.
* ReleaseEscrow - Stores the lifetime supply of tokens to distribute. It uses the HalveningReleaseSchedule contract to determine how many tokens to unlock at any given time. The contract is called by the PoolManager contract whenever a pool updates weights or a user claims rewards.
* StakingRewards -  Each registered pool has a unique Staking Rewards contract that represents a 'farm' in existing yield farming systems. This contract receives rewards (if any) from the PoolManager contract whenever its associated pool is updated through an external transaction (such as depositing or withdrawing). Users can stake their pool tokens in this contract to earn a share of the pool's rewards proportional to their stake.
* StakingRewardsFactory - Creates a StakingRewards contracts whenever a pool is registered in the system.

## Repository Structure

```
.
├── abi  ## Generated ABIs that developers can use to interact with the system.
├── addresses  ## Address of each deployed contract, organized by network.
├── contracts  ## All source code.
│   ├── interfaces  ## Interfaces used for defining/calling contracts.
│   ├── libraries  ## Helper functions used throughout the protocol.
│   ├── openzeppelin-solidity  ## Helper contracts provided by OpenZeppelin.
│   ├── test  ## Mock contracts used for testing main contracts.
├── test ## Source code for testing code in //contracts.
```

## Disclaimer

These smart contracts have not been audited yet.

## Documentation

To learn more about the Tradegen project, visit the docs at https://docs.tradegen.io.

This protocol is launched on the Celo blockchain. To learn more about Celo, visit their home page: https://celo.org/.

Source code for asset management protocol: https://github.com/Tradegen/protocol-v2.

## License

MIT
