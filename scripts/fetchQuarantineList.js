const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
  const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
  const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

  // ✅ Final TokenRegistry

  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY_ADDRESS);
  const latestBlock = await ethers.provider.getBlockNumber();

  const step = 500;
  let fromBlock = 0;
  let toBlock = step - 1;
  const found = new Map();

  console.log("📜 Fetching Quarantine List from Event Logs...\n");

  while (fromBlock <= latestBlock) {
    if (toBlock > latestBlock) toBlock = latestBlock;

    try {
      const logs = await registry.queryFilter(
        registry.filters.TokenQuarantined(),
        fromBlock,
        toBlock
      );

      for (const log of logs) {
        const name = log.args.name.toLowerCase();
        const symbol = log.args.symbol.toLowerCase();
        const key = `${name}|${symbol}`;
        found.set(key, { name: log.args.name, symbol: log.args.symbol });
      }

      console.log(`✅ Scanned blocks ${fromBlock}–${toBlock} (${logs.length} quarantined events)`);
    } catch (err) {
      console.log(`❌ Failed block range ${fromBlock}–${toBlock}: ${err.message}`);
    }

    fromBlock = toBlock + 1;
    toBlock = fromBlock + step - 1;
  }

  let index = 1;
  for (const { name, symbol } of found.values()) {
    const isQ = await registry.isQuarantined(name, symbol);
    if (isQ) {
      console.log(`🔹 ${index++}. ${name} (${symbol}) — 🛑 QUARANTINED`);
    }
  }

  console.log(`\n✅ Total Quarantined Tokens: ${index - 1}`);
}

main().catch((error) => {
  console.error("❌ Failed to fetch quarantine list:", error);
  process.exit(1);
});


