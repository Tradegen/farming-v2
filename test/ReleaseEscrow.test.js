const { expect } = require("chai");

describe("ReleaseEscrow", () => {
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

  let releaseEscrowCurrent;
  let releaseEscrowCurrentAddress;
  let releaseEscrowOld;
  let releaseEscrowOldAddress;
  let releaseEscrowFuture;
  let releaseEscrowFutureAddress;
  let ReleaseEscrowFactory;

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
  
  describe("#data", () => {
    it("lifetime rewards", async () => {
        const rewards = await releaseEscrowOld.lifetimeRewards();

        expect(rewards).to.equal(CYCLE_DURATION * 8);
    });

    it("distributed rewards", async () => {
        const rewards = await releaseEscrowOld.distributedRewards();

        expect(rewards).to.equal(0);
    });

    it("remaining rewards", async () => {
        const rewards = await releaseEscrowOld.remainingRewards();

        expect(rewards).to.equal(CYCLE_DURATION * 8);
    });

    it("released rewards", async () => {
        const rewards = await releaseEscrowOld.releasedRewards();

        expect(rewards).to.equal(0);
    });

    it("unclaimed rewards", async () => {
        const rewards = await releaseEscrowOld.unclaimedRewards();

        expect(rewards).to.equal(0);
    });
  });
});