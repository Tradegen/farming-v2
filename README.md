# Yield Farming

A fully on-chain yield farming system for pools (permissionless hedge funds that intereact with white-listed protocols on Celo). A pool's weight is updated automatically when the pool's deposit(), withdraw(), takeSnapshot(), and executeTransaction() functions are called. Rewards are released on a halvening schedule with 26-week cycles, lasting indefinitely.

## Eligibility

Pools will be eligible for rewards after meeting the following requirements:
- Pool has lasted for at least 30 days
- At least 10 investors in the pool
- At least $1,000 TVL

The pool manager can manually mark a pool as eligible once all requirements are met.

## Disclaimer

These smart contracts have not been audited or deployed yet.

## Docs

Docs are available at https://docs.tradegen.io

## License

MIT
