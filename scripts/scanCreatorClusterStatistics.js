const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

// ----------------------------
// Edit Distance Function
// ----------------------------
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// ----------------------------
// Canonical Golden Clustering Rule
// ----------------------------
function isSuspicious(candidate, root) {
  const n1 = sanitizeInput(candidate.name);
  const n2 = sanitizeInput(root.name);
  const s1 = sanitizeInput(candidate.symbol);
  const s2 = sanitizeInput(root.symbol);

  const nameDist = editDistance(n1, n2);
  const symbolDist = editDistance(s1, s2);

  if (s1.length <= 3 && s2.length <= 3) {
    return nameDist <= 3 && symbolDist <= 2;
  }

  if (s1.length > 3 && s2.length > 3) {
    const id1 = sanitizeInput(n1 + s1);
    const id2 = sanitizeInput(n2 + s2);
    return editDistance(id1, id2) <= 2;
  }

  return false;
}

// ----------------------------
// Main
// ----------------------------
async function scanCreatorClusterStatistics() {
  const creatorEnv = process.env.CREATOR;
  const [deployer] = await ethers.getSigners();
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const usedWallet = creatorEnv || deployer.address;
  console.log(`\n🔍 Scanning registered tokens using: ${usedWallet}`);
  console.log("📚 Fetching registered tokens from logbook...");

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
        logbookIndex: i,
      });
    } catch {
      break;
    }
  }

  console.log(`✅ Fetched ${tokens.length} tokens from registry.`);

  const clusters = [];
  const clustered = new Set();

  for (let i = 0; i < tokens.length; i++) {
    if (clustered.has(i)) continue;

    const root = tokens[i];
    const cluster = [root];

    for (let j = 0; j < tokens.length; j++) {
      if (i === j) continue;
      if (isSuspicious(tokens[j], root)) {
        cluster.push(tokens[j]);
        clustered.add(j);
      }
    }

    if (cluster.length > 1) {
      cluster.forEach((t) => clustered.add(t.logbookIndex));
      clusters.push(cluster);
    }
  }

  // ----------------------------
  // Creator Score Summary
  // ----------------------------
  const scoreMap = {}; // creator => { clusters: Set, total: count }

  clusters.forEach((cluster, idx) => {
    const counted = new Set();
    cluster.forEach((token) => {
      const addr = token.creator;
      if (!scoreMap[addr]) {
        scoreMap[addr] = { clusters: new Set(), total: 0 };
      }
      scoreMap[addr].total += 1;
      if (!counted.has(addr)) {
        scoreMap[addr].clusters.add(idx);
        counted.add(addr);
      }
    });
  });

  const scores = Object.entries(scoreMap)
    .filter(([addr]) => addr.toLowerCase() === usedWallet.toLowerCase())
    .map(([creator, data]) => ({
      creator,
      clusterCount: data.clusters.size,
      tokenCount: data.total,
    }));

  scores.sort((a, b) => b.clusterCount - a.clusterCount || b.tokenCount - a.tokenCount);

  let output = "";

  if (scores.length === 0) {
    console.log(`\n⚠️ No clusters found for ${usedWallet}`);
    output = `⚠️ No clusters found for ${usedWallet}`;
  } else {
    console.log(`\n🔎 Identified ${clusters.length} suspicion clusters.`);
    console.log("\n📊 Ranked Creator Cluster Scores:\n");

    scores.forEach((entry, i) => {
      const { creator, clusterCount, tokenCount } = entry;
      const line = `#${i + 1}  🧑‍💻 ${creator} → Clusters: ${clusterCount} | Tokens: ${tokenCount}`;
      console.log(line);
      output += line + "\n";
    });
  }

  // ✅ FINAL CONSOLE OUTPUT FOR FRONTEND RESPONSE
  console.log("\n📤 Output Start\n" + output.trim());
}

scanCreatorClusterStatistics().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});














