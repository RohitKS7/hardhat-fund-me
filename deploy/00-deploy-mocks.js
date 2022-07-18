const { network } = require("hardhat");

// NOTE constructor arguments of MockV3Aggregator.sol for 00-deploy-mocks.js
const DECIMALS = "8";
const INITIAL_ANSWER = "200000000000";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // NOTE make sure we don't deploy our fake price contract(MockV3Aggregator.sol) on a network which already have a price
  // NOTE if you are on localhost
  if (chainId == "31337") {
    log("Local Network Detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!...");
    log("-----------------------------------------------------------");
  }
};

// with this tags we can deploy specific file in this mocks file
module.exports.tags = ["all", "mocks"];
