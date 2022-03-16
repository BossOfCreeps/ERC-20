require("@nomiclabs/hardhat-web3");

task("transferFrom", "Transfer coins from one contract to other")
  .addParam("from", "From address")
  .addParam("to", "To address")
  .addParam("value", "Amount value")
  .setAction(async (taskArgs) => {
    const instance = await hre.ethers.getContractAt("ERC20", process.env.INFURA_CONTRACT_ADDRESS);
    await instance.transferFrom({_to: taskArgs.from, _to: taskArgs.to, _value: taskArgs.value});
  });

module.exports = {};