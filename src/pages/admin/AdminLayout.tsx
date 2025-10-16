import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, Compass, Utensils, ShoppingCart,
  Briefcase, QrCode, Calendar, MessageSquare, Bell, Megaphone,
  Calendar as CalendarIcon, CreditCard, Trophy, FileText, Database as DatabaseIcon,
  Calculator, Languages, Shield, Settings as SettingsIcon, Palette, MessageSquare as MessageSquareIcon,
  Search, Menu, X, LogOut, Moon, Sun, ChevronDown, Trash2, CheckCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import { AdminHealthBanner } from '../../components/admin/AdminHealthBanner';
import { useAdminKeepAlive } from '../../hooks/useAdminKeepAlive';
import AdminNotificationBell from '../../components/AdminNotificationBell';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // ✅ Keep-Alive DESHABILITADO - Causaba corrupción localStorage
  // useAdminKeepAlive();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  // Get current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    return currentMenuItem ? currentMenuItem.label : 'Dashboard';
  };

  // Mock admin user
  const adminUser = { 
    email: 'admin@qrtour.com', 
    name: 'Admin User',
    avatar: 'A'
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'Usuarios', icon: Users, path: '/admin/users' },
    { id: 'places', label: 'Lugares', icon: MapPin, path: '/admin/places' },
    { id: 'excursions', label: 'Excursiones', icon: Compass, path: '/admin/excursions' },
    { id: 'restaurants', label: 'Restaurantes', icon: Utensils, path: '/admin/restaurants' },
    { id: 'supermarkets', label: 'Supermercados', icon: ShoppingCart, path: '/admin/supermarkets' },
    { id: 'services', label: 'Servicios', icon: Briefcase, path: '/admin/services' },
    { id: 'qr-codes', label: 'Códigos QR', icon: QrCode, path: '/admin/qr-codes' },
    { id: 'reservations', label: 'Reservaciones', icon: Calendar, path: '/admin/reservations' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, path: '/admin/notifications' },
    { id: 'advertising', label: 'Publicidad', icon: Megaphone, path: '/admin/advertising' },
    { id: 'plans', label: 'Planes', icon: CreditCard, path: '/admin/plans' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, path: '/admin/payments' },
    { id: 'gamification', label: 'Gamificación', icon: Trophy, path: '/admin/gamification' },
    { id: 'logs-config', label: 'Logs y Config', icon: FileText, path: '/admin/logs-config' },
    { id: 'database', label: 'Base de Datos', icon: DatabaseIcon, path: '/admin/database' },
    { id: 'accounting', label: 'Contabilidad', icon: Calculator, path: '/admin/accounting' },
    { id: 'translations', label: 'Traducciones', icon: Languages, path: '/admin/translations' },
    { id: 'admin-logs', label: 'Logs Admin', icon: Shield, path: '/admin/admin-logs' },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon, path: '/admin/settings' },
    { id: 'appearance', label: 'Apariencia', icon: Palette, path: '/admin/appearance' },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-menu') && !target.closest('.user-menu')) {
        // setNotificationsOpen ya no es necesario - AdminNotificationBell maneja su propio estado
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    console.log('🚪 Cerrando sesión desde AdminLayout...');
    await logout();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // unreadCount ya viene del hook useAdminNotifications

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 dark:bg-gray-900 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QR</span>
              </div>
              <span className="text-white font-semibold">QR Tour</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white p-1 rounded"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(adminUser.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {adminUser.name}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {adminUser.email}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getInitials(adminUser.name)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getCurrentPageTitle()}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 w-64"
                />
              </div>

              {/* Notifications */}
              <AdminNotificationBell />

              {/* User Menu */}
              <div className="relative user-menu">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getInitials(adminUser.name)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          navigate('/admin/profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <SettingsIcon className="w-4 h-4 mr-3" />
                        Perfil
                      </button>
                      <button 
                        onClick={() => {
                          toggleDarkMode();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {darkMode ? (
                          <Sun className="w-4 h-4 mr-3" />
                        ) : (
                          <Moon className="w-4 h-4 mr-3" />
                        )}
                        {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                      </button>
                      <button 
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {/* Banner de salud de conexión */}
          <AdminHealthBanner />
          
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-4 h-6 w-6" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;