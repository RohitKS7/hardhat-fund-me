const { assert } = require("chai");
const { ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// NOTE with this ternary operator, staging test only gonna run on Testnet and skip the development chains
developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployers;
      const sendValue = ethers.utils.parseEther("2"); // 1 ETH
      beforeEach(async function () {
        deployers = (await getNamedAccounts()).deployer;

        // NOTE in staging we are not gonna deploy our contract on testnet, bcoz we are assuming its on testnet. (means no fixture line)

        // NOTE getContract = this will get the most recent deployment of whatever contract we tell in.
        fundMe = await ethers.getContract("FundMe", deployers);
      });

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalance.toString(), "0");
      });
    });
