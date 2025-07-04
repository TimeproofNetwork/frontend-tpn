const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();

  console.log(`🔧 Starting nonce cleanup for wallet: ${address}`);

  const latestNonce = await signer.getTransactionCount("latest");
  const pendingNonce = await signer.getTransactionCount("pending");

  if (pendingNonce <= latestNonce) {
    console.log("✅ No stuck nonces found.");
    return;
  }

  console.log(`🔁 Sending self-transactions from nonce ${latestNonce} to ${pendingNonce - 1}...`);

  for (let nonce = latestNonce; nonce < pendingNonce; nonce++) {
    const gasPriceGwei = 30 + (nonce - latestNonce) * 10; // Increasing fee per stuck tx

    try {
      const tx = await signer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther("0.00001"),
        nonce,
        gasLimit: 21000,
        maxPriorityFeePerGas: ethers.utils.parseUnits((gasPriceGwei - 10).toString(), "gwei"),
        maxFeePerGas: ethers.utils.parseUnits(gasPriceGwei.toString(), "gwei")
      });

      console.log(`✅ Sent tx with nonce ${nonce}: ${tx.hash}`);
    } catch (err) {
      console.log(`❌ Error with nonce ${nonce}: ${err.message}`);
    }
  }

  console.log("🏁 Cleanup script finished.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
