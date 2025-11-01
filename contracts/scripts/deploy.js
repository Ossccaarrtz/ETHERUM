const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...\n");

  // Get the network
  const network = hre.network.name;
  console.log(`📡 Deploying to network: ${network}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Deploy contract
  console.log("📝 Deploying EvidenceRegistry contract...");
  const EvidenceRegistry = await hre.ethers.getContractFactory("EvidenceRegistry");
  const contract = await EvidenceRegistry.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`✅ Contract deployed successfully!`);
  console.log(`📍 Contract address: ${contractAddress}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract (only on testnets/mainnets with explorers)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await contract.deploymentTransaction().wait(5);
    
    console.log("\n🔍 To verify the contract, run:");
    console.log(`npx hardhat verify --network ${network} ${contractAddress}`);
  }

  console.log("\n✨ Deployment complete!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});
