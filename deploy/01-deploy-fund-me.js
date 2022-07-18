// NOTE when we use "hardhat-deploy" package we dont have to make main function and call the main function
// instead of that do this

const { networkConfig } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

// TODO 1st way to do
// async function deployFunc(hre) {
//   console.log("hi");
//   hre.getNamedAccounts();
//   hre.deployments();
// }

// module.exports.default = deployFunc;

// TODO 2nd way to do is below
// NOTE hre = hardhat runtime environment
// with hre we will call the features of hardhat same like import
// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
// };

// SECTION main funciton
// TODO short way for 2nd one
module.exports = async ({ getNamedAccounts, deployments }) => {
  // using "deployments" object to get this 2 functions
  const { deploy, log, get } = deployments;
  // deployer is a account holder which keep track of all the deployers. see hardhat.config for accounts details
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // SECTION importing different addressess according to network
  // ANCHOR what will happen when we deploy on mainnet or other testnet then rinkeby?
  // NOTE coz the contract address("chainlink contract AggregatorV3Interface priceFeed") we are using in priceConverter library is for "RINKEBY" ETH/USD converter and each chain have different price and we don't want to change the address for every chain
  // TODO make something so we don't have to change the address over and over again

  // ANCHOR Solution is hereeeeeeeee /////////////
  // TODO import helper.hardhat.config file above for differet addressess
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  // NOTE with this line you can deploy normally on any testnet and mainnet if you don't forget to add that network in hardhat.config network object.
  // TODO -> `` yarn hardhat deploy --network rinkeby `` or polygon

  let ethUsdPriceFeedAddress;
  // for localhost
  if (chainId == 31337) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // for testnet or mainnet
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // SECTION mocks
  // ANCHOR what is mock?
  // NOTE mock is a fake object which behaves same like a real object
  // TODO when going for localhost or hardhat network we want to use a mock!!
  // LINK see "00-deploy-mocks.js" file
  // TODO becoz localhost network don't have any priceFeed we have to make a fake contract(mock) which sets price for localhost so we can test our contract in localhost

  // SECTION - deploy the contract
  // NOTE 2 parameters => 1. contract name , 2. override parameters
  const fundme = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put constructor arguments here in this case its priceFeed address
    log: true, // to out custom log
    waitConfirmations: network.config.blockConfirmations || 1, // from hardhat.config, networks, rinkeby
  });

  // SECTION verify function    //////////////
  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(fundme.address, [ethUsdPriceFeedAddress]);
  }
  log("------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
