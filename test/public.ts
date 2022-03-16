import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20 public functions", function () {
  let owner : any
  let account1 : any
  let account2 : any
  let erc20 : any

  beforeEach(async function(){
    [owner, account1, account2] = await ethers.getSigners()
    const ERC20 = await ethers.getContractFactory("ERC20", owner)
    erc20 = await ERC20.deploy("Name", "HIX")
    await erc20.deployed()
  })

  it("Test transfer success", async function () {
    let owner_coins = 100;
    let coins_to_send = 5;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.transfer(account1.address, coins_to_send)).wait()

    expect(await erc20.balanceOf(owner.address)).to.equal(owner_coins-coins_to_send);
    expect(await erc20.balanceOf(account1.address)).to.equal(coins_to_send);
  });

  it("Test transfer error no balance", async function () {
    let owner_coins = 5;
    let coins_to_send = 100;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await expect(erc20.connect(owner).transfer(account1.address, coins_to_send)).to.be.revertedWith('ERC20: transfer no balance');
  });

  it("Test transferFrom success", async function () {
    let owner_coins = 100;
    let approve_coins = 7;
    let coins_to_send = 5;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.approve(account1.address, approve_coins)).wait()
    await (await erc20.connect(account1).transferFrom(owner.address, account2.address, coins_to_send)).wait()

    expect(await erc20.balanceOf(owner.address)).to.equal(owner_coins-coins_to_send);
    expect(await erc20.balanceOf(account2.address)).to.equal(coins_to_send);
    expect(await erc20.allowance(owner.address, account1.address)).to.equal(approve_coins-coins_to_send);
  });

  it("Test transferFrom error no balance", async function () {
    let owner_coins = 1;
    let approve_coins = 7;
    let coins_to_send = 5;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.approve(account1.address, approve_coins)).wait()

    await expect(erc20.connect(account1).transferFrom(owner.address, account2.address, coins_to_send)).to.be.revertedWith('ERC20: transfer no balance');
  });

  it("Test transferFrom error no allowance", async function () {
    let owner_coins = 100;
    let approve_coins = 7;
    let coins_to_send = 50;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.approve(account1.address, approve_coins)).wait()

    await expect(erc20.connect(account1).transferFrom(owner.address, account2.address, coins_to_send)).to.be.revertedWith('ERC20: transferFrom no allowered balance');
  });

  it("Test approve", async function () {
    let owner_coins = 100;
    let approve_coins = 7;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.approve(account1.address, approve_coins)).wait()

    expect(await erc20.allowance(owner.address, account1.address)).to.equal(approve_coins);
  });

  it("Test allowance", async function () {
    let owner_coins = 100;
    let approve_coins = 7;
    let coins_to_send = 5;

    await (await erc20.mint(owner.address, owner_coins)).wait()
    await (await erc20.approve(account1.address, approve_coins)).wait()
    await (await erc20.connect(account1).transferFrom(owner.address, account2.address, coins_to_send)).wait()

    expect(await erc20.allowance(owner.address, account1.address)).to.equal(approve_coins-coins_to_send);
  });
});
