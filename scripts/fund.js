const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding Contract ............");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("500"),
  });
  await transactionResponse.wait(1);
  console.log("funded..........!!!!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
