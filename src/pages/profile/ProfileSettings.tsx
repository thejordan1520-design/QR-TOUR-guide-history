import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Lock, User, Globe, ExternalLink } from 'lucide-react';
import LanguageSelector from '../../components/ui/LanguageSelector';
import AccountSelector from '../../components/ui/AccountSelector';
import PasswordChangeModal from '../../components/ui/PasswordChangeModal';
import { passwordService } from '../../services/passwordService';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [show, setShow] = useState<'none' | 'password' | 'language'>('none');
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [authProviderInfo, setAuthProviderInfo] = useState<{
    provider: string;
    canChangePassword: boolean;
    externalUrl?: string;
  } | null>(null);

  // Obtener información del proveedor de autenticación
  useEffect(() => {
    const getAuthInfo = async () => {
      const info = await passwordService.getAuthProviderInfo();
      setAuthProviderInfo(info);
    };
    getAuthInfo();
  }, [user]);

  const handlePasswordChange = () => {
    if (authProviderInfo?.canChangePassword) {
      setShowPasswordModal(true);
    } else if (authProviderInfo?.externalUrl) {
      window.open(authProviderInfo.externalUrl, '_blank');
    }
  };

  const handleAccountChange = () => {
    setShowAccountSelector(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-green-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          {t('profile.account_settings')}
        </h2>
        
        {show === 'none' && (
          <>
            {/* Cambiar contraseña - modal para email o redirige a portal */}
            <button 
              className="w-full py-3 mb-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2" 
              onClick={handlePasswordChange}
            >
              <Lock className="w-5 h-5" />
              {authProviderInfo?.canChangePassword 
                ? t('profile.change_password')
                : t('profile.manage_password_external')
              }
              {!authProviderInfo?.canChangePassword && (
                <ExternalLink className="w-4 h-4" />
              )}
            </button>
            
            {/* Cambiar cuenta - abre selector de Google/Microsoft */}
            <button 
              className="w-full py-3 mb-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2" 
              onClick={handleAccountChange}
            >
              <User className="w-5 h-5" />
              {t('profile.change_account')}
            </button>
            
            {/* Cambiar idioma */}
            <button 
              className="w-full py-3 mb-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2" 
              onClick={() => setShow('language')}
            >
              <Globe className="w-5 h-5" />
              {t('profile.change_language')}
            </button>
            
            <button 
              className="w-full py-3 mt-4 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-semibold transition" 
              onClick={() => window.history.back()}
            >
              {t('common.back')}
            </button>
          </>
        )}
        
        
        {show === 'language' && (
          <div className="flex flex-col gap-4 items-center">
            <label className="text-gray-700 dark:text-gray-200 font-semibold">
              {t('profile.select_language')}
            </label>
            <LanguageSelector />
            <button 
              type="button" 
              className="text-sm text-gray-500 mt-2" 
              onClick={() => setShow('none')}
            >
              {t('common.cancel')}
            </button>
          </div>
        )}
      </div>

      {/* Selector de cuenta */}
      <AccountSelector 
        isOpen={showAccountSelector} 
        onClose={() => setShowAccountSelector(false)} 
      />

      {/* Modal de cambio de contraseña */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          // Opcional: mostrar mensaje de éxito o actualizar UI
          console.log('Contraseña cambiada exitosamente');
        }}
      />
    </div>
  );
};

export default ProfileSettings; 