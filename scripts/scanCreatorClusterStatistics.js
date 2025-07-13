const { ethers } = require("hardhat");
const { sanitizeInput } = require("./sanitizeInputs");

const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1]) ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function isSC(inputToken, priorToken) {
  const n1 = sanitizeInput(inputToken.name);
  const n2 = sanitizeInput(priorToken.name);
  const s1 = sanitizeInput(inputToken.symbol);
  const s2 = sanitizeInput(priorToken.symbol);
  return editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 2;
}

function isLSIC(inputToken, priorToken) {
  const id1 = sanitizeInput(inputToken.name + inputToken.symbol);
  const id2 = sanitizeInput(priorToken.name + priorToken.symbol);
  return editDistance(id1, id2) <= 2;
}

async function main() {
  const Registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const creatorEnv = process.env.CREATOR || "";
  const [deployer] = await ethers.getSigners();
  const usedWallet = (creatorEnv || deployer.address).toLowerCase();

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
      creator: token.registeredBy.toLowerCase(),
      timestamp: token.timestamp.toNumber(),
      index: i,
    });
  } catch {
    break;
  }
}

// ✅ Enforce strict chronological order for accurate root and cluster detection
tokens.sort((a, b) => a.timestamp - b.timestamp);


  console.log(`✅ Fetched ${tokens.length} tokens from registry.`);

  const clusters = [];
  const assignedTokens = new Set();
  const rootTokens = new Set();

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const priorTokens = tokens.filter(t => t.timestamp < token.timestamp);
    let isRoot = true;

    for (const prior of priorTokens) {
      const inputIsSC = token.symbol.length <= 3;

      if (inputIsSC && isSC(token, prior)) {
        isRoot = false;
        break;
      }

      if (!inputIsSC && isLSIC(token, prior)) {
        isRoot = false;
        break;
      }
    }

    if (isRoot) rootTokens.add(token.index);
  }

  for (let i = 0; i < tokens.length; i++) {
    const base = tokens[i];

    if (!rootTokens.has(base.index)) continue;
    if (assignedTokens.has(base.index)) continue;

    const cluster = [base];

    for (let j = i + 1; j < tokens.length; j++) {
      const candidate = tokens[j];
      if (candidate.timestamp <= base.timestamp) continue;
      if (assignedTokens.has(candidate.index)) continue;

      if (candidate.symbol.length <= 3) {
        if (isSC(candidate, base)) cluster.push(candidate);
      } else {
        if (isLSIC(candidate, base)) cluster.push(candidate);
      }
    }

    if (cluster.length < 2) continue;

    const alreadyAssigned = cluster.some(t => assignedTokens.has(t.index));
    if (alreadyAssigned) continue;

    clusters.push(cluster);
    cluster.forEach(t => assignedTokens.add(t.index));
  }

  const creatorStats = {};

  tokens.forEach(token => {
    const addr = token.creator;
    if (!creatorStats[addr]) {
      creatorStats[addr] = { total: 0, clusters: new Set(), contribution: 0 };
    }
    creatorStats[addr].total++;
  });

  clusters.forEach((cluster, idx) => {
    const baseCreator = cluster[0].creator;

    cluster.forEach(token => {
  const addr = token.creator;
  if (!creatorStats[addr]) return;
  creatorStats[addr].clusters.add(idx);
  creatorStats[addr].contribution++;
});

  });

  const scores = Object.entries(creatorStats)
    .filter(([_, data]) => data.clusters.size > 0 && data.contribution >= 1)
    .map(([creator, data]) => {
      const clusterCount = data.clusters.size;
      const clusterContribution = data.contribution;
      const crs = (clusterCount * clusterContribution) + (clusterCount / data.total);
      return {
        creator,
        clusterCount,
        clusterContribution,
        crs: crs.toFixed(2),
      };
    })
    .sort((a, b) => Number(b.crs) - Number(a.crs));

  console.log(`\n🔎 Identified ${clusters.length} suspicion clusters.`);
  console.log("\n📊 Ranked Creator Cluster Scores:\n");

  const top = scores[0];
  const targetIndex = scores.findIndex(s => s.creator === usedWallet);
  const target = targetIndex !== -1 ? scores[targetIndex] : null;

  if (top && (!target || top.creator !== usedWallet)) {
    console.log(`#1  🧑‍💻 ${top.creator} → Clusters: ${top.clusterCount} | Cluster Contribution: ${top.clusterContribution}`);
  }

  if (target) {
    const rank = targetIndex + 1;
    console.log(`#${rank}  🧑‍💻 ${target.creator} → Clusters: ${target.clusterCount} | Cluster Contribution: ${target.clusterContribution}`);
  } else {
    console.log(`❌ No clusters found for ${usedWallet}`);
  }
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});






































































