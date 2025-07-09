// /scripts/scanCreatorTrustScore.js

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
    editDistance(n1, n2) <= 3 &&
    editDistance(s1, s2) <= 2
  );
}

function isLSIC(a, b) {
  const s1 = sanitizeInput(a.symbol);
  const s2 = sanitizeInput(b.symbol);
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

    let penalty = 0;
    let suspiciousCount = 0;

    creatorTokens.forEach(token => {
      const priorTokens = tokens.filter(t => t.timestamp < token.timestamp);

      let matched = false;

      for (const prior of priorTokens) {
        const isPriorRoot = !priorTokens.some(pt => pt.timestamp < prior.timestamp && (isSC(prior, pt) || isLSIC(prior, pt)));

        if (!isPriorRoot) continue;

        if (token.symbol.length <= 3) {
          if (isSC(token, prior)) {
            penalty += 10;
            suspiciousCount++;
            matched = true;
            break;
          }
        } else {
          if (isLSIC(token, prior)) {
            penalty += 25;
            suspiciousCount++;
            matched = true;
            break;
          }
        }
      }
    });

    const trustScore = Math.max(0, 100 - penalty);

    console.log(`\n🔍 Creator: ${creator}`);
    console.log(`📦 Total tokens created: ${creatorTokens.length}`);
    console.log(`🧪 Suspicious tokens found (self and external clones): ${suspiciousCount}`);
    console.log(`📊 Estimated Trust Score: ${trustScore}/100`);

    if (trustScore >= 90) {
      console.log("✅ Creator is highly trustworthy.");
    } else if (trustScore >= 60) {
      console.log("⚠️ Moderate risk. Review token lineage.");
    } else {
      console.log("🚨 High risk. Creator may be deploying clones.");
    }
  });
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});





































