const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

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

function isSC(a, b) {
  const n1 = sanitizeInput(a.name);
  const n2 = sanitizeInput(b.name);
  const s1 = sanitizeInput(a.symbol);
  const s2 = sanitizeInput(b.symbol);
  return (
    s1.length <= 3 &&
    s2.length <= 3 &&
    editDistance(n1, n2) <= 3 &&
    editDistance(s1, s2) <= 2
  );
}

function isLSIC(a, b) {
  const s1 = sanitizeInput(a.symbol);
  const s2 = sanitizeInput(b.symbol);
  if (s1.length <= 3 || s2.length <= 3) return false;
  const id1 = sanitizeInput(a.name + a.symbol);
  const id2 = sanitizeInput(b.name + b.symbol);
  return editDistance(id1, id2) <= 2;
}

async function main() {
  const creator = process.env.CREATOR;
  if (!creator) {
    console.error("❌ CREATOR address must be set in environment.");
    process.exit(1);
  }

  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const tokens = [];
  for (let i = 0; i < 1000; i++) {
    try {
      const token = await Registry.tokenLogbook(i);
      tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        creator: token.registeredBy,
        timestamp: token.timestamp.toNumber(),
        index: i,
      });
    } catch {
      break;
    }
  }

  const creatorTokens = tokens.filter(t => t.creator.toLowerCase() === creator.toLowerCase());

  if (creatorTokens.length === 0) {
    console.log(`❌ No tokens found for creator: ${creator}`);
    return;
  }

  console.log(`\n🔍 Suspicion Scan started by: ${creator}`);
  console.log(`📚 Fetching registered tokens from logbook...`);
  console.log(`✅ Fetched ${tokens.length} tokens from registry.`);

  let suspicious = 0;
  for (const token of creatorTokens) {
    const isClone = tokens.some(other =>
      other.index !== token.index && (isSC(token, other) || isLSIC(token, other))
    );
    if (isClone) suspicious++;
  }

  console.log(`\n📦 Total tokens created: ${creatorTokens.length}`);
  console.log(`🧪 Suspicious tokens found: ${suspicious}`);

  const trustScore = Math.max(0, 100 - suspicious * 10);
  console.log(`\n📊 Estimated Trust Score: ${trustScore}/100`);

  if (trustScore >= 90) {
    console.log("✅ Creator is highly trustworthy.");
  } else if (trustScore >= 60) {
    console.log("⚠️ Moderate risk. Review token lineage.");
  } else {
    console.log("🚨 High risk. Creator may be deploying clones.");
  }
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});


















