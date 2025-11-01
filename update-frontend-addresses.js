/**
 * Script para leer .env del backend y actualizar frontend
 * Uso: node update-frontend-addresses.js
 */

const fs = require('fs');
const path = require('path');

// Leer .env del backend
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendClientPath = path.join(__dirname, 'frontend', 'src', 'utils', 'blockchainClient.js');

if (!fs.existsSync(backendEnvPath)) {
  console.error('❌ No se encontró backend/.env');
  process.exit(1);
}

console.log('📖 Leyendo backend/.env...\n');

const envContent = fs.readFileSync(backendEnvPath, 'utf-8');
const lines = envContent.split('\n');

let scrollAddress = null;
let arbitrumAddress = null;

// Buscar las direcciones
lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('SCROLL_CONTRACT_ADDRESS=')) {
    scrollAddress = trimmed.split('=')[1]?.trim();
  }
  if (trimmed.startsWith('ARBITRUM_CONTRACT_ADDRESS=')) {
    arbitrumAddress = trimmed.split('=')[1]?.trim();
  }
});

console.log('📍 Direcciones encontradas:');
console.log(`   Scroll:   ${scrollAddress || '❌ NO ENCONTRADA'}`);
console.log(`   Arbitrum: ${arbitrumAddress || '❌ NO ENCONTRADA'}\n`);

if (!scrollAddress && !arbitrumAddress) {
  console.error('❌ No se encontraron direcciones de contratos en backend/.env');
  console.error('   Asegúrate de tener SCROLL_CONTRACT_ADDRESS y/o ARBITRUM_CONTRACT_ADDRESS configurados\n');
  process.exit(1);
}

// Leer archivo del frontend
let frontendContent = fs.readFileSync(frontendClientPath, 'utf-8');

// Actualizar direcciones
if (scrollAddress) {
  // Reemplazar cualquier dirección de scroll (placeholder o existente)
  frontendContent = frontendContent.replace(
    /(scroll:\s*\{[^}]*address:\s*['"])([^'"]+)(['"])/,
    `$1${scrollAddress}$3`
  );
  console.log(`✅ Scroll actualizado: ${scrollAddress}`);
}

if (arbitrumAddress) {
  // Reemplazar cualquier dirección de arbitrum (placeholder o existente)
  frontendContent = frontendContent.replace(
    /(arbitrum:\s*\{[^}]*address:\s*['"])([^'"]+)(['"])/,
    `$1${arbitrumAddress}$3`
  );
  console.log(`✅ Arbitrum actualizado: ${arbitrumAddress}`);
}

// Guardar archivo actualizado
fs.writeFileSync(frontendClientPath, frontendContent, 'utf-8');

console.log('\n✨ ¡Frontend actualizado exitosamente!');
console.log(`   Archivo: ${frontendClientPath}`);
console.log('\n📝 Próximos pasos:');
console.log('   1. Reinicia el servidor de desarrollo del frontend');
console.log('   2. Prueba verificar una evidencia');
console.log('   3. Debería buscar en blockchain ahora\n');

