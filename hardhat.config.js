require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  ADMIN_PRIVATE_KEY,     // ✅ Updated
  ZERO_TPN_KEY,
  SEPOLIA_RPC_URL,
  ETHERSCAN_API_KEY,
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 50,
      },
      viaIR: true, // ✅ Enables IR-based compilation to fix stack too deep
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
    tests: "./test",
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: [ADMIN_PRIVATE_KEY, ZERO_TPN_KEY].filter(Boolean), // ✅ Uses admin
      timeout: 1000000,
      gasMultiplier: 1.5,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};










