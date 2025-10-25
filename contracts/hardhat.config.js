require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/ws5DcUYJVDl3HuqC_MIK0lKZ8ujYMcHe",
      accounts: ["bb75be7b5e7f4b5e18ba3bdda3d11e84d05902b3d351a5c47e88d7e2a7f37467"] 
    }
  }
};
