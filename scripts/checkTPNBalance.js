const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  const wallet = "0x6E118Ac0da2170697a4F942A0C509B29C59F698f";
  // Replace with your MetaMask address
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";  // Your TPN Token contract
  const abi = require("../frontend-tpn/utils/TPN_ABI.json");        // Reuse the same ABI

  const token = new ethers.Contract(TPN_TOKEN, abi, provider);

  const rawBalance = await token.balanceOf(wallet);
  const balance = ethers.utils.formatUnits(rawBalance, 18);

  console.log(`✅ Wallet: ${wallet}`);
  console.log(`💰 TPN Balance: ${balance}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
