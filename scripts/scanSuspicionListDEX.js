// scripts/scanSuspicionListDEX.js
const { ethers } = require("hardhat");
require("dotenv").config();

const TOKEN_REGISTRY = "0xeE556A91B2E71D4fb9280C988e9CcA80dDb61D14";

function sanitize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function unified(name, symbol) {
  return sanitize(name + symbol);
}

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

function isSuspicious(candidate, root) {
  const n1 = sanitize(candidate.name);
  const n2 = sanitize(root.name);
  const s1 = sanitize(candidate.symbol);
  const s2 = sanitize(root.symbol);

  if (s1.length <= 3 && s2.length <= 3) {
    return editDistance(n1, n2) <= 3 && editDistance(s1, s2) <= 2;
  }

  if (s1.length > 3 && s2.length > 3) {
    const id1 = unified(candidate.name, candidate.symbol);
    const id2 = unified(root.name, root.symbol);
    return editDistance(id1, id2) <= 2;
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

  const registry = await ethers.getContractAt("TokenRegistry", TOKEN_REGISTRY);
  const rawTokens = await registry.getTokenLogbook();
  const tokens = rawTokens.map((t, i) => ({ ...t, index: i }));

  const nameSan = sanitize(nameRaw);
  const symbolSan = sanitize(symbolRaw);
  const inputIndex = tokens.findIndex(t => sanitize(t.name) === nameSan && sanitize(t.symbol) === symbolSan);
  const input = inputIndex !== -1 ? tokens[inputIndex] : {
    name: nameSan,
    symbol: symbolSan,
    tokenAddress: "❓ (Unregistered)",
    registeredBy: "undefined",
    timestamp: undefined,
    index: -1,
  };

  console.log(`\n🔎 Scanning Token: ${nameRaw} (${symbolRaw})`);
  console.log(`📦 Address: ${input.tokenAddress}`);
  console.log(`🧑 Creator: ${input.registeredBy}`);
  console.log(`📅 Registered: ${input.timestamp ? new Date(Number(input.timestamp) * 1000).toLocaleString("en-US") : "Unregistered"}`);

  let trustLevel = 0;
  try {
    if (input.tokenAddress !== "❓ (Unregistered)") {
      const details = await registry.getTrustDetails(input.tokenAddress);
      trustLevel = parseInt(details.trustLevel || details[0]);
    }
  } catch (_) { trustLevel = 0; }
  const trustIcons = ["⚫", "🟡", "🟢", "🟣"];
  const trustText = ["Level 0", "Level 1", "Level 2", "Level 3"];
  console.log(`🔒 Trust Level: ${trustIcons[trustLevel] || "⚫"} ${trustText[trustLevel] || "Level 0"}`);

  const isSC = sanitize(input.symbol).length <= 3;

  let candidateRoots = [];
  for (const token of tokens) {
    if (token.index === input.index) continue;
    if (!token.timestamp || (input.timestamp && token.timestamp >= input.timestamp)) continue;
    const nameEdit = editDistance(sanitize(input.name), sanitize(token.name));
    const symEdit = editDistance(sanitize(input.symbol), sanitize(token.symbol));
    const totalEdit = nameEdit + symEdit;
    const unifiedEdit = editDistance(unified(input.name, input.symbol), unified(token.name, token.symbol));

    if (isSC && nameEdit <= 3 && symEdit <= 2) {
      candidateRoots.push({ ...token, totalEdit });
    } else if (!isSC && unifiedEdit <= 2) {
      candidateRoots.push({ ...token, totalEdit: unifiedEdit });
    }
  }

  if (candidateRoots.length === 0) {
    console.log(`\n✅ No suspicious tokens found. Safe to proceed.`);
    return;
  }

  candidateRoots.sort((a, b) => {
    if (a.totalEdit !== b.totalEdit) return a.totalEdit - b.totalEdit;
    return a.timestamp - b.timestamp;
  });

  const root = candidateRoots[0];
  const cluster = tokens.filter(t => isSuspicious(t, root));
  const unique = new Map(cluster.map(t => [unified(t.name, t.symbol), t]));
  const all = Array.from(unique.values());

  // ✅ Ensure input is included before last member calculation
  if (!all.find(t => t.index === input.index) && input.index !== -1) {
    all.push(input);
  }

  const registeredInput = tokens.find(t => sanitize(t.name) === nameSan && sanitize(t.symbol) === symbolSan);
  const inputDisplay = registeredInput
    ? `📌 Input Token: ${registeredInput.name} (${registeredInput.symbol}) | Registered at #${registeredInput.index}`
    : `📌 Input Token: ${sanitize(nameRaw)} (${sanitize(symbolRaw)}) | Unregistered`;

  let closest = null, minEdit = Infinity;
  for (const token of all) {
    if (token.index === root.index) continue;
    const dist = isSC
      ? editDistance(sanitize(root.name), sanitize(token.name)) + editDistance(sanitize(root.symbol), sanitize(token.symbol))
      : editDistance(unified(root.name, root.symbol), unified(token.name, token.symbol));
    if (dist < minEdit || (dist === minEdit && (!closest || token.timestamp < closest.timestamp))) {
      minEdit = dist;
      closest = token;
    }
  }

  const lastMember = all.reduce((latest, curr) => curr.timestamp > latest.timestamp ? curr : latest, all[0]);

  console.log(`\n🧠 Suspicion Cluster Detected (${all.length} tokens)`);
  console.log(`✅ Base Token: ${root.name} (${root.symbol}) | Registered at #${root.index}`);
  console.log(inputDisplay);
  console.log(`📍 Closest Token: ${closest.name} (${closest.symbol}) | Registered at #${closest.index}`);
  console.log(`🧩 Last Member: ${lastMember.name} (${lastMember.symbol}) | Registered at #${lastMember.index}`);
  console.log(`\n🚨 Recommendation: DEX Listing Risk – Review cluster before proceeding.`);
}

main().catch((err) => {
  console.error("❌ Scan Failed:", err);
  process.exit(1);
});

























































































