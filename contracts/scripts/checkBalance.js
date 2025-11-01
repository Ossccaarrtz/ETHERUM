require("dotenv").config();
const { ethers } = require("ethers");

async function check(network, rpc) {
  console.log(`\n🔍 Checking balance on ${network}...`);

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(`Address: ${wallet.address}`);

  const bal = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.utils.formatEther(bal)} ETH\n`);
}

async function main() {
  await check("Scroll Sepolia", process.env.SCROLL_RPC_URL);
  await check("Arbitrum Sepolia", process.env.ARBITRUM_RPC_URL);
}

main();
