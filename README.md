# Tradegen Yield Farming

A fully on-chain yield farming system for pools (permissionless hedge funds that intereact with white-listed protocols on Celo). A pool's weight is updated automatically when the pool's deposit(), withdraw(), takeSnapshot(), and executeTransaction() functions are called. Rewards are released on a halvening schedule with 26-week cycles, lasting indefinitely.

Testnet rewards begin on September 1, 2022 at 12AM UTC.

## Eligibility

Pools will be eligible for rewards after meeting the following requirements:
- Pool has lasted for at least 30 days
- At least 10 investors in the pool
- At least $1,000 TVL

The pool manager can manually mark a pool as eligible once all requirements are met.

## System Design

### Smart Contracts

* HalveningReleaseSchedule - Stores the release schedule for a reward token.
* PoolManager - Registers pools, updates their weight, and calculates available rewards.
* ReleaseEscrow - Stores reward tokens to be released according to the HalveningReleaseSchedule.
* StakingRewards - Handles entering/exiting a yield-farming position and claiming rewards.
* StakingRewardsFactory - Creates StakingRewards contracts.

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
