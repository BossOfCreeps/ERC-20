import { ethers } from "hardhat";

async function main_ERC20() {
  const ERC20 = await ethers.getContractFactory("ERC20");
  const erc20 = await ERC20.deploy("MyToken", "HIX");

  await erc20.deployed();

  console.log("ERC20 deployed to:", erc20.address);
}

async function main() {
  const StakingRewards = await ethers.getContractFactory("StakingRewards");
  const stacking_rewards = await StakingRewards.deploy(
    "0xA215Fc54ac06e3ED00Fd3198A6D8cd19909E6A14", 
    "0x073b01A3cA69cabA235C36191734630E6F8609Ec"
  );

  await stacking_rewards.deployed();

  console.log("StakingRewards deployed to:", stacking_rewards.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
