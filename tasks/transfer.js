require("@nomiclabs/hardhat-web3");

task("transfer", "Transfer coins to contract")
  .addParam("address", "Address")
  .addParam("value", "Amount value")
  .setAction(async (taskArgs) => {
    const instance = await hre.ethers.getContractAt("ERC20", process.env.INFURA_CONTRACT_ADDRESS);
    await instance.transfer({_to: taskArgs.address, _value: taskArgs.value});
  });

module.exports = {};