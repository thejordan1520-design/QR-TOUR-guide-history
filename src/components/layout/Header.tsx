import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../ui/LanguageSelector';
import RealLoginModal from '../auth/RealLoginModal';
import ProfileModal from '../ui/ProfileModal';
import NotificationBell from '../NotificationBell';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();

  // Formato amigable según el plan y tiempo restante
  const formatTimeRemaining = () => {
    if (!user || !("endTime" in user) || !user.endTime) return '';
    
    const now = new Date();
    const end = new Date(user.endTime as string);
    let diff = Math.max(0, end.getTime() - now.getTime());
    
    // Si no hay tiempo restante, no mostrar nada
    if (diff === 0) return '';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const minutes = Math.floor(diff / (1000 * 60));
    
    // Formato según el tiempo restante:
    // - Si hay días: "6d 24h 59m" (ejemplo para plan de 7 días)
    // - Si solo hay horas: "23h 59m" (ejemplo para plan de 24 horas)
    // - Si menos de 1 hora: "59m"
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };


  // Navegación condicional
  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.subscribe'), href: '/subscribe' },
    ...(user ? [
      { name: t('nav.profile'), href: '/profile' },
      { name: 'Notificaciones', href: '/my-feedback' }
    ] : [])
  ];

  return (
    <header className="bg-white shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo + Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex flex-col items-center justify-center sm:flex-row sm:items-center sm:space-x-3 gap-1 sm:gap-0 w-full">
              <img
                src="/places/logo2.png"
                alt="Logo QR Tour"
                className="h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain group-hover:scale-110 transition-transform duration-300 mx-auto sm:mx-0"
                style={{ 
                  background: 'none',
                  filter: 'brightness(1.1) contrast(1.1)',
                  mixBlendMode: 'multiply'
                }}
              />
              <span
                className="text-base sm:text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-lg text-center sm:text-left"
                style={{ letterSpacing: '1px' }}
              >
                {t('brand')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/subscribe"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/subscribe' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {t('nav.subscribe')}
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {t('nav.profile')}
            </Link>
            
            {/* Time Remaining Display */}
            {!!user && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {formatTimeRemaining()}
                </span>
              </div>
            )}


            <LanguageSelector />
            
            {/* Campana de notificaciones */}
            {user && <NotificationBell userId={user.id} />}
            
            {!user && (
              <>
                <button
                  className="ml-2 px-3 py-2 rounded-md text-xs sm:text-sm md:text-base font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors duration-200"
                  onClick={() => setShowLogin(true)}
                >
                  {t('nav.login')}
                </button>
              </>
            )}

            {/* Logout Button */}
            {!!user && (
              <button
                onClick={async () => {
                  try {
                    // Limpiar datos locales primero
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('offline-premium-status');
                    localStorage.removeItem('offline-user-data');
                    
                    // Limpiar tokens de Supabase
                    localStorage.removeItem('sb-nhegdlprktbtriwwhoms-auth-token');
                    localStorage.removeItem('supabase.auth.token');
                    
                    // Cerrar sesión en Supabase
                    await signOut();
                    
                    // No redirigir forzadamente, dejar que el estado se actualice naturalmente
                    console.log('Logout completado');
                  } catch (error) {
                    console.error('Error durante logout:', error);
                  }
                }}
                className="text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
              >
                {t('nav.logout')}
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Botón Iniciar sesión en móvil */}
              {!user && (
                <button
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-left"
                  onClick={() => {
                    setShowLogin(true);
                    setIsMenuOpen(false);
                  }}
                >
                  {t('nav.login')}
                </button>
              )}
              
              {/* Mobile Time Remaining */}
              {!!user && (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200 mx-3">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {formatTimeRemaining()}
                  </span>
                </div>
              )}

              {/* Mobile Logout */}
              {!!user && (
                <button
                  onClick={async () => {
                    try {
                      // Limpiar datos locales primero
                      localStorage.removeItem('access_token');
                      localStorage.removeItem('user');
                      localStorage.removeItem('jwt');
                      localStorage.removeItem('offline-premium-status');
                      localStorage.removeItem('offline-user-data');
                      
                      // Limpiar tokens de Supabase
                      localStorage.removeItem('sb-nhegdlprktbtriwwhoms-auth-token');
                      localStorage.removeItem('supabase.auth.token');
                      
                      // Cerrar sesión en Supabase
                      await signOut();
                      
                      // Cerrar menú móvil
                      setIsMenuOpen(false);
                      
                      console.log('Logout completado desde móvil');
                    } catch (error) {
                      console.error('Error durante logout:', error);
                    }
                  }}
                  className="text-left px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200"
                >
                  {t('nav.logout')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Mover los modales aquí para que funcionen en móvil y escritorio */}
            <RealLoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={{
            fullName: user.user_metadata?.full_name || user.email || '',
            name: user.user_metadata?.full_name || user.email || '',
            email: user.email || '',
            country: user.user_metadata?.country || ''
          }}
          onLogout={signOut}
          onEdit={() => {}}
          onChangePassword={() => {}}
        />
      )}
    </header>
  );
};

export default Header;