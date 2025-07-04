// injectGodzillaBanBatch3.js
const { ethers } = require("hardhat");

// ⚠️ Do not modify these — raw inputs for sanitization
const names = [
  "QLC Chain", "Cobak Token", "Hydra", "Metronome", "Sirin Labs Token",
  "Effect.AI", "ZB Token", "OST", "Hydro", "BeeKan",
  "IHT Real Estate Protocol", "IoTeX", "AppCoins", "Peercoin", "Nxt",
  "MediBloc", "Nectar", "WhiteCoin", "Ethos", "Contentos",
  "Datum", "Smart MFG", "AdEx", "Tokenomy", "CPChain",
  "CarVertical", "Bluzelle", "Unibright", "KickToken", "ChangeNOW Token",
  "BABB", "Unicrypt", "MetaMUI", "Enecuum", "Ravencoin",
  "PAC Protocol", "Flixxo", "GoChain", "BoringDAO", "Sentinel",
  "Blocknet", "Shyft Network", "Uquid Coin", "BlockMason Credit Protocol", "Energi",
  "SelfSell", "VIBE", "XYO", "Lympo", "Zeepin",
  "Tokenomy", "Ubex", "WePower", "Universa", "Airbloc",
  "Lina", "Quantstamp", "APIS", "0xBitcoin", "Qubitica",
  "TokenPay", "Datawallet", "YfDAI.finance", "PumaPay", "Ink",
  "Noia Network", "XinFin Network", "Gulden", "GazeTV", "FidentiaX",
  "Playkey", "SoMee.Social", "DECENT", "Wings", "Spectre.ai",
  "Grid+", "Pluton", "Indorse", "STASIS EURO", "Cashaa",
  "Kambria", "BitRewards", "GET Protocol", "Matryx", "Darico Ecosystem Coin",
  "DigitalNote", "ShipChain", "ZClassic", "Linda", "Stox",
  "Mothership", "DAOstack", "bitCNY", "bitUSD", "LBRY Credits",
  "Zap", "Agrello", "Molecular Future", "Pinkcoin", "Bottos"
];

const symbols = [
  "QLC", "CBK", "HYDRA", "MET", "SRN",
  "EFX", "ZB", "OST", "HYDRO", "BKBT",
  "IHT", "IOTX", "APPC", "PPC", "NXT",
  "MED", "NEC", "XWC", "ETHOS", "COS",
  "DAT", "MFG", "ADX", "TEN", "CPC",
  "CV", "BLZ", "UBT", "KICK", "NOW",
  "BAX", "UNCX", "MMUI", "ENQ", "RVN",
  "PAC", "FLIXX", "GO", "BOR", "DVPN",
  "BLOCK", "SHFT", "UQC", "BCPT", "NRG",
  "SSC", "VIBE", "XYO", "LYM", "ZPT",
  "TEN", "UBEX", "WPR", "UTNP", "ABL",
  "LINA", "QSP", "APIS", "0xBTC", "QBIT",
  "TPAY", "DXT", "YFDAI", "PMA", "INK",
  "NOIA", "XDC", "NLG", "GAZE", "FDX",
  "PKT", "SOMEE", "DCT", "WINGS", "SXDT",
  "GRID", "PLU", "IND", "EURS", "CAS",
  "KAT", "XRB", "GET", "MTX", "DEC",
  "XDN", "SHIP", "ZCL", "LINDA", "STX",
  "MSP", "GEN", "BITCNY", "BITUSD", "LBC",
  "ZAP", "DLT", "MOF", "PINK", "BTO"
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
  console.log("🐲 Injecting Godzilla Ban – Batch 3 (Top 201–300)...");
  console.log("🔐 Deployer:", deployer.address);

  const registry = await ethers.getContractAt(
    "TokenRegistry",
    "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14" // ✅ FINAL LOCKED TokenRegistry
  );

  const sanitizedNames = names.map(sanitizeName);
  const sanitizedSymbols = symbols.map(sanitizeSymbol);

  const tx = await registry.batchBanTokens(sanitizedNames, sanitizedSymbols);
  await tx.wait();

  console.log("✅ Batch 3 injected successfully — Additional 100 tokens now protected by Godzilla Firewall.");
}

module.exports = { names, symbols };

if (require.main === module) {
  main().catch((err) => {
    console.error("💥 Error injecting Batch 3:", err);
    process.exit(1);
  });
}













