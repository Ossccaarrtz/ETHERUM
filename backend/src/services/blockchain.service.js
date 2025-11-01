import { ethers } from 'ethers';
import env from '../config/env.js';

// ABI del contrato EvidenceRegistry actualizado
const contractABI = [
  {
    "name": "EvidenceStored",
    "type": "event",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "plate",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "ipfsCid",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "hash",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "submittedBy",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "EvidenceUpdated",
    "type": "event",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "newIpfsCid",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "newHash",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "updatedBy",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "name": "getEvidence",
    "type": "function",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {
            "name": "plate",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "ipfsCid",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "hash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "timestamp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "submittedBy",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "exists",
            "type": "bool",
            "internalType": "bool"
          }
        ],
        "internalType": "struct EvidenceRegistry.Evidence"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getRecordIdByIndex",
    "type": "function",
    "inputs": [
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "getTotalRecords",
    "type": "function",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "recordExists",
    "type": "function",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "records",
    "type": "function",
    "inputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "plate",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "ipfsCid",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "hash",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "submittedBy",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "exists",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "storeEvidence",
    "type": "function",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "plate",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "ipfsCid",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "hash",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "updateEvidence",
    "type": "function",
    "inputs": [
      {
        "name": "recordId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "newIpfsCid",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "newHash",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

/**
 * Blockchain Service
 * Interacts with smart contracts on Arbitrum & Scroll
 */

/**
 * Store evidence on blockchain
 * @param {string} recordId - Unique record ID
 * @param {string} plate - Vehicle plate
 * @param {string} ipfsCid - IPFS CID
 * @param {string} hash - File hash
 * @returns {Promise<Object>} - Transaction hashes
 */
export async function storeEvidenceOnChain(recordId, plate, ipfsCid, hash) {
  console.log('📝 Storing evidence on blockchain...');
  console.log(`   Record ID: ${recordId}`);
  console.log(`   Plate: ${plate}`);
  console.log(`   IPFS CID: ${ipfsCid}`);
  console.log(`   Hash: ${hash}`);

  // Check if blockchain is configured
  const scrollConfigured = env.SCROLL_CONTRACT_ADDRESS && 
                          env.SCROLL_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
                          env.SCROLL_RPC_URL;
  
  const arbitrumConfigured = env.ARBITRUM_CONTRACT_ADDRESS && 
                            env.ARBITRUM_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
                            env.ARBITRUM_RPC_URL;

  if (!scrollConfigured && !arbitrumConfigured) {
    console.log('⚠️  Blockchain not configured yet. Returning mock transactions.');
    console.log('   To enable blockchain:');
    console.log('   1. Deploy contracts to Scroll and Arbitrum testnets');
    console.log('   2. Add contract addresses to .env file');
    return {
      scrollTx: '0x' + 'mock'.padEnd(64, '0'),
      arbitrumTx: '0x' + 'mock'.padEnd(64, '0'),
    };
  }

  const results = {
    scrollTx: null,
    arbitrumTx: null,
  };

  // Store on Scroll
  if (scrollConfigured) {
    try {
      console.log('🟦 Storing on Scroll...');
      const { contract, provider } = getContract('scroll');
      
      const tx = await contract.storeEvidence(recordId, plate, ipfsCid, hash);
      console.log(`   TX submitted: ${tx.hash}`);
      
      const receipt = await tx.wait(env.NETWORK_CONFIRMATIONS);
      console.log(`   ✅ Confirmed on Scroll (block ${receipt.blockNumber})`);
      
      results.scrollTx = tx.hash;
    } catch (error) {
      console.error('   ❌ Scroll error:', error.message);
      results.scrollTx = '0x' + 'error'.padEnd(64, '0');
    }
  } else {
    console.log('⚠️  Scroll not configured, skipping...');
    results.scrollTx = '0x' + 'notconfigured'.padEnd(64, '0');
  }

  // Store on Arbitrum
  if (arbitrumConfigured) {
    try {
      console.log('🔵 Storing on Arbitrum...');
      const { contract, provider } = getContract('arbitrum');
      
      const tx = await contract.storeEvidence(recordId, plate, ipfsCid, hash);
      console.log(`   TX submitted: ${tx.hash}`);
      
      const receipt = await tx.wait(env.NETWORK_CONFIRMATIONS);
      console.log(`   ✅ Confirmed on Arbitrum (block ${receipt.blockNumber})`);
      
      results.arbitrumTx = tx.hash;
    } catch (error) {
      console.error('   ❌ Arbitrum error:', error.message);
      results.arbitrumTx = '0x' + 'error'.padEnd(64, '0');
    }
  } else {
    console.log('⚠️  Arbitrum not configured, skipping...');
    results.arbitrumTx = '0x' + 'notconfigured'.padEnd(64, '0');
  }

  return results;
}

/**
 * Get evidence from blockchain
 * @param {string} recordId - Unique record ID
 * @param {string} network - 'scroll' or 'arbitrum'
 * @returns {Promise<Object>} - Evidence data from blockchain
 */
export async function getEvidenceFromChain(recordId, network = 'scroll') {
  console.log(`🔍 Getting evidence from ${network}...`);
  console.log(`   Record ID: ${recordId}`);

  const { contract } = getContract(network);
  
  const evidence = await contract.getEvidence(recordId);
  
  return {
    plate: evidence.plate,
    ipfsCid: evidence.ipfsCid,
    hash: evidence.hash,
    timestamp: evidence.timestamp.toString(),
    submittedBy: evidence.submittedBy,
    exists: evidence.exists,
  };
}

/**
 * Check if a record exists on blockchain
 * @param {string} recordId - Unique record ID
 * @param {string} network - 'scroll' or 'arbitrum'
 * @returns {Promise<boolean>}
 */
export async function recordExistsOnChain(recordId, network = 'scroll') {
  const { contract } = getContract(network);
  return await contract.recordExists(recordId);
}

/**
 * Get total number of records on blockchain
 * @param {string} network - 'scroll' or 'arbitrum'
 * @returns {Promise<number>}
 */
export async function getTotalRecordsOnChain(network = 'scroll') {
  const { contract } = getContract(network);
  const total = await contract.getTotalRecords();
  return total.toString();
}

/**
 * Setup provider and contract
 * @param {string} network - 'scroll' or 'arbitrum'
 * @returns {Object} - { contract, provider, wallet }
 */
function getContract(network) {
  const rpcUrl = network === 'scroll' 
    ? env.SCROLL_RPC_URL 
    : env.ARBITRUM_RPC_URL;
    
  const contractAddress = network === 'scroll'
    ? env.SCROLL_CONTRACT_ADDRESS
    : env.ARBITRUM_CONTRACT_ADDRESS;

  if (!rpcUrl) {
    throw new Error(`${network} RPC URL not configured`);
  }

  if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error(`${network} contract address not configured`);
  }

  if (!env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not configured');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    wallet
  );

  return { contract, provider, wallet };
}
