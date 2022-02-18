const { expect } = require("chai");

describe("StakingRewards", () => {
  let deployer;
  let otherUser;

  let rewardToken;
  let rewardTokenAddress;
  let RewardTokenFactory;

  let stakingToken;
  let stakingTokenAddress;
  let StakingTokenFactory;

  let stakingRewards;
  let stakingRewardsAddress;
  let stakingRewardsFactory;
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    StakingTokenFactory = await ethers.getContractFactory('TestTokenERC1155');
    RewardTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    StakingRewardsFactory = await ethers.getContractFactory('StakingRewards');

    rewardToken = await RewardTokenFactory.deploy("Test Reward Token", "rTEST");
    await rewardToken.deployed();
    rewardTokenAddress = rewardToken.address;

    stakingToken = await StakingTokenFactory.deploy("Test Staking Token", "sTEST");
    await stakingToken.deployed();
    stakingTokenAddress = stakingToken.address;

    stakingRewards = await StakingRewardsFactory.deploy(deployer.address, rewardTokenAddress, stakingTokenAddress);
    await stakingRewards.deployed();
    stakingRewardsAddress = stakingRewards.address;

    // Transfer reward tokens to StakingRewards contract
    let tx = await rewardToken.approve(stakingRewardsAddress, 100000000); //100 million
    await tx.wait();
    let tx2 = await rewardToken.transfer(stakingRewardsAddress, 100000000); //100 million
    await tx2.wait();

    // Transfer staking tokens to other user
    let tx3 = await stakingToken.setApprovalForAll(otherUser.address, true);
    await tx3.wait();
    let tx4 = await rewardToken.safeBatchTransferFrom(deployer.address, otherUser.address, [1, 2, 3, 4], [500, 500, 500, 500], "");
    await tx4.wait();
  });

  describe("#stake", () => {
    it("stake() with one investor when distribution has not started", async () => {

    });
  });
});