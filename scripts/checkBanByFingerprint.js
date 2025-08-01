// scripts/checkBanByFingerprint.js

const { ethers } = require("hardhat");

// ✅ Replace with the correct TokenRegistry address
const TOKEN_REGISTRY = "0x2a368Df00Cd5949E85832811f4fdb704d78e9AE8";

// ✅ Replace with fingerprint to check
const FINGERPRINT = "0xe801e8e960832c6edf6151e3bc6e24b007c36ce229e69783a029a73cb96a5b4f";

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("🔐 Using wallet:", signer.address);

  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, signer);
  const banned = await registry.daoPunishmentBan(FINGERPRINT);

  console.log("\n🔍 Fingerprint:", FINGERPRINT);
  console.log("🛑 DAO Ban Status:", banned);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
