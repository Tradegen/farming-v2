const { expect } = require("chai");
const { parseEther } = require("@ethersproject/units");

describe("PoolManager", () => {
  let deployer;
  let otherUser;

  let scheduleCurrent;
  let scheduleCurrentAddress;
  let scheduleOld;
  let scheduleOldAddress;
  let scheduleFuture;
  let scheduleFutureAddress;
  let ScheduleFactory;

  let rewardToken;
  let rewardTokenAddress;
  let RewardTokenFactory;

  let stakingToken1;
  let stakingToken2;
  let stakingTokenAddress1;
  let stakingTokenAddress2;
  let StakingTokenFactory;

  let releaseEscrowCurrent;
  let releaseEscrowCurrentAddress;
  let releaseEscrowOld;
  let releaseEscrowOldAddress;
  let releaseEscrowFuture;
  let releaseEscrowFutureAddress;
  let ReleaseEscrowFactory;

  let poolManager;
  let poolManagerAddress;
  let PoolManagerFactory;

  let startTimeCurrent;
  let startTimeOld;
  let startTimeFuture;

  const WEEKS_27 = 86400 * 7 * 27;
  const CYCLE_DURATION = 86400 * 7 * 26; // 26 weeks
  
  before(async () => {
    const signers = await ethers.getSigners();
    deployer = signers[0];
    otherUser = signers[1];

    ScheduleFactory = await ethers.getContractFactory('HalveningReleaseSchedule');
    RewardTokenFactory = await ethers.getContractFactory('TestTokenERC20');
    ReleaseEscrowFactory = await ethers.getContractFactory('TestReleaseEscrow');
    PoolManagerFactory = await ethers.getContractFactory('TestPoolManager');
    StakingTokenFactory = await ethers.getContractFactory('TestTokenERC1155');

    startTimeCurrent = Math.floor(Date.now() / 1000) - 100;
    startTimeOld = Math.floor(Date.now() / 1000) - WEEKS_27;
    startTimeFuture = Math.floor(Date.now() / 1000) + 10000;

    scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, startTimeCurrent);
    await scheduleCurrent.deployed();
    scheduleCurrentAddress = scheduleCurrent.address;

    scheduleOld = await ScheduleFactory.deploy(CYCLE_DURATION * 4, startTimeOld);
    await scheduleOld.deployed();
    scheduleOldAddress = scheduleOld.address;

    scheduleFuture = await ScheduleFactory.deploy(CYCLE_DURATION * 4, startTimeFuture);
    await scheduleFuture.deployed();
    scheduleFutureAddress = scheduleFuture.address;

    rewardToken = await RewardTokenFactory.deploy("Test Token", "TEST");
    await rewardToken.deployed();
    rewardTokenAddress = rewardToken.address;

    stakingToken1 = await StakingTokenFactory.deploy();
    await stakingToken1.deployed();
    stakingTokenAddress1 = stakingToken1.address;

    stakingToken2 = await StakingTokenFactory.deploy();
    await stakingToken2.deployed();
    stakingTokenAddress2 = stakingToken2.address;

    releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, startTimeCurrent);
    await releaseEscrowCurrent.deployed();
    releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

    releaseEscrowOld = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleOldAddress, startTimeOld);
    await releaseEscrowOld.deployed();
    releaseEscrowOldAddress = releaseEscrowOld.address;

    releaseEscrowFuture = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleFutureAddress, startTimeFuture);
    await releaseEscrowFuture.deployed();
    releaseEscrowFutureAddress = releaseEscrowFuture.address;

    // Transfer tokens to ReleaseEscrowCurrent
    let tx = await rewardToken.approve(releaseEscrowCurrentAddress, CYCLE_DURATION * 8);
    await tx.wait();
    let tx2 = await rewardToken.transfer(releaseEscrowCurrentAddress, CYCLE_DURATION * 8);
    await tx2.wait();

    // Transfer tokens to ReleaseEscrowOld
    let tx3 = await rewardToken.approve(releaseEscrowOldAddress, CYCLE_DURATION * 8);
    await tx3.wait();
    let tx4 = await rewardToken.transfer(releaseEscrowOldAddress, CYCLE_DURATION * 8);
    await tx4.wait();

    // Transfer tokens to ReleaseEscrowFuture
    let tx5 = await rewardToken.approve(releaseEscrowFutureAddress, CYCLE_DURATION * 8);
    await tx5.wait();
    let tx6 = await rewardToken.transfer(releaseEscrowFutureAddress, CYCLE_DURATION * 8);
    await tx6.wait();
  });

  beforeEach(async () => {
    poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
    await poolManager.deployed();
    poolManagerAddress = poolManager.address;
  });
  /*
  describe("#registerPool", () => {
    it("only pool factory", async () => {
        let tx = poolManager.connect(otherUser).registerPool(stakingTokenAddress1, 1000);
        await expect(tx).to.be.reverted;
    });

    it("pool already exists", async () => {
        let tx = await poolManager.registerPool(stakingTokenAddress1, 1000);
        await tx.wait();

        let tx2 = poolManager.registerPool(stakingTokenAddress1, 1000);
        await expect(tx2).to.be.reverted;
    });

    it("create one pool and get pool info", async () => {
        let tx = await poolManager.registerPool(stakingTokenAddress1, 1000);
        expect(tx).to.emit(poolManager, "RegisteredPool");
        await tx.wait();

        let poolInfo = await poolManager.getPoolInfo(stakingTokenAddress1);
        expect(poolInfo[0]).to.be.true;
        expect(poolInfo[1]).to.be.false;
    });

    it("create two pools and get pool info", async () => {
        let tx = await poolManager.registerPool(stakingTokenAddress1, 1000);
        await tx.wait();

        let tx2 = await poolManager.registerPool(stakingTokenAddress2, 5000);
        await tx2.wait();

        let poolInfo1 = await poolManager.getPoolInfo(stakingTokenAddress1);
        expect(poolInfo1[0]).to.be.true;
        expect(poolInfo1[1]).to.be.false;

        let poolInfo2 = await poolManager.getPoolInfo(stakingTokenAddress2);
        expect(poolInfo2[0]).to.be.true;
        expect(poolInfo2[1]).to.be.false;
        expect(poolInfo2[2]).to.not.equal(poolInfo1[2]);
    });
  });*/
  
  describe("#markPoolAsEligible", () => {
    it("only registered pool", async () => {
        let tx = poolManager.markPoolAsEligible(0, 1000, 10);
        await expect(tx).to.be.reverted;
    });

    it("pool doesn't meet minimum criteria", async () => {
        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.markPoolAsEligible(startTimeCurrent, parseEther("10000"), 20);
        await tx2.wait();

        let poolInfo = await poolManager.getPoolInfo(deployer.address);
        expect(poolInfo[1]).to.be.false;

        let tx3 = await poolManager.markPoolAsEligible(0, 0, 20);
        await tx3.wait();

        poolInfo = await poolManager.getPoolInfo(deployer.address);
        expect(poolInfo[1]).to.be.false;

        let tx4 = await poolManager.markPoolAsEligible(0, parseEther("10000"), 0);
        await tx4.wait();

        poolInfo = await poolManager.getPoolInfo(deployer.address);
        expect(poolInfo[1]).to.be.false;
    });

    it("pool meets criteria; no other pools", async () => {
        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.markPoolAsEligible(0, parseEther("10000"), 20);
        await tx2.wait();

        let poolInfo = await poolManager.getPoolInfo(deployer.address);
        expect(poolInfo[0]).to.be.true;
        expect(poolInfo[1]).to.be.true;
    });

    it("pool meets criteria; one other pool", async () => {
        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.connect(otherUser).setPoolInfo(otherUser.address, true, false, otherUser.address, 0, 0, 0, 0, 0);
        await tx2.wait();

        let tx3 = await poolManager.markPoolAsEligible(0, parseEther("10000"), 20);
        await tx3.wait();

        let poolInfo1 = await poolManager.getPoolInfo(deployer.address);
        expect(poolInfo1[0]).to.be.true;
        expect(poolInfo1[1]).to.be.true;
        expect(poolInfo1[2]).to.equal(deployer.address);

        let tx4 = await poolManager.connect(otherUser).markPoolAsEligible(0, parseEther("10000"), 20);
        await tx4.wait();

        let poolInfo2 = await poolManager.connect(otherUser).getPoolInfo(otherUser.address);
        expect(poolInfo2[0]).to.be.true;
        expect(poolInfo2[1]).to.be.true;
        expect(poolInfo2[2]).to.equal(otherUser.address);
    });
  });
});