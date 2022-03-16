import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20 public view functions", function () {
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

  it("Test mint", async function () {
    expect(await erc20.totalSupply()).to.equal(0);
    await (await erc20.mint(owner.address, 5)).wait();
    expect(await erc20.totalSupply()).to.equal(5);
    await (await erc20.mint(account1.address, 7)).wait();
    expect(await erc20.totalSupply()).to.equal(12);
  });

  it("Test burn success", async function () {
    expect(await erc20.totalSupply()).to.equal(0);
    await (await erc20.mint(owner.address, 5)).wait()
    expect(await erc20.totalSupply()).to.equal(5);
    await (await erc20.burn(owner.address, 3)).wait()
    expect(await erc20.totalSupply()).to.equal(2);
  });

  it("Test burn error no balance", async function () {
    await (await erc20.mint(owner.address, 5)).wait()
    await expect(erc20.burn(owner.address, 8)).to.be.revertedWith('ERC20: burn no balance');
  });
});