# Tradegen Yield Farming

## Purpose

Create a self-sustaining reward system that can be seamlessly integrated by other protocols.

## Overview

The Tradegen yield farming system is a fully on-chain self-sustaining reward system. The system is integrated by the Tradegen asset management protocol to reward pools based on their performance. Pools can be registered in the system after meeting the minimum criteria (see below). Rewards are distributed indefinitely, using a halvening release schedule, to pools proportional to their weight in the system. A pool's weight is determined by its performance relative to other pools, and is updated automatically whenever the pool makes a transaction (deposit, withdraw, or interact with external contract).

Users can deposit their pool tokens (issued by the asset management protocol) into the pool's farming contract (StakingRewards) to receive rewards proportional to their stake while staying invested in the pool. A pool's rewards are sent to the pool's farming contract whenever a user claims rewards.

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

Testnet rewards began on September 1, 2022 at 12AM UTC.

## Documentation

To learn more about the Tradegen project, visit the docs at https://docs.tradegen.io.

This protocol is launched on the Celo blockchain. To learn more about Celo, visit their home page: https://celo.org/.

Source code for asset management protocol: https://github.com/Tradegen/protocol-v2.

## License

MIT
