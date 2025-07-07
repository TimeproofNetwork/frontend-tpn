// scripts/scanTokenTrustScore.js

const { ethers } = require("hardhat");
const levenshtein = require("fast-levenshtein");
require("dotenv").config();

const TOKEN_REGISTRY = "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52";

function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name, symbol) {
  return sanitize(name + symbol);
}

function isSuspicious(candidate, root) {
  const n1 = sanitize(candidate.name);
  const n2 = sanitize(root.name);
  const s1 = sanitize(candidate.symbol);
  const s2 = sanitize(root.symbol);

  if (s1.length <= 3 && s2.length <= 3) {
    return levenshtein.get(n1, n2) <= 3 && levenshtein.get(s1, s2) <= 2;
  }

  if (s1.length > 3 && s2.length > 3) {
    return levenshtein.get(unified(candidate.name, candidate.symbol), unified(root.name, root.symbol)) <= 2;
  }

  return false;
}

async function main() {
  const nameRaw = process.env.NAME;
  const symbolRaw = process.env.SYMBOL;

  if (!nameRaw || !symbolRaw) {
    console.error("❌ NAME and SYMBOL must be set in environment.");
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);

  const tokensRaw = await registry.getTokenLogbook();
  const tokens = tokensRaw.map((t, i) => ({ ...t, index: i }));

  const nameSan = sanitize(nameRaw);
  const symbolSan = sanitize(symbolRaw);
  const unifiedInput = unified(nameSan, symbolSan);

  const inputIndex = tokens.findIndex(t => unified(t.name, t.symbol) === unifiedInput);
  const isRegistered = inputIndex !== -1;

  const input = isRegistered ? tokens[inputIndex] : {
    name: nameSan,
    symbol: symbolSan,
    tokenAddress: "❓ (Unregistered)",
    registeredBy: "undefined",
    timestamp: undefined,
    index: -1
  };

  let trustLevel = 0;
  try {
    if (isRegistered && input.tokenAddress) {
      const raw = await registry.getTrustDetails(input.tokenAddress);
      const trust = Array.isArray(raw) ? raw[2] : raw.trustLevel;
      trustLevel = ethers.BigNumber.isBigNumber(trust) ? trust.toNumber() : trust;
    }
  } catch (_) {}

  const trustBonus = trustLevel === 3 ? 50 : trustLevel === 2 ? 40 : trustLevel === 1 ? 10 : 0;
  const trustIcon = trustLevel === 3 ? "🟣" : trustLevel === 2 ? "🟢" : trustLevel === 1 ? "🟡" : "⚫";

  const isSC = symbolSan.length <= 3;

  const candidateRoots = tokens.filter(t => {
    if (t.index === input.index || !t.timestamp || (input.timestamp && t.timestamp >= input.timestamp)) return false;
    if (isSC) {
      return levenshtein.get(nameSan, sanitize(t.name)) <= 3 && levenshtein.get(symbolSan, sanitize(t.symbol)) <= 2;
    } else {
      return levenshtein.get(unifiedInput, unified(t.name, t.symbol)) <= 2;
    }
  }).map(t => {
    const totalEdit = isSC
      ? levenshtein.get(nameSan, sanitize(t.name)) + levenshtein.get(symbolSan, sanitize(t.symbol))
      : levenshtein.get(unifiedInput, unified(t.name, t.symbol));
    return { ...t, totalEdit };
  });

  candidateRoots.sort((a, b) => a.totalEdit !== b.totalEdit ? a.totalEdit - b.totalEdit : a.timestamp - b.timestamp);

  let cluster = [];
  let base = null;
  let closest = null;
  let score = 50;
  let isBase = false;

  if (candidateRoots.length > 0) {
    base = candidateRoots[0];

    const rawCluster = tokens.filter(t => isSuspicious(t, base));
    const uniqueMap = new Map(rawCluster.map(t => [unified(t.name, t.symbol), t]));
    const deduped = Array.from(uniqueMap.values());

    if (!deduped.find(t => t.index === input.index) && input.index !== -1) {
      deduped.push(input);
    }

    cluster = deduped;

    closest = cluster.reduce((min, t) => {
      if (t.index === base.index) return min;
      const dist = isSC
        ? levenshtein.get(nameSan, sanitize(t.name)) + levenshtein.get(symbolSan, sanitize(t.symbol))
        : levenshtein.get(unifiedInput, unified(t.name, t.symbol));
      const minDist = isSC
        ? levenshtein.get(nameSan, sanitize(min.name)) + levenshtein.get(symbolSan, sanitize(min.symbol))
        : levenshtein.get(unifiedInput, unified(min.name, min.symbol));
      if (dist < minDist || (dist === minDist && t.timestamp < min.timestamp)) return t;
      return min;
    }, cluster[0]);

    isBase = unified(base.name, base.symbol) === unifiedInput || (isRegistered && base.index === inputIndex);
    score = isBase ? 50 + trustBonus : 50 + trustBonus - (isSC ? 10 : 25);
  } else {
    score = 50 + trustBonus;
    isBase = true;
  }

  score = Math.max(0, score);

  // ✅ Output
  console.log(`\n🔎 Scanning Token: ${nameRaw} (${symbolRaw})`);
  console.log(`📦 Address: ${input.tokenAddress}`);
  console.log(`🧑 Creator: ${input.registeredBy}`);
  console.log(`📅 Registered: ${input.timestamp ? new Date(Number(input.timestamp) * 1000).toLocaleString("en-US") : "Unregistered"}`);
  console.log(`🔒 Trust Level: ${trustIcon} Level ${trustLevel}`);

  if (cluster.length > 0) {
    console.log(`\n🧠 Suspicion Cluster Detected (${cluster.length} tokens)`);
    console.log(`✅ Base Token: ${base.name} (${base.symbol}) | Registered at #${base.index}`);
    console.log(`📍 Closest Token: ${closest.name} (${closest.symbol}) | Registered at #${closest.index}`);
  }

  console.log(`\n📊 Estimated Trust Score: ${score}/100`);

  // ✅ Final recommendation block (fully corrected)
  if (score === 100) {
    console.log(`✅ Excellent — Audit and Exchange Verified — Maximum Trust Achieved.`);
  } else if (score === 90) {
    console.log(`🟢 Exchange Verified — High Trust.`);
  } else if (score === 60 && isBase && cluster.length === 0) {
    console.log(`🟢 Root Token — No Suspicion Clusters Found.`);
  } else if (score === 50) {
    console.log(`🟡 Caution — Investigate history before trusting.`);
  } else {
    console.log(`❗ Recommendation: Investigate token lineage before trusting.`);
  }
}

main().catch(err => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});




































































