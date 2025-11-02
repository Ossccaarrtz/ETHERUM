Verity - Sistema de Verificación de Documentos con Blockchain
https://img.shields.io/badge/Stack-React%2520%257C%2520Node.js%2520%257C%2520Solidity%2520%257C%2520IPFS-blue

📋 Descripción
Verity es una aplicación descentralizada que permite verificar y autenticar documentos mediante el uso de blockchain e IPFS, garantizando la integridad y autenticidad de los archivos.

🚀 Características Principales
✅ Hash SHA-256 para verificación de integridad

🌐 Almacenamiento IPFS con Pinata

⛓️ Doble blockchain (Scroll + Arbitrum)

🔗 API REST completa

📱 Generación de QR Code

🔒 Verificación descentralizada

🛠 Stack Tecnológico
Frontend
React + Vite - Framework principal

Tailwind CSS - Estilos

React Router - Navegación

Ethers.js - Conexión Web3

Axios - Cliente HTTP

Backend
Node.js + Express - Servidor API

Ethers.js - Interacción blockchain

IPFS (Pinata) - Almacenamiento descentralizado

Multer - Manejo de uploads

JSON - Almacenamiento local

Blockchain
Smart Contracts: Solidity

Desarrollo: Hardhat

Redes: Scroll y Arbitrum (mainnet y testnets)

⚙️ Requisitos Previos
Asegúrate de tener instalado:

Git

Node.js (versión 18 o superior)

npm

🛠 Instalación y Configuración
1. Clonar el Repositorio
bash
git clone https://github.com/Ossccaarrtz/ETHERUM.git
cd ETHERUM
2. Configuración de Variables de Entorno
Backend (.env)
Crea un archivo .env en la carpeta backend:

env
# SERVER CONFIG
PORT=3001
NODE_ENV=development

# IPFS Storage - Pinata
PINATA_JWT=TU_TOKEN_AQUI

# WALLET (PRIVATE KEY)
PRIVATE_KEY=TU_TOKEN_AQUI

# RPC URLs - TESTNETS
ARBITRUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
SCROLL_RPC_URL=https://sepolia-rpc.scroll.io/

# SMART CONTRACT ADDRESSES
SCROLL_CONTRACT_ADDRESS=0xDIRECCION
ARBITRUM_CONTRACT_ADDRESS=0xDIRECCION

# Optional
NETWORK_CONFIRMATIONS=1
DELETE_TEMP_FILES=true

Contracts (.env)
Crea un archivo .env en la carpeta contracts:

env
# Private Key de tu wallet de Rabby (SIN el prefijo 0x)
PRIVATE_KEY=TU_TOKEN_AQUI

# Scroll Network
SCROLL_RPC_URL=https://rpc.scroll.io
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io/

# Arbitrum Network
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Block Explorer API Keys (opcional)
SCROLLSCAN_API_KEY=
ARBISCAN_API_KEY=
🚀 Ejecutar el Proyecto
Backend
bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
El servidor backend estará disponible en: http://localhost:3001

Frontend
bash
# En una nueva terminal, navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
El frontend estará disponible en: http://localhost:3000

📁 Estructura del Proyecto
text
ETHERUM/
├── contracts/          # Smart Contracts en Solidity
├── backend/           # API Server (Node.js + Express)
├── frontend/          # Client (React + Vite)
└── README.md
🔧 Comandos Útiles
Backend
npm run dev - Ejecutar en desarrollo

npm start - Ejecutar en producción

npm test - Ejecutar tests

Frontend
npm run dev - Servidor de desarrollo

npm run build - Build para producción

npm run preview - Preview del build

🌐 URLs de Acceso
Frontend: http://localhost:3000

Backend: http://localhost:3001

📞 Soporte
Si encuentras algún problema durante la instalación:

Verifica que todas las dependencias estén instaladas correctamente

Confirma que las variables de entorno estén configuradas

Asegúrate de que los puertos 3000 y 3001 estén disponibles

Nota: Reemplaza TU_TOKEN_AQUI y 0xDIRECCION con tus credenciales reales y direcciones de contrato desplegadas.
