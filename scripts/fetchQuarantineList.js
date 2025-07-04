const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0x42fb85d1fF667Eb00bc8f52CC04baD7A7eAfD50e";
  const BADGE_NFT = "0x319C0FA14Ba35D62B7317f17f146fD051651fb7B";
  const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

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


