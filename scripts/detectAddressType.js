// scripts/detectAddressType.js
// Usage:
//   ADDRESS=0x... npx hardhat run scripts/detectAddressType.js --network <network>
//
// Notes:
// - Detects EOA vs Contract via provider.getCode(address)
// - If Contract, probes ERC-20, ERC-721, ERC-1155
// - Handles best-effort proxies by trying token calls even if supportsInterface isn't present

const { ethers } = require("hardhat");

// Minimal ABIs
const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

const ERC165_ABI = [
  "function supportsInterface(bytes4 interfaceId) external view returns (bool)",
];

const ERC721_ID = "0x80ac58cd";
const ERC1155_ID = "0xd9b67a26";

function isAddressLike(s) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(s).trim());
}

async function getCode(provider, address) {
  try {
    return await provider.getCode(address);
  } catch (e) {
    throw new Error(`RPC getCode failed for ${address}: ${e.message || e}`);
  }
}

async function tryERC165(contract) {
  try {
    const i721 = await contract.supportsInterface(ERC721_ID);
    const i1155 = await contract.supportsInterface(ERC1155_ID);
    return { ok: true, is721: !!i721, is1155: !!i1155 };
  } catch {
    return { ok: false, is721: false, is1155: false };
  }
}

async function tryERC20(provider, address) {
  const c20 = new ethers.Contract(address, ERC20_ABI, provider);
  try {
    const [symbol, name, decimals] = await Promise.all([
      c20.symbol().catch(() => null),
      c20.name().catch(() => null),
      c20.decimals().catch(() => null),
    ]);

    // Heuristic: if at least one of symbol/name/decimals returns, we likely have an ERC-20
    const isLikelyErc20 = symbol !== null || name !== null || decimals !== null;

    if (isLikelyErc20) {
      let totalSupply = null;
      try {
        totalSupply = await c20.totalSupply();
      } catch {}
      return {
        isErc20: true,
        erc20: {
          symbol: symbol ?? "(unknown)",
          name: name ?? "(unknown)",
          decimals: decimals ?? "(?)",
          totalSupply: totalSupply ? totalSupply.toString() : "(unknown)",
        },
      };
    }
    return { isErc20: false };
  } catch {
    return { isErc20: false };
  }
}

async function main() {
  const address = process.env.ADDRESS?.trim();
  if (!address || !isAddressLike(address)) {
    console.error(
      "❌ Please provide a valid ADDRESS env var (0x…40 hex). Example:\n" +
        "ADDRESS=0x37f11967BfFAb482EF32B93F944180F7C3cE9Cac npx hardhat run scripts/detectAddressType.js --network sepolia"
    );
    process.exit(1);
  }

  const provider = ethers.provider;
  const network = await provider.getNetwork();
  console.log(`🌐 Network: ${network.name} (chainId=${network.chainId})`);
  console.log(`🔎 Address: ${address}`);

  const code = await getCode(provider, address);

  if (!code || code === "0x") {
    console.log("🟢 Type: EOA (wallet address)");
    return;
  }

  console.log("🟣 Type: Contract (bytecode present)");

  // Try ERC-165 first (many ERC-721/1155 implement it)
  const erc165 = new ethers.Contract(address, ERC165_ABI, provider);
  const { ok: has165, is721, is1155 } = await tryERC165(erc165);

  // If not 721/1155 via ERC165, try ERC-20 heuristics
  const erc20Res = await tryERC20(provider, address);

  if (is721) {
    console.log("📦 Detected: ERC-721 (NFT)");
    return;
  }
  if (is1155) {
    console.log("📦 Detected: ERC-1155 (multi-token)");
    return;
  }
  if (erc20Res.isErc20) {
    console.log("📦 Detected: ERC-20");
    console.log(
      `   • symbol: ${erc20Res.erc20.symbol}\n` +
        `   • name: ${erc20Res.erc20.name}\n` +
        `   • decimals: ${erc20Res.erc20.decimals}\n` +
        `   • totalSupply: ${erc20Res.erc20.totalSupply}`
    );
    return;
  }

  // If ERC165 present but neither 721 nor 1155 matched, or no ERC165 and not ERC-20:
  if (has165) {
    console.log("ℹ️ ERC-165 present, but not ERC-721/1155. Likely a non-token contract.");
  } else {
    console.log("ℹ️ Not ERC-165 and not ERC-20 by heuristics. Likely a non-token contract or non-standard token.");
  }
}

main().catch((e) => {
  console.error("❌ Error:", e.message || e);
  process.exit(1);
});
