const hre = require("hardhat");

async function main() {
  const NFTminter = await hre.ethers.getContractFactory("NFTminter");
  const nftminter = await NFTminter.deploy();

  await nftminter.waitForDeployment();
  console.log("NFTminter deployed to:", await nftminter.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
