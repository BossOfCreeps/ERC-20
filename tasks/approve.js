require("@nomiclabs/hardhat-web3");

task("approve", "Approve use coins for contract")
  .addParam("address", "Spender address")
  .addParam("value", "Amount value")
  .setAction(async (taskArgs) => {
    const instance = await hre.ethers.getContractAt("ERC20", process.env.INFURA_CONTRACT_ADDRESS);
    await instance.approve({_spender: taskArgs.to, _value: taskArgs.value});
  });

module.exports = {};