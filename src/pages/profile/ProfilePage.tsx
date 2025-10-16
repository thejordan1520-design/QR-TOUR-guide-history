import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, Moon, Globe, HelpCircle, CreditCard, UserCog, Edit, Crown, MapPin, Headphones, MessageSquare, FileText, Shield, Code, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { saveFiles } from '../../utils/offlineStorage';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileEditor from '../../components/ui/ProfileEditor';
import FeedbackForm from '../../components/ui/FeedbackForm';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [selectedLegalSection, setSelectedLegalSection] = useState<'terms' | 'privacy' | 'license' | null>(null);

  // Datos de progreso (simplificado para Supabase)
  const planUsed = 0;
  const planTotal = 20;
  const planPercent = Math.round((planUsed / planTotal) * 100);

  // Gamificación (simplificada)
  const visitedDestinations = 0;
  const totalDestinations = 25; // Total de destinos disponibles
  const completedTours = 0;
  
  // Calcular nivel basado en destinos visitados
  const userLevel = Math.floor(visitedDestinations / 3) + 1;
  const userRanking = Math.max(1, Math.floor(Math.random() * 50) + 1); // Simulado por ahora
  
  // Medallas basadas en logros reales
  const medals = [
    { name: 'Explorador', icon: '🏅', unlocked: visitedDestinations >= 5 },
    { name: 'Curioso', icon: '🔍', unlocked: visitedDestinations >= 10 },
    { name: 'Viajero', icon: '🌎', unlocked: visitedDestinations >= 15 },
    { name: 'Experto', icon: '👑', unlocked: visitedDestinations >= 20 },
  ].filter(medal => medal.unlocked);

  // Avatar y datos del usuario
  const getDisplayName = () => {
    if (!user) return 'Invitado';
    
    // Intentar obtener datos del perfil desde localStorage
    const profileData = localStorage.getItem(`profile-data-${user.id}`);
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.fullName && data.fullName.trim()) {
          return data.fullName;
        }
        if (data.firstName && data.firstName.trim()) {
          return data.firstName;
        }
      } catch (error) {
        console.error('Error parsing profile data:', error);
      }
    }
    
    // Fallback a datos básicos del usuario
    return user.display_name || user.email?.split('@')[0] || 'Usuario';
  };
  
  const displayName = getDisplayName();
  
  // Obtener avatar desde localStorage o metadata
  const getAvatarUrl = () => {
    if (user?.id) {
      const localImage = localStorage.getItem(`profile-image-${user.id}`);
      if (localImage) {
        return localImage;
      }
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;
  };
  
  const avatarUrl = getAvatarUrl();
  const email = user?.email || 'Sin correo';

  // Versión app
  const version = '2.1.47';

  // Funciones mínimas para los botones
  const handleSubscription = () => {
    try {
      navigate('/subscribe');
    } catch {
      alert('Ir a suscripción y planes');
    }
  };
  const handleAccountSettings = () => {
    try {
      navigate('/profile/settings');
    } catch {
      alert('Ir a configuración de cuenta');
    }
  };
  const handleHelpCenter = () => {
    try {
      navigate('/help');
    } catch {
      alert('Ir al centro de ayuda');
    }
  };
  const handleFeedback = () => {
    setShowFeedbackForm(true);
  };
  const handleLegal = () => {
    setShowLegalModal(true);
  };
  const handleLegalSection = (section: 'terms' | 'privacy' | 'license') => {
    setSelectedLegalSection(section);
  };
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión');
    }
  };

  const handleSaveProfile = async (data: { firstName: string; lastName?: string; profileImage?: string }) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error('No hay usuario autenticado');
      }

      console.log('🔄 Guardando perfil en localStorage:', {
        firstName: data.firstName,
        lastName: data.lastName,
        hasImage: !!data.profileImage,
        userId: user.id
      });

      // Guardar datos del perfil en localStorage
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName || '',
        fullName: `${data.firstName} ${data.lastName || ''}`.trim(),
        profileImage: data.profileImage || null,
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(`profile-data-${user.id}`, JSON.stringify(profileData));

      // Si hay imagen, también guardarla por separado para fácil acceso
      if (data.profileImage) {
        const imageKey = `profile-image-${user.id}`;
        localStorage.setItem(imageKey, data.profileImage);
        console.log('✅ Imagen guardada en localStorage:', imageKey);
      }

      console.log('✅ Perfil guardado exitosamente en localStorage');
      
      // Cerrar el modal de edición
      setShowProfileEditor(false);
      
      // Mostrar mensaje de éxito
      alert('Perfil actualizado exitosamente');
      
      // Recargar la página para mostrar los cambios
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el perfil');
    }
  };

  const [offlineMode, setOfflineMode] = useState(false);
  const audioFiles = [
    'callesombrillaFRC.mp3', 'ronfactory.mp3', 'neptuno.mp3', 'museodelambar.mp3', 'letreropuertoplata.mp3', 'larimarr.mp3', 'hermanasmirabal.mp3', 'fortalezasanfelipe.mp3', 'cristoredentor.mp3', 'catedralsanfelipe.mp3', 'callerosada.mp3', 'callesombrillas.mp3', 'calledelacometas.mp3', 'telefericoING.mp3', 'ronfactoryING.mp3', 'neptuneiING.mp3', 'museoambarING.mp3', 'letreroING.mp3', 'larimarING.mp3', 'hermanasmirabalING.mp3', 'fortalezaING.mp3', 'cometasING.mp3', 'catedralING.mp3', 'callesombrillaING.mp3', 'callerosadaING.mp3', 'cristoredentorING.mp3', 'museoambarFRC.mp3', 'letreroFRC.mp3', 'callerosadaFRC.mp3', 'telefericoFRC.mp3', 'telefericoESP.mp3', 'fortalezaFRC.mp3'
  ];

  const [audioDownloadProgress, setAudioDownloadProgress] = useState<number | null>(null);
  const [audioDownloadStatus, setAudioDownloadStatus] = useState<string | null>(null);

  const handleDownloadAudios = async () => {
    setAudioDownloadProgress(0);
    setAudioDownloadStatus(null);
    try {
      const filesToSave: {key: string, blob: Blob}[] = [];
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        setAudioDownloadProgress(Math.round((i / audioFiles.length) * 100));
        const res = await fetch(`/audios/${file}`);
        if (!res.ok) throw new Error(`Error descargando ${file}`);
        const blob = await res.blob();
        filesToSave.push({ key: `audio/${file}`, blob });
      }
      await saveFiles(filesToSave);
      setAudioDownloadProgress(100);
      setAudioDownloadStatus(t('profile.download_audios_success'));
    } catch (err: any) {
      setAudioDownloadStatus(t('profile.download_audios_error', {error: err.message || err.toString()}));
      setAudioDownloadProgress(null);
    }
  };
  const handleDownloadMap = () => alert(t('profile.download_map_success'));
  const handleDownloadImages = async () => {
    setImageDownloadProgress(0);
    setImageDownloadStatus(null);
    try {
      const filesToSave: {key: string, blob: Blob}[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setImageDownloadProgress(Math.round((i / imageFiles.length) * 100));
        const res = await fetch(`/places/${file}`);
        if (!res.ok) throw new Error(`Error descargando ${file}`);
        const blob = await res.blob();
        filesToSave.push({ key: `image/${file}`, blob });
      }
      await saveFiles(filesToSave);
      setImageDownloadProgress(100);
      setImageDownloadStatus(t('profile.download_images_success'));
    } catch (err: any) {
      setImageDownloadStatus(t('profile.download_images_error', {error: err.message || err.toString()}));
      setImageDownloadProgress(null);
    }
  };

  const isPremium = !!user; // Simplificado para Supabase

  const imageFiles = [
    'ronfactory.jpg', 'teleferico.jpg', 'logo.jpg', 'museodelambar.jpg', 'neptuno.jpg', 'oceanworld.jpg', 'letreropuertoplata.jpg', 'fortalezasanfelipe.jpg', 'hermanasmirabal.jpg', 'larimarr.jpg', 'calledelasombrillas.jpg', 'callerosada.jpg', 'catedralsanfelipe.jpg', 'cristoredentor.jpg', 'calledelacometas.jpg', 'MuseoGregorioLuperon.jpg', 'ParqueCentraldePuertoPlata.jpg'
  ];

  const [imageDownloadProgress, setImageDownloadProgress] = useState<number | null>(null);
  const [imageDownloadStatus, setImageDownloadStatus] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center py-8 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full border-4 border-green-400 shadow" />
            <button
              onClick={() => setShowProfileEditor(true)}
              className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow-lg transition-colors"
              title={t('profile.edit_profile')}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</div>
          <div className="text-gray-500 dark:text-gray-300 text-sm">{email}</div>
          {isPremium && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
              <Crown className="w-4 h-4" />
              {t('profile.premium_user')}
            </div>
          )}
        </div>
        {/* Progreso de plan */}
        <div className="bg-lime-100 dark:bg-lime-900 rounded-xl p-4 flex items-center gap-4 shadow-inner">
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">{t('profile.plan_progress')}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{t('profile.plan_progress_count', {used: planUsed, total: planTotal})}</div>
            <button className="mt-2 px-4 py-1 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-semibold text-xs transition">{t('profile.upgrade_plan')}</button>
          </div>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#d1fae5" strokeWidth="8" />
            <circle cx="32" cy="32" r="28" fill="none" stroke="#84cc16" strokeWidth="8" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - planPercent / 100)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
            <text x="32" y="38" textAnchor="middle" fontSize="18" fill="#222" className="dark:fill-white font-bold">{planPercent}%</text>
          </svg>
        </div>
        {/* Gamificación */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-xl p-4 flex flex-col gap-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="font-semibold text-xs text-blue-700 dark:text-blue-200 mb-1">{t('profile.medals')}</div>
              <div className="flex gap-2 text-2xl">
                {medals.length > 0 ? (
                  medals.map((m, i) => (
                    <span key={i} title={t('profile.medal_' + m.name.toLowerCase())}>
                      {m.icon}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-lg">{t('profile.no_medals_yet')}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="font-semibold text-xs text-blue-700 dark:text-blue-200 mb-1">{t('profile.level')}</div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{userLevel}</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="font-semibold text-xs text-blue-700 dark:text-blue-200 mb-1">{t('profile.ranking')}</div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">#{userRanking}</div>
            </div>
          </div>
          
          {/* Progreso de destinos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.destinations_visited')}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {visitedDestinations}/{totalDestinations}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((visitedDestinations / totalDestinations) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Tours completados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.tours_completed')}
                </span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {completedTours}
              </span>
            </div>
          </div>
        </div>
        {/* Sección de cuenta */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">{t('profile.account')}</div>
          <div className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-2" onClick={handleSubscription}>
            <CreditCard className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.subscription_and_plans')}</span>
            <span className="text-gray-400">&gt;</span>
          </div>
          <div className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-2" onClick={handleAccountSettings}>
            <UserCog className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.account_settings')}</span>
            <span className="text-gray-400">&gt;</span>
          </div>
          <div className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-2" onClick={handleFeedback}>
            <MessageSquare className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">Feedback y Sugerencias</span>
            <span className="text-gray-400">&gt;</span>
          </div>
          <div className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg px-2" onClick={handleLegal}>
            <FileText className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.legal')}</span>
            <span className="text-gray-400">&gt;</span>
          </div>
        </div>
        {/* Preferencias */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-2">
          <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">{t('profile.preferences')}</div>
          <div className="flex items-center gap-3 py-2 px-2">
            <Globe className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.language')}</span>
            <div className="ml-2"><LanguageSelector /></div>
          </div>
          <div className="flex items-center gap-3 py-2 px-2">
            <Moon className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.dark_mode')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-500 dark:bg-gray-700 rounded-full peer dark:peer-checked:bg-lime-600 transition-all">
                <div className="absolute left-1 top-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </div>
            </label>
          </div>
          <div className="flex items-center gap-3 py-2 px-2">
            <span className="w-5 h-5 flex items-center justify-center text-lime-600"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.offline_mode')}</span>
            {isPremium ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={offlineMode} onChange={() => setOfflineMode(v => !v)} className="sr-only peer" />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-500 dark:bg-gray-700 rounded-full peer dark:peer-checked:bg-lime-600 transition-all">
                  <div className="absolute left-1 top-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                </div>
              </label>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('profile.offline_mode_premium_only')}</span>
            )}
          </div>
          {isPremium && offlineMode && (
            <div className="flex flex-col gap-2 mt-2">
              <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold transition" onClick={handleDownloadAudios} disabled={audioDownloadProgress !== null && audioDownloadProgress < 100}>
                {audioDownloadProgress !== null && audioDownloadProgress < 100
                  ? `${t('profile.downloading')} ${audioDownloadProgress}%...`
                  : t('profile.download_audios')}
              </button>
              {audioDownloadStatus && <div className="text-xs text-green-700 dark:text-green-300 font-semibold">{audioDownloadStatus}</div>}
              <button className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 font-semibold transition" disabled>{t('profile.download_map')}</button>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-4 py-2 font-semibold transition" onClick={handleDownloadImages} disabled={imageDownloadProgress !== null && imageDownloadProgress < 100}>
                {imageDownloadProgress !== null && imageDownloadProgress < 100
                  ? `${t('profile.downloading')} ${imageDownloadProgress}%...`
                  : t('profile.download_images')}
              </button>
              {imageDownloadStatus && <div className="text-xs text-green-700 dark:text-green-300 font-semibold">{imageDownloadStatus}</div>}
            </div>
          )}
          {!isPremium && (
            <div className="flex flex-col gap-2 mt-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-3 text-center">
              <span className="text-yellow-800 dark:text-yellow-200 font-semibold">{t('profile.offline_mode_premium_only')}</span>
              <button className="bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-lg px-4 py-2 font-bold mt-2" onClick={handleSubscription}>{t('profile.upgrade_plan')}</button>
            </div>
          )}
          <div className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg" onClick={handleHelpCenter}>
            <HelpCircle className="w-5 h-5 text-lime-600" />
            <span className="flex-1 text-gray-900 dark:text-white">{t('profile.help_center')}</span>
            <span className="text-gray-400">&gt;</span>
          </div>
        </div>
        {/* Cerrar sesión y versión */}
        <div className="flex flex-col gap-2 items-center mt-2">
          {user && <button className="flex items-center gap-2 text-red-600 font-bold px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900 transition" onClick={handleLogout}><LogOut className="w-5 h-5" /> {t('profile.logout')}</button>}
          <div className="text-xs text-gray-400 mt-2">{t('profile.version', {version})}</div>
        </div>
      </div>

      {/* Editor de perfil */}
      <ProfileEditor
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        onSave={handleSaveProfile}
      />

      {/* Formulario de Feedback */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        onSuccess={() => {
          setShowFeedbackForm(false);
          // Opcional: mostrar mensaje de éxito
          alert('¡Gracias por tu feedback!');
        }}
      />

      {/* Modal de Sección Legal */}
      {showLegalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLegalModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-lime-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.legal_information')}</h2>
              </div>
              <button 
                onClick={() => setShowLegalModal(false)} 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4">
              {!selectedLegalSection ? (
                // Menú principal de secciones legales
                <div className="space-y-3">
                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => handleLegalSection('terms')}
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('profile.terms_of_use')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.terms_description')}</p>
                    </div>
                    <span className="text-gray-400">&gt;</span>
                  </div>

                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => handleLegalSection('privacy')}
                  >
                    <Shield className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('profile.privacy_policy')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.privacy_description')}</p>
                    </div>
                    <span className="text-gray-400">&gt;</span>
                  </div>

                  <div 
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => handleLegalSection('license')}
                  >
                    <Code className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{t('profile.open_source_license')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.license_description')}</p>
                    </div>
                    <span className="text-gray-400">&gt;</span>
                  </div>
                </div>
              ) : (
                // Contenido de la sección seleccionada
                <div className="space-y-4">
                  {/* Botón de regreso */}
                  <button 
                    onClick={() => setSelectedLegalSection(null)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('profile.common.back')}</span>
                  </button>

                  {/* Contenido específico de cada sección */}
                  <div className="max-h-96 overflow-y-auto">
                    {selectedLegalSection === 'terms' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Términos de Uso</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                          <p><strong>Última actualización:</strong> 22 de septiembre de 2025</p>
                          
                          <div>
                            <h4 className="font-semibold mb-2">1. Aceptación de Términos</h4>
                            <p>Al utilizar QR Tour, aceptas estos términos de uso. Si no estás de acuerdo, no uses nuestro servicio.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">2. Uso del Servicio</h4>
                            <p>QR Tour es una plataforma de turismo interactivo que te permite explorar lugares históricos mediante códigos QR y audios guiados.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">3. Cuentas de Usuario</h4>
                            <p>Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo tu cuenta.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">4. Contenido</h4>
                            <p>El contenido de QR Tour está protegido por derechos de autor. No puedes reproducir, distribuir o modificar el contenido sin autorización.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">5. Limitación de Responsabilidad</h4>
                            <p>QR Tour no se hace responsable por daños directos o indirectos resultantes del uso de nuestro servicio.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">6. Modificaciones</h4>
                            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos al ser publicados.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLegalSection === 'privacy' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Política de Privacidad</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                          <p><strong>Última actualización:</strong> 22 de septiembre de 2025</p>
                          
                          <div>
                            <h4 className="font-semibold mb-2">1. Información que Recopilamos</h4>
                            <p>Recopilamos información que nos proporcionas directamente, como tu nombre, email, y preferencias de usuario.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">2. Uso de la Información</h4>
                            <p>Utilizamos tu información para proporcionar y mejorar nuestros servicios, personalizar tu experiencia y comunicarnos contigo.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">3. Compartir Información</h4>
                            <p>No vendemos, alquilamos ni compartimos tu información personal con terceros sin tu consentimiento, excepto cuando sea legalmente requerido.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">4. Seguridad</h4>
                            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">5. Cookies</h4>
                            <p>Utilizamos cookies para mejorar tu experiencia de navegación y analizar el uso de nuestro sitio web.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">6. Tus Derechos</h4>
                            <p>Tienes derecho a acceder, rectificar, eliminar o portar tus datos personales. Puedes contactarnos para ejercer estos derechos.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedLegalSection === 'license' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Licencia de Código Abierto</h3>
                        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                          <p><strong>Versión limitada - Solo para fines educativos</strong></p>
                          
                          <div>
                            <h4 className="font-semibold mb-2">1. Licencia MIT (Limitada)</h4>
                            <p>Esta aplicación utiliza una versión limitada de la licencia MIT. Solo se permite el uso para fines educativos y de aprendizaje.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">2. Restricciones</h4>
                            <p>• No se permite uso comercial sin autorización<br/>
                            • No se permite redistribución completa del código<br/>
                            • Solo se permite uso personal y educativo</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">3. Tecnologías Utilizadas</h4>
                            <p>Este proyecto utiliza tecnologías de código abierto como React, TypeScript, Tailwind CSS, y Supabase.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">4. Contenido Propietario</h4>
                            <p>El contenido de audio, imágenes y textos sobre Puerto Plata son propiedad de QR Tour y están protegidos por derechos de autor.</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">5. Contacto</h4>
                            <p>Para consultas sobre licencias o permisos de uso, contacta a nuestro equipo legal.</p>
                          </div>

                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                              <strong>Nota:</strong> Esta es una versión limitada de código abierto. Para acceso completo al código fuente, contacta con el equipo de desarrollo.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;