/**
 * Calcula el hash SHA-256 de un archivo
 * @param {File} file - Archivo a hashear
 * @returns {Promise<string>} Hash en formato hexadecimal
 */
export async function calculateFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Descarga archivo desde IPFS y calcula su hash
 * @param {string} ipfsHash - Hash de IPFS (con o sin prefijo ipfs://)
 * @returns {Promise<{hash: string, blob: Blob}>}
 */
export async function downloadAndHashFromIPFS(ipfsHash) {
  // Remover prefijo ipfs:// si existe
  const cleanHash = ipfsHash.replace('ipfs://', '');
  
  // Usar gateway público de IPFS
  const gateways = [
    `https://ipfs.io/ipfs/${cleanHash}`,
    `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanHash}`
  ];
  
  let lastError;
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, {
        method: 'GET',
        headers: {
          'Accept': 'video/mp4,video/*,*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return { hash, blob, gateway };
    } catch (error) {
      lastError = error;
      console.warn(`Failed to fetch from ${gateway}:`, error);
      continue;
    }
  }
  
  throw new Error(`No se pudo descargar desde IPFS: ${lastError?.message}`);
}

/**
 * Valida formato de hash SHA-256
 * @param {string} hash 
 * @returns {boolean}
 */
export function isValidHash(hash) {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}
