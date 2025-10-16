import React from 'react';

interface AwardButtonProps {
  onClick: () => void;
  isEligible: boolean;
}

const AwardButton: React.FC<AwardButtonProps> = ({ onClick, isEligible }) => {
  if (!isEligible) return null;
  return (
    <button
      onClick={onClick}
      className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
    >
      Obtener Certificado Digital de Explorador
    </button>
  );
};

export default AwardButton;
