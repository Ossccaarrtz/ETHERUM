import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      // Esperar un momento para que el DOM se monte
      const timer = setTimeout(() => {
        if (document.getElementById('qr-reader')) {
          // Crear scanner
          qrCodeScannerRef.current = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            false // verbose
          );

          // Configurar callback
          qrCodeScannerRef.current.render(
            (decodedText, decodedResult) => {
              // Extraer recordId del resultado
              let recordId = null;
              
              try {
                // Intentar parsear como JSON
                if (decodedText.startsWith('{')) {
                  const data = JSON.parse(decodedText);
                  recordId = data.recordId || data.id || decodedText;
                } 
                // Si es un número o texto, usar directamente
                else {
                  recordId = decodedText.trim();
                }
                
                if (recordId) {
                  setScanning(false);
                  onScan(recordId);
                  setTimeout(() => {
                    if (qrCodeScannerRef.current) {
                      qrCodeScannerRef.current.clear().catch(err => console.error(err));
                    }
                    onClose();
                  }, 500);
                } else {
                  setError('No se pudo extraer Record ID del QR');
                }
              } catch (err) {
                console.error('Error procesando QR:', err);
                setError('Formato de QR inválido');
              }
            },
            (errorMessage) => {
              // Ignorar errores de escaneo continuo
            }
          );
        }
      }, 100);

      // Cleanup
      return () => {
        clearTimeout(timer);
        if (qrCodeScannerRef.current) {
          qrCodeScannerRef.current.clear().catch(err => console.error(err));
        }
      };
    }
  }, [scanning, onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>

        <h3 className="text-xl font-bold mb-4 text-gray-900">
          Escanear Código QR
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {scanning && (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div id="qr-reader" className="w-full min-h-[400px]"></div>
            <div ref={scannerRef} className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!scanning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Procesando código QR...</p>
          </div>
        )}

        <p className="text-sm text-gray-500 text-center mt-4">
          Coloca el código QR dentro del marco
        </p>
      </div>
    </div>
  );
}
