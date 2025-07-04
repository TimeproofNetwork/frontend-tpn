require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  PRIVATE_KEY,
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
      accounts: [PRIVATE_KEY, ZERO_TPN_KEY].filter(Boolean),
      timeout: 1000000,
      gasMultiplier: 1.5,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};








