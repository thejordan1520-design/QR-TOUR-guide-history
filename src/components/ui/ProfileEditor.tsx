import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Save, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { firstName: string; lastName?: string; profileImage?: string }) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del perfil desde localStorage cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      const profileData = localStorage.getItem(`profile-data-${user.id}`);
      if (profileData) {
        try {
          const data = JSON.parse(profileData);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setProfileImage(data.profileImage || null);
        } catch (error) {
          console.error('Error parsing profile data:', error);
        }
      } else {
        // Si no hay datos guardados, usar datos básicos del usuario
        const emailName = user.email?.split('@')[0] || '';
        setFirstName(emailName);
        setLastName('');
        setProfileImage(null);
      }
    }
  }, [isOpen, user]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Comprimir imagen si es muy grande
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular nuevas dimensiones (máximo 300x300)
          let { width, height } = img;
          const maxSize = 300;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con calidad reducida
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setProfileImage(compressedImage);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        profileImage: profileImage || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('profile.edit_profile')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Foto de perfil */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-400 shadow-lg">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={t('profile.edit_profile')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {firstName ? firstName[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            
            {profileImage && (
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
            {t('profile.click_camera_to_upload')}
          </p>
        </div>

        {/* Campos de nombre */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.first_name')} *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder={t('profile.enter_first_name')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.last_name')} ({t('profile.optional')})
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder={t('profile.enter_last_name')}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!firstName.trim() || isLoading}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('common.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor; 