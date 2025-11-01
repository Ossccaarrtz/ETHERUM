import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Centralized environment configuration
 * All env variables validated here
 */
const env = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // IPFS - Pinata (Recommended)
  PINATA_JWT: process.env.PINATA_JWT,

  // Blockchain
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ARBITRUM_RPC_URL: process.env.ARBITRUM_RPC_URL,
  SCROLL_RPC_URL: process.env.SCROLL_RPC_URL,
  ARBITRUM_CONTRACT_ADDRESS: process.env.ARBITRUM_CONTRACT_ADDRESS,
  SCROLL_CONTRACT_ADDRESS: process.env.SCROLL_CONTRACT_ADDRESS,

  // Optional
  NETWORK_CONFIRMATIONS: parseInt(process.env.NETWORK_CONFIRMATIONS || '1'),
  DELETE_TEMP_FILES: process.env.DELETE_TEMP_FILES === 'true',
};

/**
 * Validate critical env vars
 */
export function validateEnv() {
  console.log('\n🔍 Validating environment variables...\n');
  
  // Check IPFS provider
  if (!env.PINATA_JWT) {
    console.warn('⚠️  Missing: PINATA_JWT');
    console.warn('   Get your JWT from: https://app.pinata.cloud/developers/api-keys');
    console.warn('   Steps:');
    console.warn('   1. Register at https://app.pinata.cloud');
    console.warn('   2. Go to "API Keys" section');
    console.warn('   3. Create new key with "Admin" permissions');
    console.warn('   4. Copy the JWT token');
    console.warn('   5. Add to .env: PINATA_JWT=your_jwt_here\n');
  } else {
    console.log('✅ IPFS Provider: Pinata');
    console.log(`   Token: ${env.PINATA_JWT.substring(0, 20)}...`);
  }

  // Check Blockchain (optional warnings)
  if (!env.PRIVATE_KEY) {
    console.warn('⚠️  Missing: PRIVATE_KEY (required for blockchain transactions)');
  }
  
  if (!env.ARBITRUM_RPC_URL) {
    console.warn('⚠️  Missing: ARBITRUM_RPC_URL');
  }
  
  if (!env.SCROLL_RPC_URL) {
    console.warn('⚠️  Missing: SCROLL_RPC_URL');
  }

  console.log('');
}

export default env;
