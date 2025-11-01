/**
 * Script para sincronizar direcciones de contratos del backend al frontend
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

const scrollAddress = process.env.SCROLL_CONTRACT_ADDRESS;
const arbitrumAddress = process.env.ARBITRUM_CONTRACT_ADDRESS;
const scrollRpc = process.env.SCROLL_RPC_URL || process.env.SCROLL_SEPOLIA_RPC_URL || 'https://sepolia-rpc.scroll.io';
const arbitrumRpc = process.env.ARBITRUM_RPC_URL || process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';

console.log('\n📋 Direcciones Encontradas en .env:');
console.log('═'.repeat(60));
console.log(`Scroll Contract:   ${scrollAddress || '❌ NO ENCONTRADA'}`);
console.log(`Arbitrum Contract: ${arbitrumAddress || '❌ NO ENCONTRADA'}`);

if (!scrollAddress && !arbitrumAddress) {
  console.log('\n⚠️  No se encontraron direcciones en backend/.env');
  console.log('   Verifica que tienes SCROLL_CONTRACT_ADDRESS y/o ARBITRUM_CONTRACT_ADDRESS configurados\n');
  process.exit(1);
}

// Actualizar frontend
const frontendPath = path.join(__dirname, 'frontend/src/utils/blockchainClient.js');
let content = fs.readFileSync(frontendPath, 'utf-8');

if (scrollAddress) {
  content = content.replace(
    /scroll:\s*\{[^}]*address:\s*['"][^'"]+['"]/,
    `scroll: {\n    address: '${scrollAddress}'`
  );
  content = content.replace(
    /address:\s*['"](0x[a-fA-F0-9]+|0xTU_CONTRATO_SCROLL)['"]/,
    `address: '${scrollAddress}'`
  );
  console.log(`\n✅ Scroll actualizado: ${scrollAddress}`);
}

if (arbitrumAddress) {
  content = content.replace(
    /arbitrum:\s*\{[^}]*address:\s*['"][^'"]+['"]/,
    `arbitrum: {\n    address: '${arbitrumAddress}'`
  );
  content = content.replace(
    /address:\s*['"](0x[a-fA-F0-9]+|0xTU_CONTRATO_ARBITRUM)['"]/,
    `address: '${arbitrumAddress}'`
  );
  console.log(`✅ Arbitrum actualizado: ${arbitrumAddress}`);
}

fs.writeFileSync(frontendPath, content, 'utf-8');

console.log('\n✨ Frontend actualizado exitosamente!\n');

