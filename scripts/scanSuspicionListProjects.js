// scripts/scanSuspicionListProjects.js

const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

// ✅ Final TokenRegistry Address (Locked Phase 1)
const TPN_TOKEN = "0xA7e3976928332e90DE144f6d4c6393B64E37bf6C";
const BADGE_NFT = "0x49A5f62fEb8ADd7323cc14a205a60608378c1D75";
const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

// 🧠 Edit Distance Calculator
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1])
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// 🛡️ Suspicion Logic
function isSuspicious(candidate, target) {
  const n1 = sanitizeInput(candidate.name);
  const n2 = sanitizeInput(target.name);
  const s1 = sanitizeInput(candidate.symbol);
  const s2 = sanitizeInput(target.symbol);

  const nameDist = editDistance(n1, n2);
  const symbolDist = editDistance(s1, s2);

  const sameSymbol = s1 === s2;
  const sameName = n1 === n2;

  const suspicion1 = sameSymbol && nameDist >= 1 && nameDist <= 3;
  const suspicion2 = sameName && symbolDist >= 1 && symbolDist <= 2;
  const suspicion3 = nameDist <= 2 && symbolDist <= 1;

  let lsicMatch = false;
  if (s1.length > 3 && s2.length > 3) {
    const id1 = sanitizeInput(n1 + s1);
    const id2 = sanitizeInput(n2 + s2);
    const idDist = editDistance(id1, id2);
    lsicMatch = idDist <= 2;
  }

  return {
    suspicious: suspicion1 || suspicion2 || suspicion3 || lsicMatch,
    nameDist,
    symbolDist,
    lsicMatch
  };
}

// 🔎 Scan a single token against the full logbook
async function scanSuspicion(input) {
  const [deployer] = await ethers.getSigners();
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  console.log("\n🔍 Creator Suspicion Scan initiated by:", deployer.address);
  console.log("📚 Fetching registered tokens from logbook...");

  const tokens = [];
  const MAX = 1000;

  for (let i = 0; i < MAX; i++) {
    try {
      const token = await Registry.tokenLogbook(i);
      tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        creator: token.registeredBy,
        logbookIndex: i
      });
    } catch {
      break;
    }
  }

  console.log(`✅ Fetched ${tokens.length} tokens from registry.`);

  const cluster = tokens
    .map((token) => ({
      ...token,
      match: isSuspicious(input, token)
    }))
    .filter((x) => x.match.suspicious);

  if (cluster.length === 0) {
    console.log(`\n✅ No suspicion cluster found for "${input.name}" (${input.symbol}). Safe to register.`);
    return;
  }

  cluster.sort((a, b) => a.logbookIndex - b.logbookIndex);
  const base = cluster[0];
  const latest = cluster[cluster.length - 1];

  console.log(`\n⚠️ Warning: Suspicion Cluster Detected for: ${input.name} (${input.symbol})`);
  console.log(`🔵 Cluster Size: ${cluster.length}`);
  console.log(`✅ Base Token: ${base.name} (${base.symbol}) | Registered at #${base.logbookIndex}`);
  console.log(`📍 Closest Token: ${latest.name} (${latest.symbol}) | Registered at #${latest.logbookIndex}`);

  if (cluster.some(t => t.match.lsicMatch)) {
    console.log(`🧪 LSIC Triggered: Long symbol identity collision suspected.`);
  }

  console.log(`\n🚫 Recommendation: Change name/symbol before proceeding to avoid confusion or flagging.`);
}

// 🧪 Precheck These Tokens Before Registry Submission
async function main() {
  await scanSuspicion({ name: "quantevo", symbol: "qevi" });
  await scanSuspicion({ name: "solvantist", symbol: "svst" });
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});










