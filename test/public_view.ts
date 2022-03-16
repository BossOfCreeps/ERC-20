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

  it("Test name", async function () {
    expect(await erc20.name()).to.equal("Name");
  });

  it("Test symbol", async function () {
    expect(await erc20.symbol()).to.equal("HIX");
  });

  it("Test decimals", async function () {
    expect(await erc20.decimals()).to.equal(18);
  });
  
  it("Test totalSupply", async function () {
    (await erc20.mint(owner.address, 100)).wait();
    (await erc20.mint(account1.address, 18)).wait();
    (await erc20.mint(account2.address, 5)).wait();
    expect(await erc20.totalSupply()).to.equal(123);
  });

  it("Test balanceOf", async function () {
    expect(await erc20.balanceOf(account1.address)).to.equal(0);
    await (await erc20.mint(account1.address, 5)).wait()
    expect(await erc20.balanceOf(account1.address)).to.equal(5);
  });
});
