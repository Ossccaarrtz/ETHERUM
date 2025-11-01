import { useState } from "react";
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
} from "lucide-react";

export default function VerifyEvidence() {
  const [recordId, setRecordId] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { verifyEvidence, loading, verificationResult, error, progress } =
    useVerifyEvidence();

  const handleVerify = async () => {
    if (!recordId || recordId.trim() === "") {
      toast.error("Por favor ingresa un Record ID");
      return;
    }

    try {
      toast.loading("Iniciando verificación...", { id: "verify-loading" });
      await verifyEvidence(recordId.trim());
      toast.dismiss("verify-loading");
    } catch (err) {
      console.error("Error verificando:", err);
      toast.dismiss("verify-loading");
    }
  };

  const handleQRScan = (scannedId) => {
    setRecordId(scannedId);
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
                Record ID de la Evidencia
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  placeholder="Ej: ABC123 o cualquier ID"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  disabled={loading}
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
              disabled={loading || !recordId}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6" />
                  Verificar Evidencia
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
                      {verificationResult.uploader.slice(0, 6)}...
                      {verificationResult.uploader.slice(-4)}
                    </span>
                  </div>
                  <a
                    href={verificationResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Ver en Blockchain Explorer
                  </a>
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
