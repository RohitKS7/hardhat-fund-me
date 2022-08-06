const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding............");
  const transactionResponse = await fundMe.cheaperWithdraw();
  await transactionResponse.wait(1);
  console.log("Got money back...!!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
