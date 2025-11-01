import { ethers } from 'ethers';

// ABI del contrato EvidenceRegistry (usando string recordId)
const EVIDENCE_REGISTRY_ABI = [
  "function getEvidence(string memory recordId) public view returns (tuple(string plate, string ipfsCid, string hash, uint256 timestamp, address submittedBy, bool exists))",
  "function recordExists(string memory recordId) public view returns (bool)",
  "function getTotalRecords() public view returns (uint256)",
  "event EvidenceStored(string indexed recordId, string plate, string ipfsCid, string hash, uint256 timestamp, address indexed submittedBy)"
];

// Direcciones de los contratos desplegados
// IMPORTANTE: Actualiza estas direcciones con las de tus contratos desplegados
// Puedes encontrarlas en tu archivo backend/.env como:
// SCROLL_CONTRACT_ADDRESS y ARBITRUM_CONTRACT_ADDRESS

// Si tienes las direcciones en .env del backend, puedes usar:
// const scrollAddress = import.meta.env.VITE_SCROLL_CONTRACT_ADDRESS || '0xTU_CONTRATO_SCROLL';
// const arbitrumAddress = import.meta.env.VITE_ARBITRUM_CONTRACT_ADDRESS || '0xTU_CONTRATO_ARBITRUM';

const CONTRACTS = {
  scroll: {
    // ⬇️ REEMPLAZA ESTA DIRECCIÓN con la de tu contrato Scroll (de backend/.env línea SCROLL_CONTRACT_ADDRESS)
    address: import.meta.env.VITE_SCROLL_CONTRACT_ADDRESS || '0xTU_CONTRATO_SCROLL',
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    explorerUrl: 'https://sepolia.scrollscan.com',
    chainId: 534351,
    name: 'Scroll Sepolia'
  },
  arbitrum: {
    // ⬇️ REEMPLAZA ESTA DIRECCIÓN con la de tu contrato Arbitrum (de backend/.env línea ARBITRUM_CONTRACT_ADDRESS)
    address: import.meta.env.VITE_ARBITRUM_CONTRACT_ADDRESS || '0xTU_CONTRATO_ARBITRUM',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    chainId: 421614,
    name: 'Arbitrum Sepolia'
  }
};

/**
 * Obtiene evidencia desde el contrato en una blockchain específica
 * @param {string} chain - 'scroll' o 'arbitrum'
 * @param {string} recordId - ID del registro (string)
 * @returns {Promise<Object>}
 */
export async function getEvidenceFromChain(chain, recordId) {
  try {
    const config = CONTRACTS[chain];
    if (!config) {
      throw new Error(`Chain ${chain} no soportada`);
    }

    // Verificar si la dirección del contrato está configurada
    if (!config.address || config.address.includes('TU_CONTRATO')) {
      console.warn(`⚠️ Contrato de ${chain} no configurado (dirección placeholder)`);
      return null; // Retornar null en lugar de error para permitir fallback
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.address,
      EVIDENCE_REGISTRY_ABI,
      provider
    );

    const evidence = await contract.getEvidence(recordId);
    
    if (!evidence.exists) {
      return null;
    }

    return {
      recordId: recordId, // Mantener el recordId original
      licencePlate: evidence.plate,
      ipfsHash: evidence.ipfsCid,
      fileHash: evidence.hash,
      uploader: evidence.submittedBy,
      timestamp: evidence.timestamp.toString(),
      exists: evidence.exists,
      chain: config.name,
      explorerUrl: `${config.explorerUrl}/address/${config.address}`
    };
  } catch (error) {
    console.error(`Error fetching from ${chain}:`, error);
    // Si el error es porque no existe o no está configurado, retornar null
    if (error.message && (
      error.message.includes('Record does not exist') ||
      error.message.includes('invalid address') ||
      error.message.includes('missing revert data')
    )) {
      return null;
    }
    // Para otros errores, también retornar null para permitir fallback
    return null;
  }
}

/**
 * Busca evidencia en ambas blockchains
 * @param {string} recordId 
 * @returns {Promise<Array>}
 */
export async function searchEvidenceInAllChains(recordId) {
  const results = await Promise.allSettled([
    getEvidenceFromChain('scroll', recordId),
    getEvidenceFromChain('arbitrum', recordId)
  ]);

  const evidences = [];
  
  results.forEach((result, index) => {
    const chain = index === 0 ? 'scroll' : 'arbitrum';
    if (result.status === 'fulfilled' && result.value) {
      evidences.push(result.value);
    } else if (result.status === 'rejected') {
      console.warn(`Error en ${chain}:`, result.reason);
    }
  });

  return evidences;
}

/**
 * Obtiene el total de evidencias en una blockchain
 * @param {string} chain 
 * @returns {Promise<number>}
 */
export async function getTotalEvidences(chain) {
  try {
    const config = CONTRACTS[chain];
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.address,
      EVIDENCE_REGISTRY_ABI,
      provider
    );

    const total = await contract.totalEvidences();
    return Number(total);
  } catch (error) {
    console.error(`Error getting total from ${chain}:`, error);
    return 0;
  }
}

/**
 * Verifica si un hash existe en blockchain
 * @param {string} fileHash - Hash SHA-256 del archivo
 * @param {string} recordId - ID del registro
 * @returns {Promise<{valid: boolean, onChainHash: string, matches: boolean}>}
 */
export async function verifyHashOnChain(fileHash, recordId) {
  const evidences = await searchEvidenceInAllChains(recordId);
  
  if (evidences.length === 0) {
    return {
      valid: false,
      onChainHash: null,
      matches: false,
      error: 'No se encontró evidencia en blockchain'
    };
  }

  // Tomar la primera evidencia encontrada
  const evidence = evidences[0];
  const onChainHash = evidence.fileHash.toLowerCase();
  const localHash = fileHash.toLowerCase();
  
  return {
    valid: true,
    onChainHash,
    localHash,
    matches: onChainHash === localHash,
    evidence,
    allEvidences: evidences
  };
}

export { CONTRACTS };
