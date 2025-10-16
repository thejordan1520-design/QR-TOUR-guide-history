import React, { useEffect } from 'react';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (open && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(() => {/* Permiso concedido, lógica futura aquí */})
        .catch(() => {/* Permiso denegado, lógica futura aquí */});
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Escanear QR</h2>
        <div className="flex flex-col items-center justify-center h-40">
          <span className="text-5xl mb-4">📷</span>
          <p className="text-gray-700">Escaneando QR...</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 