import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const contractABI = [
  {
    "name": "storeEvidence",
    "type": "function",
    "inputs": [
      {"name": "recordId", "type": "string"},
      {"name": "plate", "type": "string"},
      {"name": "ipfsCid", "type": "string"},
      {"name": "hash", "type": "string"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getTotalRecords",
    "type": "function",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  }
];

async function checkNetwork(network, rpcUrl, contractAddress, privateKey) {
  console.log(`\n🔍 Checking ${network}...`);
  console.log('─'.repeat(60));
  
  try {
    console.log(`📡 RPC URL: ${rpcUrl}`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const networkInfo = await provider.getNetwork();
    console.log(`✅ Connected to chain ID: ${networkInfo.chainId}`);
    
    console.log(`📍 Contract: ${contractAddress}`);
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log(`❌ ERROR: No contract code at this address!`);
      console.log(`   The contract was NOT deployed to this address.`);
      console.log(`   You need to redeploy the contract.`);
      return false;
    }
    console.log(`✅ Contract code found (${code.length} bytes)`);
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`👤 Wallet: ${wallet.address}`);
    
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.log(`⚠️  WARNING: No balance! Get testnet ETH to send transactions.`);
    }
    
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    try {
      const totalRecords = await contract.getTotalRecords();
      console.log(`📊 Total records on chain: ${totalRecords}`);
    } catch (error) {
      console.log(`⚠️  Could not read from contract: ${error.message}`);
    }
    
    console.log(`✅ ${network} configuration is VALID`);
    return true;
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔧 BLOCKCHAIN CONFIGURATION CHECK');
  console.log('═'.repeat(60));
  
  const scrollRpc = process.env.SCROLL_RPC_URL;
  const arbitrumRpc = process.env.ARBITRUM_RPC_URL;
  const scrollContract = process.env.SCROLL_CONTRACT_ADDRESS;
  const arbitrumContract = process.env.ARBITRUM_CONTRACT_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  
  console.log(`\n📋 Current Configuration:`);
  console.log(`   SCROLL_RPC_URL: ${scrollRpc}`);
  console.log(`   ARBITRUM_RPC_URL: ${arbitrumRpc}`);
  console.log(`   SCROLL_CONTRACT: ${scrollContract}`);
  console.log(`   ARBITRUM_CONTRACT: ${arbitrumContract}`);
  console.log(`   PRIVATE_KEY: ${privateKey ? privateKey.substring(0, 10) + '...' : 'NOT SET'}`);
  
  let cleanPrivateKey = privateKey;
  if (privateKey && privateKey.startsWith('0x')) {
    console.log('\n⚠️  NOTE: PRIVATE_KEY has 0x prefix (will be handled automatically)');
    cleanPrivateKey = privateKey.substring(2);
  }
  
  const formattedKey = '0x' + cleanPrivateKey;
  
  const scrollOk = await checkNetwork('Scroll Sepolia', scrollRpc, scrollContract, formattedKey);
  const arbitrumOk = await checkNetwork('Arbitrum Sepolia', arbitrumRpc, arbitrumContract, formattedKey);
  
  console.log('\n═'.repeat(60));
  console.log('📋 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Scroll Sepolia:    ${scrollOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Arbitrum Sepolia:  ${arbitrumOk ? '✅ OK' : '❌ FAILED'}`);
  
  if (scrollOk && arbitrumOk) {
    console.log('\n🎉 Everything looks good! Your blockchain integration should work.');
    console.log('   Restart your backend and try uploading evidence.');
  } else {
    console.log('\n⚠️  Fix the issues above before continuing.');
    console.log('\nCommon fixes:');
    console.log('   1. Wrong RPC URLs → Update SCROLL_RPC_URL and ARBITRUM_RPC_URL in .env');
    console.log('   2. No contract at address → Redeploy contracts and update addresses');
    console.log('   3. No balance → Get testnet ETH from faucets');
  }
  
  console.log('\n');
}

main().catch(console.error);
