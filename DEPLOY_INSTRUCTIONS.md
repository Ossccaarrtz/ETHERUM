# 🚀 Guía de Despliegue a Blockchain

## Opción 1: Desplegar en Sepolia Testnets (RECOMENDADO - GRATIS)

### Requisitos Previos

1. **Obtener fondos de testnet:**
   - Scroll Sepolia: https://sepoliafaucet.com/ (opción Scroll Sepolia)
   - Arbitrum Sepolia: https://faucet.quicknode.com/arbitrum/sepolia
   - O usar: https://www.alchemy.com/faucets/arbitrum-sepolia

2. **Crear archivo `.env` en la carpeta `contracts/`:**

```env
# Private Key (sin 0x al inicio)
PRIVATE_KEY=tu_clave_privada_aqui

# Scroll Sepolia (ya configurado por defecto)
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io/

# Arbitrum Sepolia (ya configurado por defecto)
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# API Keys para verificar contratos (opcional)
SCROLLSCAN_API_KEY=tu_api_key
ARBISCAN_API_KEY=tu_api_key
```

### Pasos para Desplegar

#### 1. Desplegar en Scroll Sepolia:

```bash
cd contracts
npx hardhat run scripts/deploy.js --network scrollSepolia
```

**Salida esperada:**
```
📍 Contract address: 0x1234567890abcdef1234567890abcdef12345678
```

#### 2. Desplegar en Arbitrum Sepolia:

```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

**Salida esperada:**
```
📍 Contract address: 0xabcdef1234567890abcdef1234567890abcdef12
```

#### 3. Configurar en Backend:

Crear archivo `.env` en la carpeta `backend/`:

```env
# Private Key (sin 0x)
PRIVATE_KEY=tu_clave_privada_aqui

# Scroll Sepolia
SCROLL_RPC_URL=https://sepolia-rpc.scroll.io/
SCROLL_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Arbitrum Sepolia
ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_CONTRACT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12

# Confirmaciones (opcional)
NETWORK_CONFIRMATIONS=1
```

#### 4. Configurar en Frontend:

Actualizar `frontend/src/utils/blockchainClient.js`:

```javascript
const CONTRACTS = {
  scroll: {
    address: '0x1234567890abcdef1234567890abcdef12345678', // Tu dirección de Scroll
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    explorerUrl: 'https://sepolia.scrollscan.com',
    chainId: 534351,
    name: 'Scroll Sepolia'
  },
  arbitrum: {
    address: '0xabcdef1234567890abcdef1234567890abcdef12', // Tu dirección de Arbitrum
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    chainId: 421614,
    name: 'Arbitrum Sepolia'
  }
};
```

### Verificar Contratos (Opcional)

```bash
# Scroll Sepolia
npx hardhat verify --network scrollSepolia 0xTU_DIRECCION_SCROLL

# Arbitrum Sepolia
npx hardhat verify --network arbitrumSepolia 0xTU_DIRECCION_ARBITRUM
```

---

## Opción 2: Usar Red Local (Hardhat - Para Desarrollo)

Si solo quieres probar localmente:

```bash
# Terminal 1: Iniciar nodo local
cd contracts
npx hardhat node

# Terminal 2: Desplegar
npx hardhat run scripts/deploy.js --network localhost
```

Luego usa las direcciones generadas en tu `.env`.

---

## Opción 3: Sin Blockchain (Modo Actual)

El sistema ya funciona sin blockchain configurado:
- ✅ Busca en base de datos local automáticamente
- ✅ Verifica hashes desde IPFS
- ✅ Funciona con todos los Record IDs de `records.json`

**Ejemplo de Record ID válido:** `ASDASD-1762032836`

---

## 🔍 Verificar Configuración

Para verificar que todo está configurado correctamente:

```bash
cd backend
node check-config.js
```

Esto te mostrará el estado de cada red.

---

## 📝 Notas Importantes

1. **Private Key**: Nunca compartas tu clave privada. Usa una cuenta de prueba con pocos fondos.

2. **Testnets**: Sepolia es una red de prueba, los tokens no tienen valor real.

3. **Gas**: Necesitas ETH en testnet para pagar gas. Obténlo de los faucets.

4. **Explorers**:
   - Scroll Sepolia: https://sepolia.scrollscan.com
   - Arbitrum Sepolia: https://sepolia.arbiscan.io

---

## 🚀 Quick Start (Ejemplo Completo)

```bash
# 1. Obtener fondos de testnet
# Visita: https://sepoliafaucet.com/

# 2. Desplegar contratos
cd contracts
npx hardhat run scripts/deploy.js --network scrollSepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# 3. Copiar direcciones y configurar .env en backend/ y frontend/

# 4. Reiniciar backend
cd ../backend
npm start

# 5. Probar verificador
# Usa cualquier Record ID de tu records.json
```

