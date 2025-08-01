// /scripts/scanCreatorTrustScore.js

const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

const TOKEN_REGISTRY = "0x0c1Fd60957B5192cd1A31ae3407F3F8bB57A26a6";

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
    editDistance(n1, n2) <= 3 &&
    editDistance(s1, s2) <= 2
  );
}

function isLSIC(a, b) {
  const s1 = sanitizeInput(a.symbol);
  if (s1.length <= 3) return false;
  const id1 = sanitizeInput(a.name + a.symbol);
  const id2 = sanitizeInput(b.name + b.symbol);
  return editDistance(id1, id2) <= 2;
}

async function main() {
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const tokens = [];
  for (let i = 0; i < 1000; i++) {
    try {
      const token = await Registry.tokenLogbook(i);
      tokens.push({
        name: token.name,
        symbol: token.symbol,
        address: token.tokenAddress,
        creator: token.registeredBy.toLowerCase(),
        timestamp: token.timestamp.toNumber(),
        index: i,
      });
    } catch {
      break;
    }
  }

  tokens.sort((a, b) => a.timestamp - b.timestamp);

  const creators = {};
  tokens.forEach(token => {
    if (!creators[token.creator]) {
      creators[token.creator] = [];
    }
    creators[token.creator].push(token);
  });

  const targetCreator = (process.env.CREATOR || "").toLowerCase();

  Object.entries(creators).forEach(([creator, creatorTokens]) => {
    if (targetCreator && creator !== targetCreator) return;

    console.log(`\n🔍 Suspicion Scan started by: ${creator}`);
    console.log(`📚 Fetching registered tokens from logbook...`);
    console.log(`✅ Fetched ${tokens.length} tokens from registry.`);
    console.log(`📦 Total tokens created: ${creatorTokens.length}\n`);

    let penalty = 0;
    let suspiciousCount = 0;

    creatorTokens.forEach(token => {
      const priorTokens = tokens.filter(t => t.timestamp < token.timestamp);
      for (const prior of priorTokens) {
        if (token.symbol.length <= 3) {
          if (isSC(token, prior)) {
            suspiciousCount++;
            penalty += 10;
            break;
          }
        } else {
          if (isLSIC(token, prior)) {
            suspiciousCount++;
            penalty += 25;
            break;
          }
        }
      }
    });

    const trustScore = Math.max(0, 100 - penalty);
    console.log(`✏️ Suspicious tokens found: ${suspiciousCount}`);
    console.log(`📊 Estimated Trust Score: ${trustScore}/100`);

    if (trustScore >= 90) {
      console.log(`✅ Creator is highly trustworthy.`);
    } else if (trustScore >= 60) {
      console.log(`⚠️ Moderate risk. Review token lineage.`);
    } else {
      console.log(`🚨 High risk. Creator may be deploying clones.`);
    }
  });
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});






































