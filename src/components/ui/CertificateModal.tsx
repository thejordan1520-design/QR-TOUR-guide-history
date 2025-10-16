import React from 'react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  // Descargar como PDF usando print, o puedes integrar html2pdf si lo deseas
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Descarga como imagen o PDF (puedes mejorar con html2pdf.js si lo deseas)
    handlePrint();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">×</button>
        <div className="text-center">
          <img src="/icon-192.png" alt="Logo" className="mx-auto mb-4 w-16 h-16" />
          <h2 className="text-3xl font-extrabold mb-2 text-yellow-600 drop-shadow">Certificado de Reconocimiento</h2>
          <p className="mb-4 text-lg text-gray-700 font-semibold">Otorgado a:</p>
          <div className="text-2xl font-bold text-gray-900 mb-2 underline decoration-yellow-400">{userName}</div>
          <p className="mb-6 text-gray-700">Por haber guiado y visitado <span className='font-bold text-yellow-700'>40 o más lugares</span> de Puerto Plata escaneando los QR.<br/>¡Felicidades por tu liderazgo, dedicación y orgullo turístico!</p>
          <div className="mb-6 flex flex-col items-center gap-2">
            <img 
              src="/places/logo2.png" 
              alt="Logo QR Tour" 
              className="mx-auto w-20 h-20 rounded-xl border-2 border-yellow-400 shadow" 
              style={{ 
                filter: 'brightness(1.1) contrast(1.1)',
                mixBlendMode: 'multiply'
              }}
            />
            <img src="/logo-ministerio-turismo.png" alt="Ministerio de Turismo" className="mx-auto w-32 h-12 object-contain" />
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <button onClick={handleDownload} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300">Descargar PDF</button>
            <button onClick={handlePrint} className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300">Imprimir</button>
            <button onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300">Cerrar</button>
          </div>
          <div className="mt-8 flex flex-col items-center">
            <img src="/firma-digital.png" alt="Firma digital" className="w-40 h-12 object-contain mb-1" />
            <span className="text-sm text-gray-500">Director, QR Tour</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
