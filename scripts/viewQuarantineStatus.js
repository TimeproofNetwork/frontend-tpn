// scripts/viewQuarantineStatus.js

const { ethers } = require("hardhat");
const registryABI =
  require("../artifacts/contracts/TokenRegistry.sol/TokenRegistry.json").abi;

// ✅ Final TokenRegistry address
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🔧 Input via env (prefer TOKEN; else build NAME+SYMBOL)
const tokenInput =
  (process.env.TOKEN && process.env.TOKEN.trim()) ||
  (process.env.NAME && process.env.SYMBOL
    ? `${process.env.NAME.trim()}+${process.env.SYMBOL.trim()}`
    : "");

if (!tokenInput) {
  console.error(
    "❌ Please provide TOKEN='name+symbol' or NAME and SYMBOL env variables.\n" +
      "   e.g. TOKEN='hobniscosive+hbcv' or NAME=hobniscosive SYMBOL=hbcv"
  );
  process.exit(1);
}

// Canonical sanitization (to match how you write)
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

function parseNameSymbol(input) {
  if (!input.includes("+")) {
    throw new Error(
      "Invalid TOKEN format. Expected 'name+symbol'. Example: hobniscosive+hbcv"
    );
  }
  const [rawName, rawSymbol] = input.split("+");
  if (!rawName || !rawSymbol) throw new Error("Missing name or symbol.");
  return {
    name: sanitizeInput(rawName),
    symbol: sanitizeInput(rawSymbol),
  };
}

async function main() {
  const registry = new ethers.Contract(
    TOKEN_REGISTRY,
    registryABI,
    ethers.provider
  );

  console.log(`🔍 Checking quarantine status for: ${tokenInput}`);

  try {
    const { name, symbol } = parseNameSymbol(tokenInput);
    console.log(`🔤 Sanitized Name: ${name}`);
    console.log(`🔤 Sanitized Symbol: ${symbol}`);

    // 🔒 Call contract view by strings (contract computes visualID internally)
    const isQuarantined = await registry.isQuarantined(name, symbol);

    if (isQuarantined) {
      console.log(`🚨 Quarantined: ${name} (${symbol})`);
    } else {
      console.log(`✅ Not Quarantined: ${name} (${symbol})`);
    }
  } catch (err) {
    console.error("❌ Error:", err.reason || err.message);
    process.exit(1);
  }
}

main();














