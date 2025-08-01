// injectGodzillaBanBatch2.js
const { ethers } = require("hardhat");

// ⚠️ Do not modify these — raw inputs for sanitization
const names = [
  "Wanchain", "Mask Network", "DeXe", "Storj", "Arkham",
  "Ergo", "NKN", "Verge", "Komodo", "Syscoin",
  "MyNeighborAlice", "Liquity", "SONM", "Velas", "Meter Governance",
  "DIA", "Reef", "Alpha Venture DAO", "DODO", "Wing Finance",
  "Sora", "RAMP", "MAP Protocol", "Everipedia", "DENT",
  "Everdome", "AirSwap", "Mossland", "Bifrost", "BitKan",
  "Qredo", "Cortex", "Measurable Data", "FC Barcelona Fan Token", "XPLA",
  "BitMart Token", "Propy", "Tornado Cash", "Dogechain", "Nash Exchange",
  "Xido Finance", "TokenClub", "Bitrue Coin", "Aion", "Covalent",
  "Fusion", "Battle World", "Vaiot", "Gifto", "Vega Protocol",
  "Cindicator", "Dora Factory", "Meter Stable", "Moeda Loyalty", "Proton",
  "Neutrino USD", "BABB", "SelfKey", "Dock", "Plian",
  "Edgeware", "Blox", "Ternoa", "COTI", "Mobius",
  "V.SYSTEMS", "Ripio Credit Network", "Groestlcoin", "RedFOX Labs", "LBRY Credits",
  "Boson Protocol", "QASH", "Civic", "WazirX", "MovieBloc",
  "YIELD App", "DEAPcoin", "PARSIQ", "EpiK Protocol", "PolkaBridge",
  "KRYLL", "Dvision Network", "Shopping.io", "Refinable", "Position Exchange",
  "SmartCash", "Gameswap", "Only1", "SwftCoin", "WePower",
  "Snetwork", "Pillar", "SALT", "OAX", "Dether",
  "Upfiring", "Datawallet", "Nucleus Vision", "CyberMiles", "Ruff"
];

const symbols = [
  "WAN", "MASK", "DEXE", "STORJ", "ARKM",
  "ERG", "NKN", "XVG", "KMD", "SYS",
  "ALICE", "LQTY", "SNM", "VLX", "MTRG",
  "DIA", "REEF", "ALPHA", "DODO", "WING",
  "XOR", "RAMP", "MAP", "IQ", "DENT",
  "DOME", "AST", "MOC", "BFC", "KAN",
  "QRDO", "CTXC", "MDT", "BAR", "XPLA",
  "BMX", "PRO", "TORN", "DC", "NEX",
  "XIDO", "TCT", "BTR", "AION", "CQT",
  "FSN", "BWO", "VAI", "GTO", "VEGA",
  "CND", "DORA", "MTR", "MDA", "XPR",
  "USDN", "BAX", "KEY", "DOCK", "PI",
  "EDG", "CDT", "CAPS", "COTI", "MOBI",
  "VSYS", "RCN", "GRS", "RFOX", "LBC",
  "BOSON", "QASH", "CVC", "WRX", "MBL",
  "YLD", "DEP", "PRQ", "EPK", "PBR",
  "KRL", "DVI", "SPI", "FINE", "POSI",
  "SMART", "GSWAP", "LIKE", "SWFTC", "WPR",
  "SNET", "PLR", "SALT", "OAX", "DTH",
  "UFR", "DXT", "NCASH", "CMT", "RUFF"
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
  console.log("🐲 Injecting Godzilla Ban – Batch 2 (Top 101–200)...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
  "TokenRegistry",
  "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6" // ✅ FINAL LOCKED TokenRegistry
);

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Batch 2 injected successfully — Next 100 tokens now protected by Godzilla Firewall.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Batch 2:", err);
    process.exit(1);
  });
}








