// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;

interface IStakingRewards {
    // Views

    function earned(address account) external view returns (uint256);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account, uint256 tokenClass) external view returns (uint256);

    // Mutative

    function stake(uint256 amount, uint256 tokenClass) external;

    function withdraw(uint256 amount, uint256 tokenClass) external;

    function getReward() external;

    function exit() external;

    function addReward(uint256 reward) external;
}