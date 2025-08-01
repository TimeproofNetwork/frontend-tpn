// scripts/simulateDAOQuarantine.js

const { ethers } = require("hardhat");
const registryABI =
  require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final deployed TokenRegistry address (Sepolia)
const registryAddress = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧪 Tokens to quarantine (add more if needed)
const tokensToQuarantine = [
  { name: "hobniscosive", symbol: "hbcv" }, // requested target
];

// Canonical sanitization to avoid unicode / spacing issues before sending
function convertUnicodeToAscii(str) {
  return (str || "")
    .normalize("NFKD")
    .split("")
    .filter((c) => c.charCodeAt(0) <= 127)
    .join("");
}
function sanitizeInput(str) {
  return convertUnicodeToAscii(str).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

async function main() {
  const [signer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();

  console.log("────────────────────────────────────────────");
  console.log(`🔐 Using wallet: ${signer.address}`);
  console.log(`🌐 Network: ${net.name} (chainId=${net.chainId})`);
  console.log(`🏛️  TokenRegistry: ${registryAddress}`);
  console.log("────────────────────────────────────────────");

  const Registry = new ethers.Contract(registryAddress, registryABI, signer);

  for (const token of tokensToQuarantine) {
    const nameSan = sanitizeInput(token.name);
    const symbolSan = sanitizeInput(token.symbol);

    console.log(`\n🚨 Attempting Quarantine for: ${token.name} (${token.symbol})`);
    console.log(`🔤 Sanitized Name: ${nameSan}`);
    console.log(`🔤 Sanitized Symbol: ${symbolSan}`);
    console.log(`🔍 Calling: daoQuarantine(name, symbol)`);

    try {
      const tx = await Registry.daoQuarantine(nameSan, symbolSan, {
        // gasLimit: 500_000, // optional cap
      });
      console.log(`⛓️  Sent tx: ${tx.hash}`);
      const receipt = await tx.wait(1);
      console.log(
        `✅ Quarantined: ${token.name} (${token.symbol}) at block ${receipt.blockNumber}`
      );
      console.log(`🔗 Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.error(
        `❌ Quarantine failed for ${token.name}: ${err.reason || err.message}`
      );
    }
  }

  console.log("\n🏁 Quarantine script completed.");
}

main().catch((error) => {
  console.error("❌ Script Failed:", error);
  process.exit(1);
});



































