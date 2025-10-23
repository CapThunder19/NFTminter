const hre = require("hardhat");

async function main() {
  const NFTMinter = await hre.ethers.getContractFactory("NFTminter");
  const nftMinter = await NFTMinter.deploy();
  await nftMinter.waitForDeployment();

  console.log("NFTMinter deployed to:", await nftMinter.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
