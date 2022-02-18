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
  /*
  describe("#stake", () => {
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
    });

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

  describe("#withdraw without rewards", () => {
    it("withdraw() partial amount of one token class with one investor when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        const beforeBalance = await stakingToken.balanceOf(deployer.address, 1);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.withdraw(1, 1);
        await tx3.wait();

        const afterBalance = await stakingToken.balanceOf(deployer.address, 1);

        expect(afterBalance).to.equal(Number(beforeBalance) - 1);

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

    it("withdraw() full amount of one token class with one investor when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        const beforeBalance = await stakingToken.balanceOf(deployer.address, 1);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.withdraw(2, 1);
        await tx3.wait();

        const afterBalance = await stakingToken.balanceOf(deployer.address, 1);

        expect(afterBalance).to.equal(Number(beforeBalance));

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
        expect(totalSupply).to.equal(0);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(0);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(0);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(0);

        const balanceOfClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2).to.equal(0);

        const balanceOfClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3).to.equal(0);

        const balanceOfClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4).to.equal(0);
    });

    it("withdraw() partial amount of multiple token classes with one investor when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        const beforeBalanceClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const beforeBalanceClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const beforeBalanceClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const beforeBalanceClass4 = await stakingToken.balanceOf(deployer.address, 4);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(2, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(2, 4);
        await tx5.wait();

        let tx6 = await stakingRewards.withdraw(1, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.withdraw(1, 2);
        await tx7.wait();

        let tx8 = await stakingRewards.withdraw(1, 3);
        await tx8.wait();

        let tx9 = await stakingRewards.withdraw(1, 4);
        await tx9.wait();

        const afterBalanceClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const afterBalanceClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const afterBalanceClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const afterBalanceClass4 = await stakingToken.balanceOf(deployer.address, 4);

        expect(afterBalanceClass1).to.equal(Number(beforeBalanceClass1) - 1);
        expect(afterBalanceClass2).to.equal(Number(beforeBalanceClass2) - 1);
        expect(afterBalanceClass3).to.equal(Number(beforeBalanceClass3) - 1);
        expect(afterBalanceClass4).to.equal(Number(beforeBalanceClass4) - 1);

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

    it("withdraw() full amount of multiple token classes with one investor when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        const beforeBalanceClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const beforeBalanceClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const beforeBalanceClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const beforeBalanceClass4 = await stakingToken.balanceOf(deployer.address, 4);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(2, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(2, 4);
        await tx5.wait();

        let tx6 = await stakingRewards.withdraw(2, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.withdraw(2, 2);
        await tx7.wait();

        let tx8 = await stakingRewards.withdraw(1, 3);
        await tx8.wait();

        let tx9 = await stakingRewards.withdraw(2, 4);
        await tx9.wait();

        const afterBalanceClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const afterBalanceClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const afterBalanceClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const afterBalanceClass4 = await stakingToken.balanceOf(deployer.address, 4);

        expect(afterBalanceClass1).to.equal(Number(beforeBalanceClass1));
        expect(afterBalanceClass2).to.equal(Number(beforeBalanceClass2));
        expect(afterBalanceClass3).to.equal(Number(beforeBalanceClass3) - 1);
        expect(afterBalanceClass4).to.equal(Number(beforeBalanceClass4));

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
        expect(weightedTotalSupply).to.equal(10);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(10);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(0);

        const balanceOfClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2).to.equal(0);

        const balanceOfClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3).to.equal(1);

        const balanceOfClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfClass4).to.equal(0);
    });

    it("withdraw() partial amount of multiple token classes with multiple investors when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx1 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx1.wait();

        const beforeBalanceDeployerClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const beforeBalanceDeployerClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const beforeBalanceDeployerClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const beforeBalanceDeployerClass4 = await stakingToken.balanceOf(deployer.address, 4);

        const beforeBalanceOtherClass1 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 1);
        const beforeBalanceOtherClass2 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 2);
        const beforeBalanceOtherClass3 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 3);
        const beforeBalanceOtherClass4 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 4);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(2, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(2, 4);
        await tx5.wait();

        let tx6 = await stakingRewards.connect(otherUser).stake(2, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.connect(otherUser).stake(2, 2);
        await tx7.wait();

        let tx8 = await stakingRewards.connect(otherUser).stake(2, 3);
        await tx8.wait();

        let tx9 = await stakingRewards.connect(otherUser).stake(2, 4);
        await tx9.wait();

        let tx10 = await stakingRewards.withdraw(1, 1);
        await tx10.wait();

        let tx11 = await stakingRewards.withdraw(1, 2);
        await tx11.wait();

        let tx12 = await stakingRewards.withdraw(1, 3);
        await tx12.wait();

        let tx13 = await stakingRewards.withdraw(1, 4);
        await tx13.wait();

        let tx14 = await stakingRewards.connect(otherUser).withdraw(1, 1);
        await tx14.wait();

        let tx15 = await stakingRewards.connect(otherUser).withdraw(1, 2);
        await tx15.wait();

        let tx16 = await stakingRewards.connect(otherUser).withdraw(1, 3);
        await tx16.wait();

        let tx17 = await stakingRewards.connect(otherUser).withdraw(1, 4);
        await tx17.wait();

        const afterBalanceDeployerClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const afterBalanceDeployerClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const afterBalanceDeployerClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const afterBalanceDeployerClass4 = await stakingToken.balanceOf(deployer.address, 4);
        const afterBalanceOtherClass1 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 1);
        const afterBalanceOtherClass2 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 2);
        const afterBalanceOtherClass3 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 3);
        const afterBalanceOtherClass4 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 4);

        expect(afterBalanceDeployerClass1).to.equal(Number(beforeBalanceDeployerClass1) - 1);
        expect(afterBalanceDeployerClass2).to.equal(Number(beforeBalanceDeployerClass2) - 1);
        expect(afterBalanceDeployerClass3).to.equal(Number(beforeBalanceDeployerClass3) - 1);
        expect(afterBalanceDeployerClass4).to.equal(Number(beforeBalanceDeployerClass4) - 1);
        expect(afterBalanceOtherClass1).to.equal(Number(beforeBalanceOtherClass1) - 1);
        expect(afterBalanceOtherClass2).to.equal(Number(beforeBalanceOtherClass2) - 1);
        expect(afterBalanceOtherClass3).to.equal(Number(beforeBalanceOtherClass3) - 1);
        expect(afterBalanceOtherClass4).to.equal(Number(beforeBalanceOtherClass4) - 1);

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

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(8);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(200);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(100);

        const weightedBalanceOther = await stakingRewards.connect(otherUser).weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(100);

        const balanceOfDeployerClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfDeployerClass1).to.equal(1);

        const balanceOfDeployerClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfDeployerClass2).to.equal(1);

        const balanceOfDeployerClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfDeployerClass3).to.equal(1);

        const balanceOfDeployerClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfDeployerClass4).to.equal(1);

        const balanceOfOtherClass1 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 1);
        expect(balanceOfOtherClass1).to.equal(1);

        const balanceOfOtherClass2 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 2);
        expect(balanceOfOtherClass2).to.equal(1);

        const balanceOfOtherClass3 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 3);
        expect(balanceOfOtherClass3).to.equal(1);

        const balanceOfOtherClass4 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 4);
        expect(balanceOfOtherClass4).to.equal(1);
    });

    it("withdraw() full amount of multiple token classes with multiple investors when distribution has not started", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx1 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx1.wait();

        const beforeBalanceDeployerClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const beforeBalanceDeployerClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const beforeBalanceDeployerClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const beforeBalanceDeployerClass4 = await stakingToken.balanceOf(deployer.address, 4);

        const beforeBalanceOtherClass1 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 1);
        const beforeBalanceOtherClass2 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 2);
        const beforeBalanceOtherClass3 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 3);
        const beforeBalanceOtherClass4 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 4);

        let tx2 = await stakingRewards.stake(2, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(2, 3);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(2, 4);
        await tx5.wait();

        let tx6 = await stakingRewards.connect(otherUser).stake(2, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.connect(otherUser).stake(2, 2);
        await tx7.wait();

        let tx8 = await stakingRewards.connect(otherUser).stake(2, 3);
        await tx8.wait();

        let tx9 = await stakingRewards.connect(otherUser).stake(2, 4);
        await tx9.wait();

        let tx10 = await stakingRewards.withdraw(2, 1);
        await tx10.wait();

        let tx11 = await stakingRewards.withdraw(1, 2);
        await tx11.wait();

        let tx12 = await stakingRewards.withdraw(2, 3);
        await tx12.wait();

        let tx13 = await stakingRewards.withdraw(1, 4);
        await tx13.wait();

        let tx14 = await stakingRewards.connect(otherUser).withdraw(2, 1);
        await tx14.wait();

        let tx15 = await stakingRewards.connect(otherUser).withdraw(1, 2);
        await tx15.wait();

        let tx16 = await stakingRewards.connect(otherUser).withdraw(1, 3);
        await tx16.wait();

        let tx17 = await stakingRewards.connect(otherUser).withdraw(2, 4);
        await tx17.wait();

        const afterBalanceDeployerClass1 = await stakingToken.balanceOf(deployer.address, 1);
        const afterBalanceDeployerClass2 = await stakingToken.balanceOf(deployer.address, 2);
        const afterBalanceDeployerClass3 = await stakingToken.balanceOf(deployer.address, 3);
        const afterBalanceDeployerClass4 = await stakingToken.balanceOf(deployer.address, 4);
        const afterBalanceOtherClass1 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 1);
        const afterBalanceOtherClass2 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 2);
        const afterBalanceOtherClass3 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 3);
        const afterBalanceOtherClass4 = await stakingToken.connect(otherUser).balanceOf(otherUser.address, 4);

        expect(afterBalanceDeployerClass1).to.equal(Number(beforeBalanceDeployerClass1));
        expect(afterBalanceDeployerClass2).to.equal(Number(beforeBalanceDeployerClass2) - 1);
        expect(afterBalanceDeployerClass3).to.equal(Number(beforeBalanceDeployerClass3));
        expect(afterBalanceDeployerClass4).to.equal(Number(beforeBalanceDeployerClass4) - 1);
        expect(afterBalanceOtherClass1).to.equal(Number(beforeBalanceOtherClass1));
        expect(afterBalanceOtherClass2).to.equal(Number(beforeBalanceOtherClass2) - 1);
        expect(afterBalanceOtherClass3).to.equal(Number(beforeBalanceOtherClass3) - 1);
        expect(afterBalanceOtherClass4).to.equal(Number(beforeBalanceOtherClass4));

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

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(4);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(55);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(25);

        const weightedBalanceOther = await stakingRewards.connect(otherUser).weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(30);

        const balanceOfDeployerClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfDeployerClass1).to.equal(0);

        const balanceOfDeployerClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfDeployerClass2).to.equal(1);

        const balanceOfDeployerClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfDeployerClass3).to.equal(0);

        const balanceOfDeployerClass4 = await stakingRewards.balanceOf(deployer.address, 4);
        expect(balanceOfDeployerClass4).to.equal(1);

        const balanceOfOtherClass1 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 1);
        expect(balanceOfOtherClass1).to.equal(0);

        const balanceOfOtherClass2 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 2);
        expect(balanceOfOtherClass2).to.equal(1);

        const balanceOfOtherClass3 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 3);
        expect(balanceOfOtherClass3).to.equal(1);

        const balanceOfOtherClass4 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 4);
        expect(balanceOfOtherClass4).to.equal(0);
    });
  });*/

  describe("#addReward without claiming", () => {/*
    it("addReward() once with no users staked", async () => {
        let tx = await stakingRewards.addReward(100000);
        expect(tx).to.emit(stakingRewards, "RewardAdded");
        await tx.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(100000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    it("addReward() multiple times with no users staked", async () => {
        let tx = await stakingRewards.addReward(100000);
        await tx.wait();

        let tx2 = await stakingRewards.addReward(400000);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(500000);
        await tx3.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(1000000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    it("addReward() once with one user staked after", async () => {
        let tx = await stakingRewards.addReward(100000);
        await tx.wait();

        let tx2 = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 1);
        await tx3.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(100000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    it("addReward() multiple times with one user staked after", async () => {
        let tx = await stakingRewards.addReward(100000);
        await tx.wait();

        let tx2 = await stakingRewards.addReward(400000);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(500000);
        await tx3.wait();

        let tx4 = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(1, 1);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(1000000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(0);

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    it("addReward() once with one user staked before", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(100000);
        await tx3.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(100000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1538); // floor(100000 / 65)

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(99970); // 1538 * 65
    });

    it("addReward() multiple times with one user staked before", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(100000);
        await tx3.wait();

        let tx4 = await stakingRewards.addReward(550000);
        await tx4.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(650000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(9999); // floor(100000 / 65) + floor(550000 / 65)

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(0);

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(0);

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(649935); // 9999 * 65
    });

    it("addReward() once with multiple users staked after", async () => {
        let tx = await stakingRewards.addReward(100000);
        await tx.wait();

        let tx2 = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(1, 1);
        await tx4.wait();

        let tx5 = await stakingRewards.connect(otherUser).stake(1, 1);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(100000);

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

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(0);
    });

    it("addReward() once with multiple users staked before in one token class", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 1);
        await tx3.wait();

        let tx4 = await stakingRewards.connect(otherUser).stake(1, 1);
        await tx4.wait();

        let tx5 = await stakingRewards.addReward(130000);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(130000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1000);

        const userRewardPerTokenPaidDeployer = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaidDeployer).to.equal(0);

        const userRewardPerTokenPaidOther = await stakingRewards.connect(otherUser).userRewardPerTokenPaid(otherUser.address);
        expect(userRewardPerTokenPaidOther).to.equal(0);

        const rewardsDeployer = await stakingRewards.rewards(deployer.address);
        expect(rewardsDeployer).to.equal(0);

        const rewardsOther = await stakingRewards.connect(otherUser).rewards(otherUser.address);
        expect(rewardsOther).to.equal(0);

        const earnedDeployer = await stakingRewards.earned(deployer.address);
        expect(earnedDeployer).to.equal(65000);

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(65000);
    });

    it("addReward() once with multiple users staked before in multiple token classes", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 1);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(2, 2);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(1, 4);
        await tx5.wait();

        let tx6 = await stakingRewards.connect(otherUser).stake(2, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.connect(otherUser).stake(1, 3);
        await tx7.wait();

        let tx8 = await stakingRewards.addReward(250000);
        await tx8.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(250000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1000);

        const userRewardPerTokenPaidDeployer = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaidDeployer).to.equal(0);

        const userRewardPerTokenPaidOther = await stakingRewards.connect(otherUser).userRewardPerTokenPaid(otherUser.address);
        expect(userRewardPerTokenPaidOther).to.equal(0);

        const rewardsDeployer = await stakingRewards.rewards(deployer.address);
        expect(rewardsDeployer).to.equal(0);

        const rewardsOther = await stakingRewards.connect(otherUser).rewards(otherUser.address);
        expect(rewardsOther).to.equal(0);

        const earnedDeployer = await stakingRewards.earned(deployer.address);
        expect(earnedDeployer).to.equal(110000);

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(140000);
    });

    it("addReward() with one user staked before and same user staked after; one token class", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(65000);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(1, 1);
        await tx4.wait();

        let tx5 = await stakingRewards.addReward(65000);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(130000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1500); // 1000 + floor(65000 / 130)

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(1000); // staked when rewardPerToken was 1000

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(65000); // staked when rewardPerToken was 1000

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(130000);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(2);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(130);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(130);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(2);
    });

    it("addReward() with one user staked before and same user staked after; multiple token classes", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(2, 2);
        await tx3.wait();

        let tx4 = await stakingRewards.addReward(105000);
        await tx4.wait();

        let tx5 = await stakingRewards.stake(1, 3);
        await tx5.wait();

        let tx6 = await stakingRewards.stake(1, 1);
        await tx6.wait();

        let tx7 = await stakingRewards.addReward(180000);
        await tx7.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(285000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(2000); // 1000 + floor(180000 / 180)

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(1000); // staked when rewardPerToken was 1000

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(105000); // staked when rewardPerToken was 1000

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(285000);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(5);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(180);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(180);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(2);

        const balanceOfClass2 = await stakingRewards.balanceOf(deployer.address, 2);
        expect(balanceOfClass2).to.equal(2);

        const balanceOfClass3 = await stakingRewards.balanceOf(deployer.address, 3);
        expect(balanceOfClass3).to.equal(1);
    });

    it("addReward() with one user staked before and same user staked after without adding new rewards", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingRewards.stake(1, 1);
        await tx2.wait();

        let tx3 = await stakingRewards.addReward(65000);
        await tx3.wait();

        let tx4 = await stakingRewards.stake(1, 1);
        await tx4.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(65000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1000); // floor(65000 / 65)

        const userRewardPerTokenPaid = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaid).to.equal(1000); // staked again when rewardPerToken was 1000

        const rewards = await stakingRewards.rewards(deployer.address);
        expect(rewards).to.equal(65000); // staked again when rewardPerToken was 1000

        const earned = await stakingRewards.earned(deployer.address);
        expect(earned).to.equal(65000);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(2);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(130);

        const weightedBalance = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalance).to.equal(130);

        const balanceOfClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfClass1).to.equal(2);
    });

    it("addReward() with one user staked before and different user staked after without adding new rewards", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 1);
        await tx3.wait();

        let tx4 = await stakingRewards.addReward(65000);
        await tx4.wait();

        let tx5 = await stakingRewards.connect(otherUser).stake(1, 1);
        await tx5.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(65000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(1000); // floor(65000 / 65)

        const userRewardPerTokenPaidDeployer = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaidDeployer).to.equal(0); // staked when rewardPerToken was 0

        const userRewardPerTokenPaidOther = await stakingRewards.connect(otherUser).userRewardPerTokenPaid(otherUser.address);
        expect(userRewardPerTokenPaidOther).to.equal(1000); // staked when rewardPerToken was 1000

        const rewardsDeployer = await stakingRewards.rewards(deployer.address);
        expect(rewardsDeployer).to.equal(0); // staked when rewardPerToken was 0

        const rewardsOther = await stakingRewards.connect(otherUser).rewards(otherUser.address);
        expect(rewardsOther).to.equal(0); // staked when rewardPerToken was 1000

        const earnedDeployer = await stakingRewards.earned(deployer.address);
        expect(earnedDeployer).to.equal(65000);

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(0);

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(2);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(130);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(65);

        const weightedBalanceOther = await stakingRewards.connect(otherUser).weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(65);

        const balanceOfDeployerClass1 = await stakingRewards.balanceOf(deployer.address, 1);
        expect(balanceOfDeployerClass1).to.equal(1);

        const balanceOfOtherClass1 = await stakingRewards.connect(otherUser).balanceOf(otherUser.address, 1);
        expect(balanceOfOtherClass1).to.equal(1);
    });*/

    it("addReward() with one user staked before and different user staked after with new rewards", async () => {
        let tx = await stakingToken.setApprovalForAll(stakingRewardsAddress, true);
        await tx.wait();

        let tx2 = await stakingToken.connect(otherUser).setApprovalForAll(stakingRewardsAddress, true);
        await tx2.wait();

        let tx3 = await stakingRewards.stake(1, 1);
        await tx3.wait();

        let tx4 = await stakingRewards.addReward(65000);
        await tx4.wait();

        let tx5 = await stakingRewards.connect(otherUser).stake(3, 2);
        await tx5.wait();

        let tx6 = await stakingRewards.addReward(125000);
        await tx6.wait();

        const totalAvailableRewards = await stakingRewards.totalAvailableRewards();
        expect(totalAvailableRewards).to.equal(190000);

        const rewardPerTokenStored = await stakingRewards.rewardPerTokenStored();
        expect(rewardPerTokenStored).to.equal(2000); // floor(65000 / 65) + floor(125000 / 125)

        const userRewardPerTokenPaidDeployer = await stakingRewards.userRewardPerTokenPaid(deployer.address);
        expect(userRewardPerTokenPaidDeployer).to.equal(0); // staked when rewardPerToken was 0

        const userRewardPerTokenPaidOther = await stakingRewards.connect(otherUser).userRewardPerTokenPaid(otherUser.address);
        expect(userRewardPerTokenPaidOther).to.equal(1000); // staked when rewardPerToken was 1000

        const rewardsDeployer = await stakingRewards.rewards(deployer.address);
        expect(rewardsDeployer).to.equal(0); // staked when rewardPerToken was 0

        const rewardsOther = await stakingRewards.connect(otherUser).rewards(otherUser.address);
        expect(rewardsOther).to.equal(0); // staked when rewardPerToken was 1000

        const earnedDeployer = await stakingRewards.earned(deployer.address);
        expect(earnedDeployer).to.equal(130000); // 65 * 2000

        const earnedOther = await stakingRewards.connect(otherUser).earned(otherUser.address);
        expect(earnedOther).to.equal(60000); // 60 * (2000 - 1000)

        const totalSupply = await stakingRewards.totalSupply();
        expect(totalSupply).to.equal(4);

        const weightedTotalSupply = await stakingRewards.weightedTotalSupply();
        expect(weightedTotalSupply).to.equal(125);

        const weightedBalanceDeployer = await stakingRewards.weightedBalance(deployer.address);
        expect(weightedBalanceDeployer).to.equal(65);

        const weightedBalanceOther = await stakingRewards.connect(otherUser).weightedBalance(otherUser.address);
        expect(weightedBalanceOther).to.equal(60);
    });
  });
});