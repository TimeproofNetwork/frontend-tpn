// injectGodzillaBanBatch1.js
const { ethers } = require("hardhat");

// ⚠️ Do not modify these — raw inputs for sanitization
const names = [
  "Bitcoin", "Ethereum", "Tether", "BNB", "Solana",
  "USDC", "XRP", "Dogecoin", "Toncoin", "Cardano",
  "Shiba Inu", "Avalanche", "Wrapped Bitcoin", "TRON", "Polkadot",
  "Chainlink", "NEAR Protocol", "Uniswap", "Polygon", "Litecoin",
  "Dai", "Internet Computer", "LEO Token", "Ethereum Classic", "Stacks",
  "Aptos", "Kaspa", "Mantle", "Cronos", "Filecoin",
  "Render", "Arbitrum", "Immutable", "Optimism", "VeChain",
  "Stellar", "The Graph", "Maker", "Hedera", "Bittensor",
  "OKB", "Injective", "Fetch.ai", "THORChain", "Pepe",
  "Monero", "Celestia", "Quant", "Algorand", "Sui",
  "Fantom", "Aave", "Beam", "Sei", "Ondo",
  "Lido DAO", "Bitcoin Cash", "Flow", "Core", "MultiversX",
  "Bonk", "GALA", "Tezos", "Axie Infinity", "JasmyCoin",
  "Chiliz", "ORDI", "KuCoin Token", "Frax Share", "The Sandbox",
  "EOS", "dYdX", "ApeCoin", "Ronin", "Conflux",
  "Blur", "Helium", "IOTA", "Decentraland", "Pyth Network",
  "Worldcoin", "Kava", "Kusama", "Terra Classic", "Gnosis",
  "USDD", "WOO Network", "Ocean Protocol", "PancakeSwap", "Harmony",
  "Band Protocol", "TomoChain", "Trust Wallet", "iExec RLC", "Celo",
  "Numeraire", "Loom Network", "Stratis", "Metal DAO", "Neo"
];

const symbols = [
  "BTC", "ETH", "USDT", "BNB", "SOL",
  "USDC", "XRP", "DOGE", "TON", "ADA",
  "SHIB", "AVAX", "WBTC", "TRX", "DOT",
  "LINK", "NEAR", "UNI", "MATIC", "LTC",
  "DAI", "ICP", "LEO", "ETC", "STX",
  "APT", "KAS", "MNT", "CRO", "FIL",
  "RNDR", "ARB", "IMX", "OP", "VET",
  "XLM", "GRT", "MKR", "HBAR", "TAO",
  "OKB", "INJ", "FET", "RUNE", "PEPE",
  "XMR", "TIA", "QNT", "ALGO", "SUI",
  "FTM", "AAVE", "BEAM", "SEI", "ONDO",
  "LDO", "BCH", "FLOW", "CORE", "EGLD",
  "BONK", "GALA", "XTZ", "AXS", "JASMY",
  "CHZ", "ORDI", "KCS", "FXS", "SAND",
  "EOS", "DYDX", "APE", "RON", "CFX",
  "BLUR", "HNT", "MIOTA", "MANA", "PYTH",
  "WLD", "KAVA", "KSM", "LUNC", "GNO",
  "USDD", "WOO", "OCEAN", "CAKE", "ONE",
  "BAND", "TOMO", "TWT", "RLC", "CELO",
  "NMR", "LOOM", "STRAX", "MTL", "NEO"
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
  console.log("🐲 Injecting Godzilla Ban – Batch 1 (Top 1–100)...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
    "TokenRegistry",
    "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14" // ✅ FINAL LOCKED TokenRegistry
  );

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Batch 1 injected successfully — Top 100 tokens now protected by Godzilla Firewall.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Batch 1:", err);
    process.exit(1);
  });
}
















