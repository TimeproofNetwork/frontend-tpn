const { ethers } = require("hardhat");

async function main() {
  const TPN_TOKEN = "0xA9ddbBFa1D21330D646ae32AA2a64A46F7c05572";    // ✅ TPN Token Contract
  const recipient = "0x0BFCe2536b3b497B2520f4d05D9BC6676BFfFcB8";    // 🔑 Replace with actual recipient
  const amount = ethers.utils.parseUnits("100000000", 18);           // ✅ Amount: 100 TPN (adjust as needed)

  const [deployer] = await ethers.getSigners();                      // 💳 Your wallet (must hold TPN)
  const token = await ethers.getContractAt("TPNToken", TPN_TOKEN);

  console.log(`⏳ Sending 100000000 TPN to ${recipient}...`);
  const tx = await token.transfer(recipient, amount);
  await tx.wait();
  console.log(`✅ Successfully sent 100000000 TPN to ${recipient}`);
  console.log(`📦 Tx Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
