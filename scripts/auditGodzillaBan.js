// auditGodzillaBan.js
const { ethers } = require("hardhat");
const { names, symbols } = require("./injectGodzillaBanBatch5"); // ✅ Choose the batch you want to audit

// ✅ 1:1 match with TokenRegistry.sol sanitization logic
function sanitize(input) {
  const b = [...input];
  const result = [];

  for (let i = 0; i < b.length; i++) {
    const c = b[i].charCodeAt(0);
    if (c >= 65 && c <= 90) {
      result.push(String.fromCharCode(c + 32)); // A-Z to a-z
    } else if ((c >= 97 && c <= 122) || (c >= 48 && c <= 57)) {
      result.push(b[i]); // keep a-z or 0-9
    }
    // skip all other characters
  }

  return result.join('');
}

function computeVisualID(name, symbol) {
  const sanitized = sanitize(name) + sanitize(symbol);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(sanitized));
}

async function main() {
  const registry = await ethers.getContractAt(
    "TokenRegistry",
    "0x92aCF7E58E8C65d0Aad3ed4B252c064737Ad9B52" // ✅ FINAL LOCKED TokenRegistry
  );

  console.log(`\n🔍 Auditing Godzilla Ban – ${names.length} tokens from current batch...`);

  let bannedCount = 0;

  for (let i = 0; i < names.length; i++) {
    const hash = computeVisualID(names[i], symbols[i]);
    const isBanned = await registry.globalBanList(hash);

    if (isBanned) {
      console.log(`✅ BANNED: ${names[i]} (${symbols[i]})`);
      bannedCount++;
    } else {
      console.log(`❌ NOT BANNED: ${names[i]} (${symbols[i]})`);
    }
  }

  console.log(`\n🧾 Audit Summary: ${bannedCount} of ${names.length} tokens banned.`);
}

main().catch((err) => {
  console.error("💥 Audit failed:", err);
  process.exit(1);
});



























