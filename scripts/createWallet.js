const { Wallet } = require("ethers");

async function main() {
  const wallet = Wallet.createRandom();
  console.log("🔐 Wallet Address:", wallet.address);
  console.log("🔑 Private Key:   ", wallet.privateKey);
  console.log("🧠 Mnemonic:       ", wallet.mnemonic.phrase);
}

main();
