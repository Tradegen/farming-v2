// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

//Libraries
import "../PoolManager.sol";

contract TestPoolManager is PoolManager {
    constructor(address _rewardsToken, address _releaseEscrow, address _releaseSchedule, address _poolFactory)
        PoolManager(_rewardsToken, _releaseEscrow, _releaseSchedule, _poolFactory) {}

    function calculatePoolWeight(address _poolAddress) external view returns(uint256) {
        return _calculatePoolWeight(_poolAddress);
    }

    function setStartTime(uint _startTime) external {
        startTime = _startTime;
    }

    function setLastUpdateTime(uint _lastUpdateTime) external {
        lastUpdateTime = _lastUpdateTime;
    }

    function getCurrentTime() external view returns(uint256) {
        return block.timestamp;
    }

    function setPoolInfo(address _poolAddress, bool _isValid, bool _isEligible, address _farmAddress, uint256 _unrealizedProfits, uint256 _latestRecordedPrice, uint256 _latestRecordedPeriodIndex, uint256 _previousRecordedPrice, uint256 _previousRecordedPeriodIndex) external {
        pools[_poolAddress] = PoolInfo({
            isValid: _isValid,
            isEligible: _isEligible,
            farmAddress: _farmAddress,
            unrealizedProfits: _unrealizedProfits,
            latestRecordedPrice: _latestRecordedPrice,
            latestRecordedPeriodIndex: _latestRecordedPeriodIndex,
            previousRecordedPrice: _previousRecordedPrice,
            previousRecordedPeriodIndex: _previousRecordedPeriodIndex
        });
    }

    function setGlobalPeriodInfo(uint256 _periodIndex, uint256 _totalWeight) external {
        globalPeriods[_periodIndex] = GlobalPeriodInfo({
            totalWeight: _totalWeight
        });
    }

    function setPoolPeriodInfo(address _poolAddress, uint256 _periodIndex, uint256 _unrealizedProfits, uint256 _tokenPrice, uint256 _weight) external {
        poolPeriods[_poolAddress][_periodIndex] = PoolPeriodInfo({
            unrealizedProfits: _unrealizedProfits,
            tokenPrice: _tokenPrice,
            weight: _weight
        });
    }
}