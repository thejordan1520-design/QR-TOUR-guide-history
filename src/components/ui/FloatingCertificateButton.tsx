import React from 'react';

interface FloatingCertificateButtonProps {
  onClick: () => void;
  visible: boolean;
}

const FloatingCertificateButton: React.FC<FloatingCertificateButtonProps> = ({ onClick, visible }) => {
  if (!visible) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-5 rounded-full shadow-2xl hover:from-yellow-500 hover:to-orange-600 font-extrabold text-xl flex items-center space-x-3 animate-bounce border-4 border-white ring-2 ring-yellow-300"
      style={{ minWidth: 260 }}
      aria-label="Obtener Certificado de Guía Turístico"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a2.25 2.25 0 01-3.18 0l-6.36-6.36a2.25 2.25 0 013.18-3.18l6.36 6.36a2.25 2.25 0 010 3.18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75" />
      </svg>
      <span>Obtener Certificado de Guía</span>
    </button>
  );
};

export default FloatingCertificateButton;
