/**
 * Script para sincronizar direcciones de contratos del backend al frontend
 * Lee las variables de entorno del backend y actualiza blockchainClient.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env del backend
const backendEnvPath = path.join(__dirname, '../backend/.env');
const contractsEnvPath = path.join(__dirname, '../contracts/.env');

// Intentar cargar ambos archivos .env
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
  console.log('✅ Cargado .env del backend');
} else if (fs.existsSync(contractsEnvPath)) {
  dotenv.config({ path: contractsEnvPath });
  console.log('✅ Cargado .env de contracts');
} else {
  dotenv.config(); // Intentar cargar desde raíz
}

const scrollAddress = process.env.SCROLL_CONTRACT_ADDRESS;
const arbitrumAddress = process.env.ARBITRUM_CONTRACT_ADDRESS;
const scrollRpc = process.env.SCROLL_RPC_URL || process.env.SCROLL_SEPOLIA_RPC_URL || 'https://sepolia-rpc.scroll.io';
const arbitrumRpc = process.env.ARBITRUM_RPC_URL || process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc';

console.log('\n📋 Direcciones de Contratos Encontradas:');
console.log('═'.repeat(60));
console.log(`Scroll:    ${scrollAddress || '❌ NO CONFIGURADA'}`);
console.log(`Arbitrum:  ${arbitrumAddress || '❌ NO CONFIGURADA'}`);
console.log(`Scroll RPC: ${scrollRpc}`);
console.log(`Arbitrum RPC: ${arbitrumRpc}`);

if (!scrollAddress && !arbitrumAddress) {
  console.log('\n⚠️  No se encontraron direcciones de contratos.');
  console.log('   Asegúrate de tener SCROLL_CONTRACT_ADDRESS y/o ARBITRUM_CONTRACT_ADDRESS en tu .env');
  process.exit(1);
}

// Actualizar frontend/src/utils/blockchainClient.js
const frontendClientPath = path.join(__dirname, '../frontend/src/utils/blockchainClient.js');
let clientContent = fs.readFileSync(frontendClientPath, 'utf-8');

// Reemplazar direcciones
if (scrollAddress) {
  clientContent = clientContent.replace(
    /address:\s*['"](0x[a-fA-F0-9]+|0xTU_CONTRATO_SCROLL)['"]/,
    `address: '${scrollAddress}'`
  );
  console.log(`\n✅ Scroll actualizado: ${scrollAddress}`);
}

if (arbitrumAddress) {
  clientContent = clientContent.replace(
    /address:\s*['"](0x[a-fA-F0-9]+|0xTU_CONTRATO_ARBITRUM)['"]/,
    `address: '${arbitrumAddress}'`
  );
  console.log(`✅ Arbitrum actualizado: ${arbitrumAddress}`);
}

// Actualizar RPC URLs si están diferentes
clientContent = clientContent.replace(
  /rpcUrl:\s*['"][^'"]+['"]/g,
  (match) => {
    if (match.includes('scroll')) {
      return `rpcUrl: '${scrollRpc}'`;
    } else if (match.includes('arbitrum')) {
      return `rpcUrl: '${arbitrumRpc}'`;
    }
    return match;
  }
);

fs.writeFileSync(frontendClientPath, clientContent, 'utf-8');

console.log('\n✨ Frontend actualizado exitosamente!');
console.log('   Archivo: frontend/src/utils/blockchainClient.js');
console.log('\n📝 Próximos pasos:');
console.log('   1. Reinicia el servidor de desarrollo del frontend');
console.log('   2. Prueba verificar una evidencia');
console.log('   3. Debería buscar en blockchain ahora\n');

