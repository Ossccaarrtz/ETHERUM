const hre = require("hardhat");

async function main() {
  console.log("💰 Checking account balance across networks...\n");

  const networks = [
    { name: "scrollSepolia", displayName: "Scroll Sepolia Testnet", explorer: "https://sepolia.scrollscan.com" },
    { name: "arbitrumSepolia", displayName: "Arbitrum Sepolia Testnet", explorer: "https://sepolia.arbiscan.io" },
  ];

  // Get the wallet address from private key
  const [signer] = await hre.ethers.getSigners();
  const address = signer.address;
  
  console.log(`👤 Wallet Address: ${address}\n`);
  console.log("=" .repeat(80));

  for (const network of networks) {
    try {
      console.log(`\n🌐 ${network.displayName}`);
      console.log("-".repeat(80));

      // Get RPC URL from config
      const networkConfig = hre.config.networks[network.name];
      if (!networkConfig || !networkConfig.url) {
        console.log(`⚠️  Network not configured or RPC URL missing`);
        continue;
      }

      // Create provider for this network
      const provider = new hre.ethers.JsonRpcProvider(networkConfig.url);
      
      // Get balance
      const balance = await provider.getBalance(address);
      console.log(`💵 Balance: ${hre.ethers.formatEther(balance)} ETH`);

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPriceGwei = hre.ethers.formatUnits(feeData.gasPrice, "gwei");
      console.log(`⛽ Gas Price: ${gasPriceGwei} gwei`);

      // Get block number
      const blockNumber = await provider.getBlockNumber();
      console.log(`📦 Block Number: ${blockNumber}`);

      // Estimate deployment cost
      const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
      const deploymentData = EvidenceRegistry.getDeployTransaction();
      
      try {
        const estimatedGas = await provider.estimateGas(deploymentData);
        const estimatedCost = estimatedGas * feeData.gasPrice;
        
        console.log(`\n📊 Estimated Deployment Cost:`);
        console.log(`   Gas Units: ${estimatedGas.toString()}`);
        console.log(`   Total Cost: ${hre.ethers.formatEther(estimatedCost)} ETH`);
        console.log(`   Cost in USD (approx @$2000/ETH): $${(parseFloat(hre.ethers.formatEther(estimatedCost)) * 2000).toFixed(2)}`);
        
        if (balance < estimatedCost) {
          console.log(`\n⚠️  WARNING: Insufficient balance for deployment!`);
          console.log(`   Required: ${hre.ethers.formatEther(estimatedCost)} ETH`);
          console.log(`   Missing: ${hre.ethers.formatEther(estimatedCost - balance)} ETH`);
          
          // Provide faucet links
          if (network.name === "scrollSepolia") {
            console.log(`\n💧 Get testnet ETH from Scroll Sepolia faucet:`);
            console.log(`   https://sepolia.scroll.io/faucet`);
          } else if (network.name === "arbitrumSepolia") {
            console.log(`\n💧 Get testnet ETH from Arbitrum Sepolia faucet:`);
            console.log(`   https://faucet.quicknode.com/arbitrum/sepolia`);
          }
        } else {
          const remaining = balance - estimatedCost;
          console.log(`\n✅ Sufficient balance for deployment`);
          console.log(`   Remaining after deploy: ${hre.ethers.formatEther(remaining)} ETH`);
        }
      } catch (error) {
        console.log(`\n⚠️  Could not estimate deployment cost: ${error.message}`);
      }

      console.log(`\n🔍 View address on explorer:`);
      console.log(`   ${network.explorer}/address/${address}`);

    } catch (error) {
      console.log(`❌ Error checking ${network.displayName}:`);
      console.log(`   ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n✨ Balance check complete!");
  
  console.log("\n📝 Next steps:");
  console.log("   1. Make sure you have sufficient balance on the network you want to deploy to");
  console.log("   2. Run: npm run deploy:scroll (for Scroll Sepolia)");
  console.log("   3. Or run: npm run deploy:arbitrum (for Arbitrum Sepolia)");
}

main().catch((error) => {
  console.error("\n❌ Script failed:");
  console.error(error);
  process.exitCode = 1;
});
