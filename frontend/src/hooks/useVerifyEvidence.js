import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { downloadAndHashFromIPFS } from '../utils/hashFile';
import { verifyHashOnChain, searchEvidenceInAllChains } from '../utils/blockchainClient';

export function useVerifyEvidence() {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  /**
   * Verifica una evidencia completa: descarga de IPFS, calcula hash y compara con blockchain
   * @param {string|number} recordId - ID del registro a verificar (se convierte a string)
   */
  const verifyEvidence = async (recordId) => {
    setLoading(true);
    setError(null);
    setVerificationResult(null);
    setProgress('Iniciando verificación...');

    try {
      // Convertir a string si es necesario
      const recordIdStr = String(recordId);
      
      let evidence = null;
      let source = 'blockchain';

      // 1. Intentar buscar evidencia en blockchain
      setProgress('🔍 Buscando evidencia en blockchain...');
      try {
        const evidences = await searchEvidenceInAllChains(recordIdStr);
        if (evidences.length > 0 && evidences[0]) {
          evidence = evidences[0];
          source = 'blockchain';
          toast.success(`✅ Evidencia encontrada en ${evidence.chain}`, { duration: 3000 });
        }
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain no disponible o no configurado, buscando en base de datos local...', blockchainError);
        // No mostrar error al usuario, simplemente continuar con búsqueda local
      }

      // 2. Si no se encuentra en blockchain, buscar en base de datos local
      if (!evidence) {
        setProgress('📋 Buscando en base de datos local...');
        try {
          const response = await axios.get(`/api/evidence/verify/${recordIdStr}`);
          if (response.data.success) {
            // Convertir formato del backend al formato esperado
            const localRecord = response.data;
            const hasRealTx = localRecord.scrollTx && !localRecord.scrollTx.includes('mock') && !localRecord.scrollTx.includes('error');
            
            evidence = {
              recordId: localRecord.recordId,
              licencePlate: localRecord.plate || localRecord.licencePlate,
              ipfsHash: localRecord.ipfsHash || localRecord.ipfsCid || localRecord.cid,
              fileHash: localRecord.fileHash || localRecord.hash,
              uploader: 'local',
              timestamp: String(localRecord.timestamp),
              exists: true,
              chain: hasRealTx ? 'Scroll Sepolia (Local DB)' : 'Local Database',
              explorerUrl: hasRealTx 
                ? `https://sepolia.scrollscan.com/tx/${localRecord.scrollTx}`
                : '#',
              source: 'local'
            };
            source = 'local';
            toast.info('📋 Evidencia encontrada en base de datos local', { duration: 3000 });
          }
        } catch (localError) {
          console.warn('Error buscando en base de datos local:', localError);
          if (localError.response?.status === 404) {
            // No mostrar error aquí, se manejará después
          }
        }
      }

      if (!evidence) {
        throw new Error('No se encontró evidencia con ese Record ID. Intenta verificar que el ID sea correcto (formato: PLACA-TIMESTAMP, ej: ASDASD-1762032836)');
      }

      // 3. Descargar archivo desde IPFS
      setProgress('📥 Descargando archivo desde IPFS...');
      const { hash: localHash, blob, gateway } = await downloadAndHashFromIPFS(evidence.ipfsHash);

      // 4. Comparar hashes
      setProgress('🔐 Verificando integridad...');
      const onChainHash = evidence.fileHash.toLowerCase();
      const calculatedHash = localHash.toLowerCase();
      const matches = onChainHash === calculatedHash;

      // 5. Guardar resultado
      const result = {
        recordId: evidence.recordId,
        licencePlate: evidence.licencePlate,
        timestamp: new Date(Number(evidence.timestamp) * 1000),
        ipfsHash: evidence.ipfsHash,
        onChainHash,
        localHash: calculatedHash,
        matches,
        uploader: evidence.uploader || 'Unknown',
        chain: evidence.chain,
        explorerUrl: evidence.explorerUrl || '#',
        gateway,
        fileBlob: blob,
        source: source, // 'blockchain' o 'local'
        verifiedAt: new Date()
      };

      setVerificationResult(result);
      setProgress('');

      // Guardar en historial local
      saveVerificationToHistory(result);

      // Mostrar toast según resultado
      if (matches) {
        toast.success('✅ Evidencia verificada - 100% Original', {
          duration: 5000,
        });
      } else {
        toast.error('⚠️ Evidencia alterada - Los hashes no coinciden', {
          duration: 6000,
        });
      }

      return result;
    } catch (err) {
      console.error('Error en verificación:', err);
      const errorMsg = err.message || 'Error al verificar la evidencia';
      setError(errorMsg);
      setProgress('');
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda verificación en localStorage
   */
  const saveVerificationToHistory = (result) => {
    try {
      const history = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
      
      const newEntry = {
        ...result,
        fileBlob: undefined, // No guardar el blob en localStorage
        verifiedAt: result.verifiedAt.toISOString()
      };

      // Evitar duplicados (comparar como string)
      const filtered = history.filter(h => String(h.recordId) !== String(result.recordId));
      filtered.unshift(newEntry);

      // Mantener máximo 100 entradas
      const trimmed = filtered.slice(0, 100);
      
      localStorage.setItem('verificationHistory', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error guardando en historial:', error);
    }
  };

  /**
   * Obtiene el historial de verificaciones
   */
  const getVerificationHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
      return history.map(h => ({
        ...h,
        timestamp: new Date(h.timestamp),
        verifiedAt: new Date(h.verifiedAt)
      }));
    } catch (error) {
      console.error('Error leyendo historial:', error);
      return [];
    }
  };

  /**
   * Limpia el historial
   */
  const clearHistory = () => {
    localStorage.removeItem('verificationHistory');
  };

  /**
   * Elimina una entrada del historial
   */
  const deleteFromHistory = (recordId) => {
    try {
      const history = JSON.parse(localStorage.getItem('verificationHistory') || '[]');
      const filtered = history.filter(h => String(h.recordId) !== String(recordId));
      localStorage.setItem('verificationHistory', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error eliminando del historial:', error);
    }
  };

  return {
    verifyEvidence,
    loading,
    verificationResult,
    error,
    progress,
    getVerificationHistory,
    clearHistory,
    deleteFromHistory
  };
}
