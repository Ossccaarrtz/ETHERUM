import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read contract ABI (compatible with all Node.js versions)
let contractABI;
try {
  contractABI = JSON.parse(
    readFileSync(join(__dirname, '../contracts/EvidenceRegistry.json'), 'utf-8')
  );
} catch (error) {
  console.warn('⚠️  Contract ABI not found. Blockchain features will use mock data.');
  contractABI = { abi: [] };
}

/**
 * Blockchain Service
 * Interacts with smart contracts on Arbitrum & Scroll
 */

/**
 * Store evidence on blockchain (STUB for now)
 * Will be fully implemented after contract deployment
 * @param {string} plate - Vehicle plate
 * @param {number} timestamp - Unix timestamp
 * @param {string} cid - IPFS CID
 * @returns {Promise<Object>} - Transaction hashes
 */
export async function storeEvidenceOnChain(plate, timestamp, cid) {
  console.log('📝 Blockchain stub called:');
  console.log(`   Plate: ${plate}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   CID: ${cid}`);

  // TODO: Implement after contract deployment
  // For now, return mock transaction hashes
  
  return {
    scrollTx: '0x' + 'mock'.padEnd(64, '0'),
    arbitrumTx: '0x' + 'mock'.padEnd(64, '0'),
  };
}

/**
 * Get evidence from blockchain
 * @param {string} plate - Vehicle plate
 * @param {number} timestamp - Unix timestamp
 * @param {string} network - 'scroll' or 'arbitrum'
 * @returns {Promise<string>} - IPFS CID from blockchain
 */
export async function getEvidenceFromChain(plate, timestamp, network = 'scroll') {
  // TODO: Implement after contract deployment
  throw new Error('Blockchain read not yet implemented');
}

/**
 * Setup provider and contract (for future use)
 */
function getContract(network) {
  const rpcUrl = network === 'scroll' 
    ? env.SCROLL_RPC_URL 
    : env.ARBITRUM_RPC_URL;
    
  const contractAddress = network === 'scroll'
    ? env.SCROLL_CONTRACT_ADDRESS
    : env.ARBITRUM_CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error(`${network} blockchain not configured yet`);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    wallet
  );

  return { contract, provider, wallet };
}
