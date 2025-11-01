# 🚗 Evidence Registry - Smart Contract

Sistema de registro de evidencias en blockchain utilizando Solidity y Hardhat.

## 📋 Características

- ✅ Registro inmutable de evidencias con IPFS
- 🔒 Validación de datos de entrada
- 🔄 Actualización de evidencias por el creador original
- 📊 Consulta de registros por ID
- 🎯 Eventos para tracking de cambios
- ⚡ Optimizado para gas

## 🛠️ Tecnologías

- Solidity ^0.8.28
- Hardhat
- Ethers.js v6
- Scroll & Arbitrum networks

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tu clave privada y RPC URLs
```

## ⚙️ Configuración

Edita el archivo `.env` con tus credenciales:

```env
PRIVATE_KEY=tu_clave_privada_sin_0x
SCROLL_RPC_URL=https://rpc.scroll.io
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
```

## 🚀 Uso

### Compilar el contrato

```bash
npm run compile
```

### Ejecutar tests

```bash
npm test
```

### Verificar balance

```bash
npm run check-balance
```

### Deploy a Scroll Mainnet

```bash
npm run deploy:scroll
```

### Deploy a Arbitrum One

```bash
npm run deploy:arbitrum
```

### Deploy a testnet (Scroll Sepolia)

```bash
npx hardhat run scripts/deploy.js --network scrollSepolia
```

### Deploy a testnet (Arbitrum Sepolia)

```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

## 📝 Funciones del Contrato

### `storeEvidence(recordId, plate, ipfsCid, hash)`
Almacena una nueva evidencia en la blockchain.

**Parámetros:**
- `recordId`: ID único del registro
- `plate`: Número de placa del vehículo
- `ipfsCid`: Content ID de IPFS donde está almacenado el archivo
- `hash`: Hash del archivo para verificación

### `updateEvidence(recordId, newIpfsCid, newHash)`
Actualiza una evidencia existente (solo el creador original).

### `getEvidence(recordId)`
Obtiene la información completa de una evidencia.

### `recordExists(recordId)`
Verifica si un registro existe.

### `getTotalRecords()`
Obtiene el número total de registros.

### `getRecordIdByIndex(index)`
Obtiene un record ID por su índice.

## 🧪 Tests

Los tests cubren:
- ✅ Deployment del contrato
- ✅ Almacenamiento de evidencias
- ✅ Validaciones de entrada
- ✅ Actualización de evidencias
- ✅ Permisos y autorizaciones
- ✅ Gestión de registros

## 📊 Estructura del Proyecto

```
contracts/
├── contracts/
│   └── EvidenceRegistry.sol
├── scripts/
│   ├── deploy.js
│   └── checkBalance.js
├── test/
│   └── EvidenceRegistry.test.js
├── hardhat.config.js
├── package.json
└── .env.example
```

## 🔐 Seguridad

- Nunca compartas tu archivo `.env`
- Usa testnets antes de deploy a mainnet
- Verifica siempre el balance antes de hacer deploy
- Realiza auditorías de seguridad antes de producción

## 🌐 Redes Soportadas

### Mainnet
- Scroll (Chain ID: 534352)
- Arbitrum One (Chain ID: 42161)

### Testnet
- Scroll Sepolia (Chain ID: 534351)
- Arbitrum Sepolia (Chain ID: 421614)

## 📚 Recursos

- [Hardhat Documentation](https://hardhat.org/docs)
- [Scroll Documentation](https://docs.scroll.io/)
- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT
