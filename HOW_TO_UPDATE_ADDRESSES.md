# 🔧 Cómo Actualizar las Direcciones de Contratos en el Frontend

## Opción 1: Actualización Manual (RÁPIDO)

1. Abre el archivo: `frontend/src/utils/blockchainClient.js`

2. Encuentra estas líneas (alrededor de la línea 14 y 21):

```javascript
scroll: {
  address: '0xTU_CONTRATO_SCROLL',  // ← Cambia esto
  ...
},
arbitrum: {
  address: '0xTU_CONTRATO_ARBITRUM', // ← Cambia esto
  ...
}
```

3. Reemplaza con las direcciones de tu `backend/.env`:
   - `SCROLL_CONTRACT_ADDRESS` → va en `address: '...'` de scroll
   - `ARBITRUM_CONTRACT_ADDRESS` → va en `address: '...'` de arbitrum

**Ejemplo:**
```javascript
scroll: {
  address: '0x1234567890abcdef1234567890abcdef12345678', // Tu dirección real
  rpcUrl: 'https://sepolia-rpc.scroll.io',
  ...
},
arbitrum: {
  address: '0xabcdef1234567890abcdef1234567890abcdef12', // Tu dirección real
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  ...
}
```

4. Guarda el archivo y reinicia el servidor de desarrollo del frontend.

---

## Opción 2: Usar Variables de Entorno (RECOMENDADO)

1. Crea un archivo `.env` en la carpeta `frontend/` con:

```env
VITE_SCROLL_CONTRACT_ADDRESS=0xtu_direccion_scroll_aqui
VITE_ARBITRUM_CONTRACT_ADDRESS=0xtu_direccion_arbitrum_aqui
```

2. El archivo `blockchainClient.js` ya está configurado para leer estas variables automáticamente.

3. Reinicia el servidor de desarrollo.

---

## Opción 3: Script Automático

Ejecuta este comando desde la raíz del proyecto:

```bash
node sync-addresses.js
```

Este script leerá tu `backend/.env` y actualizará automáticamente el frontend.

---

## ✅ Verificar que Funciona

1. Abre las herramientas de desarrollador del navegador (F12)
2. Ve a la consola
3. Intenta verificar una evidencia
4. Deberías ver mensajes como:
   - `✅ Evidencia encontrada en Scroll Sepolia` (si funciona)
   - O `📋 Evidencia encontrada en base de datos local` (si busca en local)

---

## 🔍 Dónde Encontrar tus Direcciones

Si ya desplegaste los contratos, las direcciones deberían estar en:
- `backend/.env` → `SCROLL_CONTRACT_ADDRESS` y `ARBITRUM_CONTRACT_ADDRESS`
- O en la salida del comando de deploy cuando ejecutaste `npx hardhat run scripts/deploy.js`

Si no las tienes guardadas, puedes verlas en:
- Sourcify.dev (si verificaste el contrato)
- El explorer de la blockchain donde desplegaste

