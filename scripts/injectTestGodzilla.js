// injectTestGodzilla.js
const { ethers } = require("hardhat");

// 🧪 Testing: Godzilla Ban for Top 10 Tokens
const names = [
  "Bitcoin", "Ethereum", "Tether", "BNB", "Solana",
  "USDC", "XRP", "Dogecoin", "Toncoin", "Cardano"
];

const symbols = [
  "BTC", "ETH", "USDT", "BNB", "SOL",
  "USDC", "XRP", "DOGE", "TON", "ADA"
];

// 🧼 CIS-aligned sanitization
const sanitize = (str) =>
  str
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeName = (str) => sanitize(str).toLowerCase();   // Canonical lowercase
const sanitizeSymbol = (str) => sanitize(str).toUpperCase(); // Canonical uppercase

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🐲 Injecting Test Godzilla Ban – Top 10 Tokens Only...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
    "TokenRegistry",
    "0xB1c452EfD5F16b38b8628c248baA85db53031CDD" // ✅ FINAL LOCKED TokenRegistry (Updated)
  );

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Top 10 tokens injected into Godzilla Firewall successfully.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Top 10:", err);
    process.exit(1);
  });
}
