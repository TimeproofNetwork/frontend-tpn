// scripts/data/updateGodzillaBanList.js

const axios = require("axios");
const { ethers } = require("hardhat");

// ✅ Final deployed TokenRegistry address
const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// 🧼 Sanitize utility (same as contract)
function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔐 Using deployer:", deployer.address);

  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  console.log("🌐 Fetching top 500 tokens from CoinGecko...");
  let tokens = [];

  for (let page = 1; page <= 5; page++) {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page,
      },
    });
    tokens = tokens.concat(response.data);
  }

  console.log(`✅ Fetched ${tokens.length} tokens.`);

  const sanitizedNames = tokens.map((t) => sanitize(t.name));
  const sanitizedSymbols = tokens.map((t) => sanitize(t.symbol));

  const BATCH_SIZE = 100;
  for (let i = 0; i < sanitizedNames.length; i += BATCH_SIZE) {
    const batchNames = sanitizedNames.slice(i, i + BATCH_SIZE);
    const batchSymbols = sanitizedSymbols.slice(i, i + BATCH_SIZE);

    console.log(`🚫 Sending batch ban transaction: ${i} to ${i + batchNames.length - 1}`);
    const tx = await Registry.batchBanTokens(batchNames, batchSymbols);
    await tx.wait();
    console.log(`✅ Batch ${i / BATCH_SIZE + 1} complete. TX: ${tx.hash}`);
  }

  console.log("✅ Godzilla ban list updated with top 500 tokens.");
}

main().catch((err) => {
  console.error("💥 Script failed:", err);
  process.exit(1);
});



