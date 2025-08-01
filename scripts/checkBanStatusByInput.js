// scripts/checkBanStatusByInput.js

const hre = require("hardhat");
const { ethers } = hre;

const TPN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧼 Canonical Sanitization Function
function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFingerprint(name, symbol) {
  const unified = sanitize(name) + sanitize(symbol);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(unified));
}

async function main() {
  const addr = process.env.ADDR;
  const name = process.env.NAME;
  const symbol = process.env.SYMBOL;

  const registry = await ethers.getContractAt("TokenRegistry", TPN_REGISTRY);

  if (addr && ethers.utils.isAddress(addr)) {
    // 🔍 MODE 1: Check by Address
    console.log(`🔍 DAO Ban Check by Token Address: ${addr}`);

    try {
      const info = await registry.getTokenInfo(addr);

      console.log("✅ Token Found:");
      console.log("→ Name:", info.name);
      console.log("→ Symbol:", info.symbol);
      console.log("→ Creator:", info.creator);
      console.log("→ Trust Level:", info.trustLevel);
      console.log("→ Registered:", info.isRegistered);

      const isBanned = await registry.isDAOPunished(info.name, info.symbol);
      if (isBanned) {
        console.log("🚫 DAO Banned: YES — Token is in the DAO Ban List.");
      } else {
        console.log("✅ DAO Banned: NO — Token is NOT in the DAO Ban List.");
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
      console.warn("⚠️ Token might not be registered or contract call failed.");
    }

  } else if (name && symbol) {
    // 🔍 MODE 2: Check by Name + Symbol
    const sanitizedName = sanitize(name);
    const sanitizedSymbol = sanitize(symbol);
    const fingerprint = getFingerprint(name, symbol);

    console.log(`🔍 DAO Ban Check by Name/Symbol: ${name} (${symbol})`);
    console.log("→ Sanitized Name:", sanitizedName);
    console.log("→ Sanitized Symbol:", sanitizedSymbol);
    console.log("→ Fingerprint:", fingerprint);

    try {
      const isBanned = await registry.isDAOPunished(sanitizedName, sanitizedSymbol);
      if (isBanned) {
        console.log("🚫 DAO Banned: YES — Token is in the DAO Ban List.");
      } else {
        console.log("✅ DAO Banned: NO — Token is NOT in the DAO Ban List.");
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
    }

  } else {
    // ⚠️ Invalid Input
    console.error("❌ Please provide either:");
    console.error("→ ADDR=0x...     (for address check)");
    console.error("→ NAME=xxx SYMBOL=yyy   (for name/symbol check)");
  }
}

main().catch((err) => {
  console.error("❌ Script Error:", err.message);
  process.exit(1);
});








