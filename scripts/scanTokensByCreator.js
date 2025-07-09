const { ethers } = require("hardhat");

// ✅ Final TokenRegistry address (update if needed)
const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

// ✅ Target creator wallet (checksummed or lowercase works)
const CREATOR = "0x6E118Ac0da2170697a4F942A0C509B29C59F698f".toLowerCase();

async function main() {
  const [deployer] = await ethers.getSigners();
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY, deployer);

  console.log(`\n🔍 Scanning tokens created by: ${CREATOR}`);
  console.log("📚 Fetching registered tokens from logbook...\n");

  const tokens = [];

  for (let i = 0; i < 1000; i++) {
    try {
      const token = await Registry.tokenLogbook(i);
      const creator = token.registeredBy.toLowerCase();

      if (creator === CREATOR) {
        tokens.push({
          index: i,
          name: token.name,
          symbol: token.symbol,
          address: token.tokenAddress,
          timestamp: new Date(token.timestamp.toNumber() * 1000).toLocaleString(),
        });
      }
    } catch {
      break;
    }
  }

  if (tokens.length === 0) {
    console.log(`❌ No tokens found for creator: ${CREATOR}\n`);
    return;
  }

  console.log(`✅ Found ${tokens.length} token(s) created by ${CREATOR}:\n`);
  tokens.forEach((t, idx) => {
    console.log(`#${idx + 1}  📦 ${t.name} (${t.symbol})`);
    console.log(`     → Token: ${t.address}`);
    console.log(`     → Timestamp: ${t.timestamp}`);
    console.log(`     → Logbook Index: ${t.index}\n`);
  });

  console.log("✅ Scan complete.\n");
}

main().catch(err => {
  console.error("❌ Script Failed:", err);
  process.exit(1);
});
