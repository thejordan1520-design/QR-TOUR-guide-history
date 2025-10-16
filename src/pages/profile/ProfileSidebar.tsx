import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWebTexts } from '../../contexts/WebTextsContext';

interface Props {
  section: string;
  setSection: (s: string) => void;
}

const ProfileSidebar: React.FC<Props> = ({ section, setSection }) => {
  const { getText } = useWebTexts();
  
  const sections = [
    { key: 'details', label: 'Datos personales' },
    { key: 'password', label: 'Cambiar contraseña' },
    { key: 'subscriptions', label: 'Suscripciones' },
    { key: 'qr', label: 'Historial QR' },
    { key: 'map', label: 'Mapa de lugares' },
    { key: 'upgrade', label: 'Mejorar plan' },
  ];
  
  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col md:flex-col gap-2 md:gap-4 shadow-sm">
      {sections.map(s => (
        <button
          key={s.key}
          onClick={() => setSection(s.key)}
          className={`w-full text-left px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-colors duration-200 ${section === s.key ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
        >
          {s.label}
        </button>
      ))}
    </aside>
  );
};

export default ProfileSidebar;
