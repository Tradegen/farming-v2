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
  let StakingRewardsFactory;
  
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

    stakingToken = await StakingTokenFactory.deploy();
    await stakingToken.deployed();
    stakingTokenAddress = stakingToken.address;
  });

  beforeEach(async () => {
    stakingRewards = await StakingRewardsFactory.deploy(deployer.address, rewardTokenAddress, stakingTokenAddress);
    await stakingRewards.deployed();
    stakingRewardsAddress = stakingRewards.address;

    // Transfer reward tokens to StakingRewards contract
    let tx = await rewardToken.approve(stakingRewardsAddress, 1000000); //1 million
    await tx.wait();
    let tx2 = await rewardToken.transfer(stakingRewardsAddress, 1000000); //1 million
    await tx2.wait();

    // Transfer staking tokens to other user
    let tx3 = await stakingToken.setApprovalForAll(otherUser.address, true);
    await tx3.wait();
    let tx4 = await stakingToken.safeBatchTransferFrom(deployer.address, otherUser.address, [1, 2, 3, 4], [10, 10, 10, 10], '0x00');
    await tx4.wait();
  });

  describe("#stake", () => {/*
    it("stake() with one investor with one token class when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(0);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(1);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(65);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(65);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(1);

        const balanceOfClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2).to.equal(0);

        const balanceOfClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3).to.equal(0);

        const balanceOfClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4).to.equal(0);
    });

    it("stake() with one investor with multiple token classes when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(1, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(1, 4);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(0);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(4);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(100);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(100);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(1);

        const balanceOfClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2).to.equal(1);

        const balanceOfClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3).to.equal(1);

        const balanceOfClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4).to.equal(1);
    });

    it("stake() with multiple investors with one token class when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx3.wait();

        let tx4 = await stakingRewards.connect(otherUser).stake(1, 1);
        await tx4.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(0);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(2);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(130);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(65);

        const weightedBalanceOther = await stakingRewards.weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(65);

        const balanceOfClass1Deployer = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1Deployer).to.equal(1);

        const balanceOfClass2Deployer = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2Deployer).to.equal(0);

        const balanceOfClass3Deployer = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3Deployer).to.equal(0);

        const balanceOfClass4Deployer = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4Deployer).to.equal(0);

        const balanceOfClass1Other = await stakingRewards.balanceOf(otherUser.address, 1);
        expect(balanceOfClass1Other).to.equal(1);

        const balanceOfClass2Other = await stakingRewards.balanceOf(otherUser.address, 2);
        expect(balanceOfClass2Other).to.equal(0);

        const balanceOfClass3Other = await stakingRewards.balanceOf(otherUser.address, 3);
        expect(balanceOfClass3Other).to.equal(0);

        const balanceOfClass4Other = await stakingRewards.balanceOf(otherUser.address, 4);
        expect(balanceOfClass4Other).to.equal(0);
    });*/

    it("stake() with multiple investors with multiple token classes when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(3, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(4, 4);
        await tx5.wait();

        let tx6 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx6.wait();

        let tx7 = await stakingRewards.connect(otherUser).stake(1, 1);
        await tx7.wait();

        let tx8 = await stakingRewards.connect(otherUser).stake(1, 2);
        await tx8.wait();

        let tx9 = await stakingRewards.connect(otherUser).stake(1, 3);
        await tx9.wait();

        let tx10 = await stakingRewards.connect(otherUser).stake(1, 4);
        await tx10.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(0);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaidDeployer = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaidDeployer).to.equal(0);

        const userRewardPerTokenPaidOther = await stakingRewards.connect(otherUser).userRewardPerTokenPaid(otherUser.address);
        expect(userRewardPerTokenPaidOther).to.equal(0);

        const rewardsDeployer = await stakingRewards.rewards(deployer.address);
        expect(rewardsDeployer).to.equal(0);

        const rewardsOther = await stakingRewards.connect(otherUser).rewards(otherUser.address);
        expect(rewardsOther).to.equal(0);

        const earnedDeployer = await stakingRewards.earned(deployer.address);
        expect(earnedDeployer).to.equal(0);

        const earnedOther = await stakingRewards.connect(otherUser).earned(deployer.address);
        expect(earnedOther).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(14);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(255);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(155);

        const weightedBalanceOther = await stakingRewards.weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(100);

        const balanceOfClass1Deployer = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1Deployer).to.equal(1);

        const balanceOfClass2Deployer = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2Deployer).to.equal(2);

        const balanceOfClass3Deployer = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3Deployer).to.equal(3);

        const balanceOfClass4Deployer = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4Deployer).to.equal(4);

        const balanceOfClass1Other = await stakingRewards.balanceOf(otherUser.address, 1);
        expect(balanceOfClass1Other).to.equal(1);

        const balanceOfClass2Other = await stakingRewards.balanceOf(otherUser.address, 2);
        expect(balanceOfClass2Other).to.equal(1);

        const balanceOfClass3Other = await stakingRewards.balanceOf(otherUser.address, 3);
        expect(balanceOfClass3Other).to.equal(1);

        const balanceOfClass4Other = await stakingRewards.balanceOf(otherUser.address, 4);
        expect(balanceOfClass4Other).to.equal(1);
    });
  });
});