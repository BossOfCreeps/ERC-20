import { expect } from "chai";
import { ethers } from "hardhat";

describe("Staking functions", function () {
  let owner : any
  let account1 : any
  let account2 : any
  let erc20_staking : any
  let erc20_reward : any
  let contract : any
  let reward_coins = 1000

  beforeEach(async function(){
    [owner, account1, account2] = await ethers.getSigners()
    
    erc20_staking = await (await ethers.getContractFactory("ERC20", owner)).deploy("StakingToken", "STA")
    await erc20_staking.deployed()

    erc20_reward = await (await ethers.getContractFactory("ERC20", owner)).deploy("RewardToken", "REW")
    await erc20_reward.deployed()

    contract = await (await ethers.getContractFactory("StakingRewards", owner)).deploy(erc20_staking.address, erc20_reward.address)
    await contract.deployed()
  })

  it("Test stake success", async function () {
    let owner_coins = 10;
    let approve_coins = 7;
    let coins_to_stake = 5;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()

    await (await contract.connect(owner).stake(coins_to_stake)).wait()

    expect(await erc20_staking.balanceOf(owner.address)).to.equal(owner_coins-coins_to_stake);
    expect(await contract.balanceOf(owner.address)).to.equal(coins_to_stake);
  });

  it("Test stake error no coins on balance", async function () {
    let owner_coins = 3;
    let approve_coins = 7;
    let coins_to_stake = 5;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()

    await expect(contract.connect(owner).stake(coins_to_stake)).to.be.revertedWith('ERC20: transfer no balance');
  });
  
  it("Test stake error no allowered coins", async function () {
    let owner_coins = 10;
    let approve_coins = 3;
    let coins_to_stake = 5;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()

    await expect(contract.connect(owner).stake(coins_to_stake)).to.be.revertedWith('ERC20: transferFrom no allowered balance');
  });

  it("Test unstake success", async function () {
    let owner_coins = 10;
    let approve_coins = 7;
    let coins_to_stake = 5;
    let coins_to_unstake = 3;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()
    await (await erc20_reward.mint(contract.address, reward_coins)).wait()

    await (await contract.connect(owner).stake(coins_to_stake)).wait()
    await (await contract.connect(owner).unstake(coins_to_unstake)).wait()

    expect(await erc20_staking.balanceOf(owner.address)).to.equal(owner_coins-coins_to_stake+coins_to_unstake);
    expect(await contract.balanceOf(owner.address)).to.equal(coins_to_stake-coins_to_unstake);
  });

  it("Test unstake error no coins", async function () {
    let owner_coins = 10;
    let approve_coins = 7;
    let coins_to_stake = 5;
    let coins_to_unstake = 7;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()
    await (await erc20_reward.mint(contract.address, reward_coins)).wait()

    await (await contract.connect(owner).stake(coins_to_stake)).wait()
    await expect(contract.connect(owner).unstake(coins_to_unstake)).to.be.revertedWith('No coins to unstake');
  });

  it("Test claim basic success", async function () {
    let owner_coins = 100;
    let approve_coins = 70;
    let coins_to_stake = 50;
    let reward_persent = 50;
    let reward_timer = 2;
    let result_rewards = 100;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()
    await (await erc20_reward.mint(contract.address, reward_coins)).wait()
    await (await contract.connect(owner).setRewardPersent(reward_persent)).wait()
    await (await contract.connect(owner).setRewardTimer(reward_timer)).wait()
    
    await (await contract.connect(owner).stake(coins_to_stake)).wait()
    await new Promise<void>(done => setTimeout(() => done(), reward_timer * 1000))
    await (await contract.connect(owner).claim()).wait()

    // 50*(5/5)*(100/50) = 100
    expect(await erc20_reward.balanceOf(owner.address)).to.equal(result_rewards);
  });

  it("Test claim advanced success", async function () {
    let owner_coins = 300;
    let approve_coins = 200;
    let coins_to_stake = 50;
    let coins_to_unstake = 30;
    let coins_to_stake_2 = 100;

    let reward_persent = 50;
    let reward_timer_1 = 2;
    let reward_timer_2 = 4;
    let result_rewards = 420;

    await (await erc20_staking.mint(owner.address, owner_coins)).wait()
    await (await erc20_staking.approve(contract.address, approve_coins)).wait()
    await (await erc20_reward.mint(contract.address, reward_coins)).wait()
    await (await contract.connect(owner).setRewardPersent(reward_persent)).wait()
    await (await contract.connect(owner).setRewardTimer(reward_timer_1)).wait()
    
    await (await contract.connect(owner).stake(coins_to_stake)).wait()
    await new Promise<void>(done => setTimeout(() => done(), reward_timer_1 * 1000))
    await (await contract.connect(owner).unstake(coins_to_unstake)).wait()
    await new Promise<void>(done => setTimeout(() => done(), reward_timer_2 * 1000))
    await (await contract.connect(owner).stake(coins_to_stake_2)).wait()
    await new Promise<void>(done => setTimeout(() => done(), reward_timer_1 * 1000))

    await (await contract.connect(owner).claim()).wait()

    // 50*(2/2)*(100/50) + (50-30)*(4/2)*(100/50) + (50-30+100)*(2/2)*(100/50) = 420
    expect(await erc20_reward.balanceOf(owner.address)).to.equal(result_rewards);
  });

  it("Test setRewardPersent error", async function () {
    await expect(contract.connect(account1).setRewardPersent(0)).to.be.revertedWith('setRewardPersent can calls only by owner');
  });

  it("Test setRewardTimer error", async function () {
    await expect(contract.connect(account1).setRewardTimer(0)).to.be.revertedWith('setRewardTimer can calls only by owner');
  });
});
