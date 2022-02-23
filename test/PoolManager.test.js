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

  const ONE_WEEK = 86400 * 7;
  const WEEKS_27 = ONE_WEEK * 27;
  const CYCLE_DURATION = ONE_WEEK * 26; // 26 weeks
  
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

    releaseEscrowOld = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleOldAddress, startTimeOld);
    await releaseEscrowOld.deployed();
    releaseEscrowOldAddress = releaseEscrowOld.address;

    releaseEscrowFuture = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleFutureAddress, startTimeFuture);
    await releaseEscrowFuture.deployed();
    releaseEscrowFutureAddress = releaseEscrowFuture.address;

    // Transfer tokens to ReleaseEscrowOld
    let tx = await rewardToken.approve(releaseEscrowOldAddress, CYCLE_DURATION * 8);
    await tx.wait();
    let tx2 = await rewardToken.transfer(releaseEscrowOldAddress, CYCLE_DURATION * 8);
    await tx2.wait();

    // Transfer tokens to ReleaseEscrowFuture
    let tx3 = await rewardToken.approve(releaseEscrowFutureAddress, CYCLE_DURATION * 8);
    await tx3.wait();
    let tx4 = await rewardToken.transfer(releaseEscrowFutureAddress, CYCLE_DURATION * 8);
    await tx4.wait();
  });

  beforeEach(async () => {
    scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, startTimeCurrent);
    await scheduleCurrent.deployed();
    scheduleCurrentAddress = scheduleCurrent.address;

    releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, startTimeCurrent);
    await releaseEscrowCurrent.deployed();
    releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

    poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
    await poolManager.deployed();
    poolManagerAddress = poolManager.address;

    // Transfer tokens to ReleaseEscrowCurrent
    let tx = await rewardToken.approve(releaseEscrowCurrentAddress, CYCLE_DURATION * 8);
    await tx.wait();
    let tx2 = await rewardToken.transfer(releaseEscrowCurrentAddress, CYCLE_DURATION * 8);
    await tx2.wait();
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
  /*
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

  describe("#getPeriodIndex", () => {
    it("timestamp must be greater than start time", async () => {
        await expect(poolManager.getPeriodIndex(startTimeCurrent - ONE_WEEK)).to.be.reverted;
    });

    it("timestamp in period 0", async () => {
        let current = Math.floor(Date.now() / 1000);
        let index = await poolManager.getPeriodIndex(current + 100);
        expect(index).to.equal(0);
    });

    it("timestamp in period 1", async () => {
        let current = Math.floor(Date.now() / 1000);
        let index = await poolManager.getPeriodIndex(current + 1000 + ONE_WEEK + ONE_WEEK);
        expect(index).to.equal(1);
    });
  });

  describe("#getStartOfPeriod", () => {
    it("index must be positive", async () => {
        await expect(poolManager.getStartOfPeriod(0)).to.be.reverted;
    });

    it("start of period 0", async () => {
        let current = Math.floor(Date.now() / 1000);
        let index = await poolManager.getStartOfPeriod(0);
        expect(index).to.equal(current);
    });

    it("start of period 1", async () => {
        let current = Math.floor(Date.now() / 1000);
        let index = await poolManager.getStartOfPeriod(1);
        expect(index).to.equal(current + ONE_WEEK + ONE_WEEK);
    });
  });

  describe("#rewardPerToken", () => {
    it("0 total weight in current period and period index is 0", async () => {
        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(0);
    });

    it("0 total weight in current period and previous period", async () => {
        let current = Math.floor(Date.now() / 1000);

        let tx = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(0);
    });

    it("period 0", async () => {
        let current = await poolManager.getCurrentTime();

        let tx = await poolManager.setStartTime(current - 100);
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - 100);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx3.wait();
        
        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));
    });

    // Accounts for difference of 6 seconds between local time and block.timestamp
    it("period 1", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - ONE_WEEK - ONE_WEEK - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - ONE_WEEK - ONE_WEEK - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK + ONE_WEEK);
        await tx3.wait();
        
        let rewardPerToken = await poolManager.rewardPerToken();
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(45649); // floor(4838824 * 1e18 / 106)
    });

    // Accounts for difference of 7 seconds between local time and block.timestamp
    it("weights in two periods; test values", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - (ONE_WEEK * 3));
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - (ONE_WEEK * 3));
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - (ONE_WEEK * 3));
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - (ONE_WEEK * 3));
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK * 2);
        await tx3.wait();

        let tx4 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK * 4);
        await tx4.wait();
        
        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));
    });

    // Accounts for difference of 7 seconds between local time and block.timestamp
    it("weights in two periods; production values", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(parseEther("125000000"), current - (ONE_WEEK * 3));
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - (ONE_WEEK * 3));
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - (ONE_WEEK * 3));
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - (ONE_WEEK * 3));
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(0, parseEther("20000"));
        await tx3.wait();

        let tx4 = await poolManager.setGlobalPeriodInfo(1, parseEther("40000"));
        await tx4.wait();
        
        let rewardPerToken = await poolManager.rewardPerToken();
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e16);
        expect(Number(flooredResult)).to.equal(48076); // [(3 * 125e24 * 1e18) / (26 * 30e21)] / 1e16
    });

    it("cross-cycle; same weight across 2 periods", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - (27 * ONE_WEEK));
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - (27 * ONE_WEEK));
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - (27 * ONE_WEEK));
        await tx.wait();

        // One week in cycle 0, one week in cycle 1
        let tx2 = await poolManager.setLastUpdateTime(current - (2 * ONE_WEEK));
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(12, ONE_WEEK + ONE_WEEK);
        await tx3.wait();

        let tx4 = await poolManager.setGlobalPeriodInfo(13, ONE_WEEK + ONE_WEEK);
        await tx4.wait();
        
        let rewardPerToken = await poolManager.rewardPerToken();
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(3); // [(3628814 * 1e18) / 1209600] / 1e18
    });
  });*/

  describe("#earned", () => {/*
    it("0 pool weight in current period and global weight is 0", async () => {
        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    it("0 pool weight in current period and global weight is non-zero; one pool, period 0", async () => {
        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx2.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(0);
    });

    // Accounts for 5 seconds delay between local time and block.timestamp
    it("non-zero pool weight in current period and global weight is non-zero; one pool, period 0", async () => {
        let current = await poolManager.getCurrentTime();

        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx2.wait();

        // Same as global weight
        let tx3 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx3.wait();

        let tx4 = await poolManager.setStartTime(current - 100);
        await tx4.wait();

        let tx5 = await poolManager.setLastUpdateTime(current - 100);
        await tx5.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(420);
    });*/
    /*
    // Accounts for 9 seconds delay between local time and block.timestamp
    it("0 pool weight in current period and global weight is non-zero; multiple pools, period 0", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - 100);
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - 100);
        await tx2.wait();

        let tx3 = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx3.wait();

        let tx4 = await poolManager.setPoolInfo(otherUser.address, true, false, otherUser.address, 0, 0, 0, 0, 0);
        await tx4.wait();

        // Same as global weight
        let tx5 = await poolManager.setPoolPeriodInfo(otherUser.address, 0, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx5.wait();

        let tx6 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx6.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));

        let earnedDeployer = await poolManager.earned(deployer.address);
        expect(earnedDeployer).to.equal(0);

        let earnedOther = await poolManager.earned(otherUser.address);
        expect(earnedOther).to.equal(436);
    });

    // Accounts for 10 seconds delay between local time and block.timestamp
    it("non-zero pool weight in current period and global weight is non-zero; multiple pools, period 0", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setStartTime(current - 100);
        await tx.wait();

        let tx2 = await poolManager.setLastUpdateTime(current - 100);
        await tx2.wait();

        let tx3 = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx3.wait();

        let tx4 = await poolManager.setPoolInfo(otherUser.address, true, false, otherUser.address, 0, 0, 0, 0, 0);
        await tx4.wait();

        // Global weight / 2
        let tx5 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, ONE_WEEK);
        await tx5.wait();

        // Global weight / 2
        let tx6 = await poolManager.setPoolPeriodInfo(otherUser.address, 0, 0, 0, ONE_WEEK);
        await tx6.wait();

        let tx7 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx7.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        expect(rewardPerToken).to.equal(parseEther("4"));

        let earnedDeployer = await poolManager.earned(deployer.address);
        expect(earnedDeployer).to.equal(220);

        let earnedOther = await poolManager.earned(otherUser.address);
        expect(earnedOther).to.equal(220);
    });

    // Accounts for 10 seconds delay between local time and block.timestamp
    it("non-zero pool weight in period 1, 0 pool weight in previous period, and global weight is non-zero in period 1; one pool", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - ONE_WEEK - ONE_WEEK - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - ONE_WEEK - ONE_WEEK - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setGlobalPeriodInfo(0, 0);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK + ONE_WEEK);
        await tx3.wait();

        // 0 weight in period 0
        let tx4 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, 0);
        await tx4.wait();

        // Same as global weight in period 1
        let tx5 = await poolManager.setPoolPeriodInfo(deployer.address, 1, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx5.wait();

        let tx6 = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx6.wait();

        let tx7 = await poolManager.setLastUpdateTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx7.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(43989); // floor(4838839 * 1e18 / 110)

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(4838839);
    });

    // Accounts for 10 seconds delay between local time and block.timestamp
    it("non-zero pool weight in period 1, 0 pool weight in previous period, and global weight is non-zero in both periods; one pool", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - ONE_WEEK - ONE_WEEK - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - ONE_WEEK - ONE_WEEK - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK + ONE_WEEK);
        await tx3.wait();

        // 0 weight in period 0
        let tx4 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, 0);
        await tx4.wait();

        // Same as global weight in period 1
        let tx5 = await poolManager.setPoolPeriodInfo(deployer.address, 1, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx5.wait();

        let tx6 = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx6.wait();

        let tx7 = await poolManager.setLastUpdateTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx7.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        console.log(rewardPerToken.toString());
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(4); // floor(4838839 * 1e18 / 1209700)

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(440);
    });

    // Accounts for 10 seconds delay between local time and block.timestamp
    it("non-zero pool weight in period 1, non-zero pool weight in previous period, and global weight is non-zero in both periods; one pool", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - ONE_WEEK - ONE_WEEK - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - ONE_WEEK - ONE_WEEK - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK + ONE_WEEK);
        await tx3.wait();

        // Same as global weight in period 0
        let tx4 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx4.wait();

        // Same as global weight in period 1
        let tx5 = await poolManager.setPoolPeriodInfo(deployer.address, 1, 0, 0, ONE_WEEK + ONE_WEEK);
        await tx5.wait();

        let tx6 = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx6.wait();

        let tx7 = await poolManager.setLastUpdateTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx7.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        console.log(rewardPerToken.toString());
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(4); // floor(4838839 * 1e18 / 1209700)

        let earned = await poolManager.earned(deployer.address);
        expect(earned).to.equal(4838839);
    });*/

    // Accounts for 12 seconds delay between local time and block.timestamp
    it("non-zero pool weight in period 1, non-zero pool weight in previous period, and global weight is non-zero in both periods; multiple pools", async () => {
        let current = await poolManager.getCurrentTime();

        scheduleCurrent = await ScheduleFactory.deploy(CYCLE_DURATION * 4, current - ONE_WEEK - ONE_WEEK - 100);
        await scheduleCurrent.deployed();
        scheduleCurrentAddress = scheduleCurrent.address;

        releaseEscrowCurrent = await ReleaseEscrowFactory.deploy(otherUser.address, rewardTokenAddress, scheduleCurrentAddress, current - ONE_WEEK - ONE_WEEK - 100);
        await releaseEscrowCurrent.deployed();
        releaseEscrowCurrentAddress = releaseEscrowCurrent.address;

        poolManager = await PoolManagerFactory.deploy(rewardTokenAddress, releaseEscrowCurrentAddress, scheduleCurrentAddress, deployer.address);
        await poolManager.deployed();
        poolManagerAddress = poolManager.address;

        let tx = await poolManager.setPoolInfo(deployer.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx.wait();

        let tx2 = await poolManager.setPoolInfo(otherUser.address, true, false, deployer.address, 0, 0, 0, 0, 0);
        await tx2.wait();

        let tx3 = await poolManager.setGlobalPeriodInfo(0, ONE_WEEK + ONE_WEEK );
        await tx3.wait();

        let tx4 = await poolManager.setGlobalPeriodInfo(1, ONE_WEEK + ONE_WEEK);
        await tx4.wait();

        // (Global weight / 2) in period 0
        let tx5 = await poolManager.setPoolPeriodInfo(deployer.address, 0, 0, 0, ONE_WEEK * 1.5);
        await tx5.wait();

        // (Global weight / 2) in period 1
        let tx6 = await poolManager.setPoolPeriodInfo(deployer.address, 1, 0, 0, ONE_WEEK * 1.5);
        await tx6.wait();

        // (Global weight / 2) in period 0
        let tx7 = await poolManager.setPoolPeriodInfo(otherUser.address, 0, 0, 0, ONE_WEEK * 0.5);
        await tx7.wait();

        // (Global weight / 2) in period 1
        let tx8 = await poolManager.setPoolPeriodInfo(otherUser.address, 1, 0, 0, ONE_WEEK * 0.5);
        await tx8.wait();

        let tx9 = await poolManager.setStartTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx9.wait();

        let tx10 = await poolManager.setLastUpdateTime(current - ONE_WEEK - ONE_WEEK - 100);
        await tx10.wait();

        let rewardPerToken = await poolManager.rewardPerToken();
        console.log(rewardPerToken.toString());
        let flooredResult = BigInt(rewardPerToken) / BigInt(1e18);
        expect(Number(flooredResult)).to.equal(4); // floor(4838850 * 1e18 / 1209700)

        let earnedDeployer = await poolManager.earned(deployer.address);
        expect(earnedDeployer).to.equal(3629138);

        let earnedOther = await poolManager.earned(otherUser.address);
        expect(earnedOther).to.equal(1209712);
    });
  });
});