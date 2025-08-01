// injectGodzillaBanBatch5.js
const { ethers } = require("hardhat");

// ⚠️ Do not modify these — raw inputs for sanitization
const names = [
  "Centra", "CoinMetro", "Karbo", "Swarm Fund", "Smartlands",
  "Chronologic", "DAEX", "SydPakCoin", "Eroscoin", "Credo",
  "Hubii Network", "Gladius", "STK", "BOScoin", "Jetcoin",
  "RevolutionVR", "Bloom", "Friendz", "FairCoin", "Bounty0x",
  "Hi Mutual Society", "Origami Network", "Restart Energy", "Bismuth", "InsurChain",
  "Linda", "Ellaism", "NaPoleonX", "Auctus", "BLOCKv",
  "YENTEN", "Matchpool", "Lendingblock", "Remme", "Snovian.Space",
  "MediBloc", "SwissBorg", "Lisk Machine Learning", "Crown", "Coval",
  "Memetic", "Denarius", "SafeInsure", "HEROcoin", "GridCoin",
  "Jiyo", "Elite", "Bitcoin Instant", "Eternity", "Hacken",
  "Unify", "Sentaro", "HiCoin", "Maecenas", "Bitcoin Plus",
  "EUNOMIA", "NoLimitCoin", "TrakInvest", "Lamden", "X8X Token",
  "EncryptoTel", "Scry.info", "Ethbits", "Coss", "Target Coin",
  "Bitcoin Interest", "BitDice", "STK Token", "Bitcoin Private", "Voise",
  "Mercury Protocol", "DigitalPrice", "Tokes", "Opus", "Everex",
  "Primalbase Token", "Utrust", "Decenturion", "Simple Token", "TaaS",
  "TrueFlip", "Rialto", "Ethorse", "Xaurum", "DeepBrain Chain",
  "Paragon", "Omni", "Bancor", "Melon", "Edgeless",
  "AirSwap", "Salt", "FunFair", "Request", "SONM",
  "Status", "Storj", "SingularDTV", "Gnosis", "Civic"
];

const symbols = [
  "CTR", "XCM", "KRB", "SWM", "SLT",
  "DAY", "DAX", "SPD", "ERO", "CREDO",
  "HBT", "GLA", "STK", "BOS", "JET",
  "RVR", "BLT", "FDZ", "FAIR", "BNTY",
  "HMC", "ORI", "MWAT", "BIS", "INSUR",
  "LINDA", "ELLA", "NPX", "AUC", "VEE",
  "YTN", "GUP", "LND", "REM", "SNOV",
  "MED", "CHSB", "LML", "CRW", "COVAL",
  "MEME", "DNR", "SINS", "PLAY", "GRC",
  "JIYO", "1337", "BTI", "ENT", "HKN",
  "UNIFY", "SEN", "XHI", "ART", "XBC",
  "ENTS", "NLC2", "TRAK", "TAU", "X8X",
  "ETT", "DDD", "EBIT", "COSS", "TGT",
  "BCI", "CSNO", "STK", "BTCP", "VOISE",
  "GMT", "DP", "TKS", "OPT", "EVX",
  "PBT", "UTK", "DCNT", "OST", "TAAS",
  "TFL", "XRL", "HORSE", "XAUR", "DBC",
  "PRG", "OMNI", "BNT", "MLN", "EDG",
  "AST", "SALT", "FUN", "REQ", "SNM",
  "SNT", "STORJ", "SNGLS", "GNO", "CVC"
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
  console.log("🐲 Injecting Godzilla Ban – Batch 5 (Top 401–500)...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
  "TokenRegistry",
  "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6" // ✅ FINAL LOCKED TokenRegistry
);

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Batch 5 injected successfully — Final 100 tokens added to Godzilla Firewall.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Batch 5:", err);
    process.exit(1);
  });
}











