import { useState } from "react";
import axios from "axios";
import { useVerifyEvidence } from "../hooks/useVerifyEvidence";
import QRScanner from "./QRScanner";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  Hash,
  Link,
  ExternalLink,
  QrCode,
  Search,
  Car,
  List,
  Eye,
  FileText,
} from "lucide-react";

export default function VerifyEvidence() {
  const [searchInput, setSearchInput] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { verifyEvidence, loading, verificationResult, error, progress } =
    useVerifyEvidence();
  const [plateHistory, setPlateHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Detect if input is a Record ID (PLATE-TIMESTAMP format) or just a plate
  const isRecordId = (input) => {
    const trimmed = input.trim();
    // Record ID format: PLACA-TIMESTAMP (contains dash and timestamp after)
    return trimmed.includes('-') && /^[A-Z0-9]+-\d+$/.test(trimmed);
  };

  const handleVerify = async () => {
    if (!searchInput || searchInput.trim() === "") {
      toast.error("Por favor ingresa un Record ID o Placa");
      return;
    }

    const trimmedInput = searchInput.trim();

    // Check if it's a Record ID or a Plate
    if (isRecordId(trimmedInput)) {
      // Search by Record ID (single result)
      try {
        toast.loading("Buscando evidencia...", { id: "verify-loading" });
        await verifyEvidence(trimmedInput);
        setPlateHistory(null); // Clear history when showing single result
        toast.dismiss("verify-loading");
      } catch (err) {
        console.error("Error verificando:", err);
        toast.dismiss("verify-loading");
      }
    } else {
      // Search by Plate (multiple results - history)
      setLoadingHistory(true);
      setPlateHistory(null);
      
      try {
        toast.loading("Buscando historial por placa...", { id: "history-loading" });
        const response = await axios.get(`/api/evidence/plate/${encodeURIComponent(trimmedInput)}`);
        
        if (response.data.success) {
          if (response.data.records && response.data.records.length > 0) {
            setPlateHistory({
              plate: response.data.plate || trimmedInput,
              count: response.data.count || response.data.records.length,
              records: response.data.records,
            });
            toast.success(`Se encontraron ${response.data.count || response.data.records.length} evidencia(s)`, { 
              id: "history-loading",
              duration: 3000 
            });
          } else {
            setPlateHistory(null);
            toast.error(response.data.message || "No se encontraron evidencias para esta placa", { 
              id: "history-loading",
              duration: 3000 
            });
          }
        } else {
          setPlateHistory(null);
          toast.error(response.data.error || "No se encontraron evidencias para esta placa", { 
            id: "history-loading",
            duration: 3000 
          });
        }
      } catch (err) {
        console.error("Error buscando por placa:", err);
        const errorMsg = err.response?.data?.error || "Error al buscar por placa";
        toast.error(errorMsg, { 
          id: "history-loading",
          duration: 3000 
        });
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleViewRecord = async (recordId) => {
    try {
      toast.loading("Cargando evidencia...", { id: "verify-loading" });
      await verifyEvidence(recordId);
      setPlateHistory(null); // Clear history when showing single result
      toast.dismiss("verify-loading");
    } catch (err) {
      console.error("Error verificando:", err);
      toast.dismiss("verify-loading");
    }
  };

  const handleQRScan = (scannedId) => {
    setSearchInput(scannedId);
    setShowQRScanner(false);
  };

  const handleDownloadFile = () => {
    if (verificationResult?.fileBlob) {
      const url = URL.createObjectURL(verificationResult.fileBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evidence-${verificationResult.recordId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Verificador de Evidencias
          </h1>
          <p className="text-lg text-gray-600">
            Verifica la autenticidad e integridad de cualquier evidencia
            registrada
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Buscar por Record ID o Placa del Vehículo
              </label>
              <div className="mb-2">
                <p className="text-xs text-gray-500">
                  💡 <strong>Record ID:</strong> Formato PLACA-TIMESTAMP (ej: ABC123-1762048377) | 
                  <strong> Placa:</strong> Solo la placa para ver historial completo (ej: ABC123)
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ej: ABC123 (historial) o ABC123-1762048377 (específico)"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  disabled={loading || loadingHistory}
                  onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                />
                <button
                  onClick={() => setShowQRScanner(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCode className="w-5 h-5" />
                  QR
                </button>
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || loadingHistory || !searchInput}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {(loading || loadingHistory) ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  {loadingHistory ? "Buscando historial..." : "Verificando..."}
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  {isRecordId(searchInput) ? "Verificar Evidencia" : "Buscar Historial"}
                </>
              )}
            </button>

            {progress && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-blue-800 text-center font-medium animate-pulse">
                {progress}
              </div>
            )}
          </div>
        </div>

        {/* Plate History Display */}
        {plateHistory && plateHistory.records.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-600" />
                  Historial de Evidencias
                </h2>
                <p className="text-gray-600 mt-1">
                  Placa: <span className="font-bold text-gray-900">{plateHistory.plate}</span> • 
                  Total: <span className="font-bold text-blue-600">{plateHistory.count} evidencia(s)</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {plateHistory.records
                .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
                .map((record, index) => (
                  <div
                    key={record.recordId || index}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-mono text-sm text-gray-600">
                              Record ID: <span className="font-bold text-gray-900">{record.recordId}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {new Date(record.timestamp * 1000).toLocaleString("es-MX")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600 font-mono truncate">
                              {record.hash?.slice(0, 16)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {(record.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        
                        {/* Blockchain Links */}
                        {(record.scrollExplorerUrl || record.arbitrumExplorerUrl || record.scrollTx || record.arbitrumTx) && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {record.scrollExplorerUrl && (
                              <a
                                href={record.scrollExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200"
                                title="Ver en Scroll"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Scroll
                              </a>
                            )}
                            {record.arbitrumExplorerUrl && (
                              <a
                                href={record.arbitrumExplorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold hover:bg-orange-200"
                                title="Ver en Arbitrum"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Arbitrum
                              </a>
                            )}
                            <a
                              href={`https://ipfs.io/ipfs/${record.ipfsCid || record.ipfsHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200"
                              title="Ver en IPFS"
                            >
                              <ExternalLink className="w-3 h-3" />
                              IPFS
                            </a>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewRecord(record.recordId)}
                        disabled={loading}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 animate-shake">
            <div className="flex items-start gap-4">
              <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Error en la Verificación
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div
            className={`rounded-2xl shadow-2xl overflow-hidden border-4 ${
              verificationResult.matches
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            } animate-fadeIn`}
          >
            {/* Status Banner */}
            <div
              className={`p-6 ${
                verificationResult.matches
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
            >
              <div className="flex items-center justify-center gap-4 text-white">
                {verificationResult.matches ? (
                  <>
                    <CheckCircle className="w-12 h-12" />
                    <div>
                      <h2 className="text-3xl font-bold">
                        ✅ Evidencia Verificada
                      </h2>
                      <p className="text-green-100 text-lg">
                        100% Original - Sin Alteraciones
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12" />
                    <div>
                      <h2 className="text-3xl font-bold">
                        ⚠️ Evidencia Alterada
                      </h2>
                      <p className="text-red-100 text-lg">
                        El archivo no coincide con el registro blockchain
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <Hash className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Record ID
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    #{verificationResult.recordId}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Fecha de Registro
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {verificationResult.timestamp.toLocaleString("es-MX")}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-md md:col-span-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-700">
                      Placas del Vehículo
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-wider">
                    {verificationResult.licencePlate}
                  </p>
                </div>
              </div>

              {/* Hashes Comparison */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Comparación de Hashes SHA-256
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Hash en Blockchain:
                    </label>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                      {verificationResult.onChainHash}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Hash Calculado (IPFS):
                    </label>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                      {verificationResult.localHash}
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-lg font-bold text-center text-lg ${
                      verificationResult.matches
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {verificationResult.matches
                      ? "✓ Hashes Coinciden"
                      : "✗ Hashes NO Coinciden"}
                  </div>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Información de Blockchain
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Red:</span>
                    <span className="font-bold text-gray-900">
                      {verificationResult.chain}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Uploader:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {verificationResult.uploader && verificationResult.uploader !== 'local' && verificationResult.uploader !== 'Unknown'
                        ? `${verificationResult.uploader.slice(0, 6)}...${verificationResult.uploader.slice(-4)}`
                        : 'Sistema Local'}
                    </span>
                  </div>
                  
                  {/* Blockchain Links */}
                  {(verificationResult.scrollExplorerUrl || verificationResult.arbitrumExplorerUrl || verificationResult.explorerUrl) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {verificationResult.scrollExplorerUrl && (
                        <a
                          href={verificationResult.scrollExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Ver en Scroll
                        </a>
                      )}
                      {verificationResult.arbitrumExplorerUrl && (
                        <a
                          href={verificationResult.arbitrumExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Ver en Arbitrum
                        </a>
                      )}
                      {verificationResult.explorerUrl && verificationResult.explorerUrl !== '#' && !verificationResult.scrollExplorerUrl && !verificationResult.arbitrumExplorerUrl && (
                        <a
                          href={verificationResult.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Ver en Blockchain
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* IPFS Info */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Almacenamiento IPFS
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      IPFS Hash:
                    </label>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                      {verificationResult.ipfsHash}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={verificationResult.gateway}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      <Link className="w-5 h-5" />
                      Abrir en IPFS
                    </a>
                    <button
                      onClick={handleDownloadFile}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Descargar Video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
