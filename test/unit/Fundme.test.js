// TODO importing deployments object from hardhat
const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

// SECTION TEST for whole fundme contract
describe("Fundme", () => {
  let fundMe;
  let deployers;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1"); // 1 ETH
  beforeEach(async function () {
    // TODO getting accounts to attach with fundme
    deployers = (await getNamedAccounts()).deployer;

    /* { ANCHOR 
         NOTE another way to get accounts
         const accounts = await ethers.getSigners(); } */

    // deploy fundme contract using hardhat-deploy
    // NOTE fixture = allows us to run deploy folder with as many tags as we want
    await deployments.fixture(["all"]); // with this 1 line our contract is deployed

    // NOTE getContract = this will get the most recent deployment of whatever contract we tell in.
    fundMe = await ethers.getContract("FundMe", deployers);

    // TODO MockV3Aggregator
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployers);
  });

  // SECTION test for constructor only
  describe("constructor", () => {
    it("sets the aggregator addressess correctly", async () => {
      const response = await fundMe.getPriceFeed();

      // TODO we will check if our constructor getPriceFeed address is gonna be same as MockV3Aggregator becoz we are deploying it on hardhat localhost
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  // SECTION test for fund()
  describe("fund", () => {
    // NOTE test for send enough eth
    it("Fails if don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Don't Have Enough Eth"); //NOTE revertedWith message should be same as your FundeMe.sol file's fund() revert message
      // TODO before run tests something like above line you must see : "important-points.txt" file point no. 9
    });

    // NOTE test for correct mapping(data) structure
    it("update the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue }); // hardcoding the ETH amount for now

      // deployer ne kitna amount fund kia idar ayega
      const response = await fundMe.getAddressToAmountFunded(deployers);
      assert.equal(response.toString(), sendValue.toString());
    });

    //NOTE test to check if msg.sender(deployer) added successfully to the getFunder array
    it("Adds funder to array of getFunder", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.getFunder(0);
      assert.equal(funder, deployers);
    });
  });

  //SECTION test for withdraw()
  describe("withdraw", () => {
    // TODO before running test for withdraw, first add some funds in contract to withdraw
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    // ANCHOR test for withdrawing  Eth when there is a single Funder
    it("can withdraw ETH from a single funder", async () => {
      //ANCHOR style guide for test
      // TODO 1. Arrange the test (test setup)
      // getting fundMe contract's initial balance
      const stratingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      // getting deployer's initial balance
      const stratingDelpoyerBalance = await fundMe.provider.getBalance(
        deployers
      );

      // TODO 2. Act (making test code)
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      // NOTE creating BreakPoint(see point 10 in important.txt) here, so we can see the available tasks of transactionReceipt to get the gasCost of withdraw

      // NOTE Tips to get gasCost of any function{withdraw() for now}
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice); // .mul to "multiply"

      // check to see if the entire fundMe contract's balance is added to the deployer's balance
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDelpoyerBalance = await fundMe.provider.getBalance(deployers);

      // TODO 3. Assert (checking the test)
      assert.equal(endingFundMeBalance, 0); // fundMe balance should be 0(zero)
      assert.equal(
        // .add is like "addition" in maths but for bigNumbers
        stratingFundMeBalance.add(stratingDelpoyerBalance).toString(),
        endingDelpoyerBalance.add(gasCost).toString()
      ); // must add gasCost because when calling withDraw, user spend some gas
    });

    //ANCHOR test for withdrawing Eth when there are multiple getFunder
    it("allows us to withdraw with multiple getFunder", async () => {
      // 1. ARRANGE
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        // we start with 1 because the 0th index will be the deployer
        const fundMeConnectedContract = await fundMe.connect(accounts[i]); // on line no.24, we called fundMe contract, there it's already connected with deployer, now here we are also connecting other accounts with FundMe contract
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const stratingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const stratingDelpoyerBalance = await fundMe.provider.getBalance(
        deployers
      );

      // 2. ACT
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // 3. ASSERT
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDelpoyerBalance = await fundMe.provider.getBalance(deployers);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        stratingFundMeBalance.add(stratingDelpoyerBalance).toString(),
        endingDelpoyerBalance.add(gasCost).toString()
      );

      // TODO make sure that the getFunder[] array reset properly in withdraw()
      await expect(fundMe.getFunder(0)).to.be.reverted;

      // TODO make sure that all the accounts connected with mapping structure set to 0$
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    // ANCHOR test for onlyOwner modifyer
    it("Only allows the owner to withdraw funds", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(attackerConnectedContract.withdraw()).to.be.reverted;
    });

    // SECTION testing cheaper withdraw function

    it("can withdraw ETH from a single funder", async () => {
      //ANCHOR style guide for test
      // TODO 1. Arrange the test (test setup)
      // getting fundMe contract's initial balance
      const stratingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      // getting deployer's initial balance
      const stratingDelpoyerBalance = await fundMe.provider.getBalance(
        deployers
      );

      // TODO 2. Act (making test code)
      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      // NOTE creating BreakPoint(see point 10 in important.txt) here, so we can see the available tasks of transactionReceipt to get the gasCost of withdraw

      // NOTE Tips to get gasCost of any function{withdraw() for now}
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice); // .mul to "multiply"

      // check to see if the entire fundMe contract's balance is added to the deployer's balance
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDelpoyerBalance = await fundMe.provider.getBalance(deployers);

      // TODO 3. Assert (checking the test)
      assert.equal(endingFundMeBalance, 0); // fundMe balance should be 0(zero)
      assert.equal(
        // .add is like "addition" in maths but for bigNumbers
        stratingFundMeBalance.add(stratingDelpoyerBalance).toString(),
        endingDelpoyerBalance.add(gasCost).toString()
      ); // must add gasCost because when calling withDraw, user spend some gas
    });

    //ANCHOR test for withdrawing Eth when there are multiple getFunder
    it("Cheaper withdraw testing....", async () => {
      // 1. ARRANGE
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        // we start with 1 because the 0th index will be the deployer
        const fundMeConnectedContract = await fundMe.connect(accounts[i]); // on line no.24, we called fundMe contract, there it's already connected with deployer, now here we are also connecting other accounts with FundMe contract
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const stratingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const stratingDelpoyerBalance = await fundMe.provider.getBalance(
        deployers
      );

      // 2. ACT
      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      // 3. ASSERT
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDelpoyerBalance = await fundMe.provider.getBalance(deployers);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        stratingFundMeBalance.add(stratingDelpoyerBalance).toString(),
        endingDelpoyerBalance.add(gasCost).toString()
      );

      // TODO make sure that the getFunder[] array reset properly in withdraw()
      await expect(fundMe.getFunder(0)).to.be.reverted;

      // TODO make sure that all the accounts connected with mapping structure set to 0$
      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.getAddressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
  });
});
