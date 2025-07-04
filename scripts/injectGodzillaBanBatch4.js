// injectGodzillaBanBatch4.js
const { ethers } = require("hardhat");

// ⚠️ Do not modify these — raw inputs for sanitization
const names = [
  "e-Gulden", "VeriCoin", "HempCoin", "PayPie", "IvyKoin",
  "DigiPulse", "Energo", "Swarm City", "Civic Power", "Primas",
  "DATx", "Ryo Currency", "Lendingblock", "APIS", "InsurePal",
  "Ink Protocol", "AirToken", "Qbao", "Rublix", "AdHive",
  "BuzzCoin", "Chronobank", "Linda", "Chronologic", "Aeron",
  "Kobocoin", "ProChain", "BitDegree", "EncrypGen", "TrueChain",
  "CashBet Coin", "Rivetz", "Hiveterminal", "MediShares", "Faceter",
  "Neumark", "Tierion", "DMarket", "Starta", "Spectiv",
  "ATN", "Debitum", "Intelligent Investment Chain", "XTRD", "Poseidon Network",
  "PiplCoin", "Proxeus", "WandX", "Humaniq", "Datum",
  "Cappasity", "Sharpe AI", "BitClave", "Revain", "FundRequest",
  "Dether", "MyBit", "ATC Coin", "LinkEye", "Sether",
  "Canyacoin", "Change", "Starbase", "SureRemit", "Bee Token",
  "TokenStars", "SportyCo", "Envion", "Banyan Network", "Zloadr",
  "Earth Token", "Play2Live", "LeadCoin", "Electrify.Asia", "Ink Protocol",
  "BitcoinZ", "DecentBet", "AdToken", "Arcona", "SpankChain",
  "Bitcoin Green", "TrustNote", "Bitcoin Atom", "UpToken", "Crypterium",
  "TokenCard", "CoinFi", "Linda", "MinexCoin", "eBoost",
  "MyWish", "Oceanlab", "BitWhite", "Pillar", "SolarCoin",
  "BuzzShow", "Opus", "Lendingblock", "Zeusshield", "Hive"
];

const symbols = [
  "EFL", "VRC", "THC", "PPP", "IVY",
  "DGPT", "TSL", "SWT", "POWER", "PST",
  "DATX", "RYO", "LND", "APIS", "IPL",
  "XNK", "AIR", "QBT", "RBLX", "ADH",
  "BUZZ", "TIME", "LINDA", "DAY", "ARN",
  "KOBO", "PRA", "BDG", "DNA", "TRUE",
  "CBC", "RVT", "HVN", "MDS", "FACE",
  "NEU", "TNT", "DMT", "STA", "SIG",
  "ATN", "DEB", "IIC", "XTRD", "QQQ",
  "PIPL", "XES", "WAND", "HMQ", "DAT",
  "CAPP", "SHP", "CAT", "R", "FND",
  "DTH", "MYB", "ATCC", "LET", "SETH",
  "CAN", "CAG", "STAR", "RMT", "BEE",
  "TEAM", "SPF", "EVN", "BBN", "ZDR",
  "EARTH", "LIV", "LDC", "ELEC", "XNK",
  "BTCZ", "DBET", "ADT", "ARCONA", "SPANK",
  "BITG", "TTT", "BCA", "UP", "CRPT",
  "TKN", "COFI", "LINDA", "MNX", "EBST",
  "WISH", "OCL", "BTW", "PLR", "SLR",
  "BUZZSHOW", "OPT", "LND", "ZSC", "HVN"
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
  console.log("🐲 Injecting Godzilla Ban – Batch 4 (Top 301–400)...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
    "TokenRegistry",
    "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14" // ✅ FINAL LOCKED TokenRegistry
  );

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Batch 4 injected successfully — Additional 100 tokens now protected by Godzilla Firewall.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Batch 4:", err);
    process.exit(1);
  });
}










