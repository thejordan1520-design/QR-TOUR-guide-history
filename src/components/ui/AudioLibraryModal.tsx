import React from 'react';
import { X, Play, Pause } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useAudio } from '../../contexts/AudioContext';
import LimitedAudioPlayer from './LimitedAudioPlayer';

interface AudioLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Array<{
    id: string;
    name: string;
    audio: string;
    image: string;
  }>;
}




// Main component
const AudioLibraryModal: React.FC<AudioLibraryModalProps> = ({ isOpen, onClose, locations }) => {
  const { t } = useTranslation();
  const { pauseAllAudios } = useAudio();

  // Detener audio cuando se cierra el modal
  React.useEffect(() => {
    if (!isOpen) {
      pauseAllAudios();
    }
  }, [isOpen, pauseAllAudios]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl md:max-w-2xl p-4 sm:p-6 relative flex flex-col"
        style={{ maxHeight: '90vh', minHeight: '300px', overflow: 'hidden' }}
      >
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 z-10"
          onClick={onClose}
          aria-label={t('close')}
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">{t('audioLibrary.title')}</h2>
        <div
          className="space-y-6 overflow-y-auto flex-1"
          style={{ maxHeight: '70vh', paddingRight: '0.5rem' }}
        >
          {locations.map((loc, idx) => (
            <div key={loc.id} className="flex gap-4 items-center">
              <img
                src={loc.image}
                alt={loc.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <div className="flex-1">
                <div className="font-semibold">{loc.name}</div>
                {loc.audio ? (
                  <LimitedAudioPlayer
                    src={loc.audio}
                    title={loc.name}
                    subtitle={t('audioLibrary.click_to_play')}
                    language={t('audioLibrary.languages.spanish')}
                    autoPlay={false}
                    audioId={loc.id}
                  />
                ) : (
                  <div className="text-gray-400 text-sm mt-2">{t('audioLibrary.audio_not_available')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Barra para cerrar y mover el modal en mobile */}
        <div className="flex justify-center items-center mt-2">
          <button
            className="px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow"
            onClick={onClose}
            aria-label={t('close')}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioLibraryModal;
