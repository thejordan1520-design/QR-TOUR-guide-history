import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioProvider } from './contexts/AudioContext';
import { ThemeProvider } from './contexts/ThemeContext';
// Nota: Las rutas admin usan su propio guard (AdminAuthGuard) interno en `AdminIndex`

// Componentes globales
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ui/ScrollToTop';
import CookieConsent from './components/ui/CookieConsent';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AdvertisingProvider } from './contexts/AdvertisingContext';

// Páginas públicas
import HomePage from './pages/HomePage';
import BibliotecaReact from './pages/BibliotecaReact';
import SubscribePage from './pages/SubscribePage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AuthCallback from './pages/AuthCallback';

// Páginas de servicios
import ServicesHub from './pages/services/ServicesHub';
import ServiceCategoryPage from './pages/services/ServiceCategoryPage';
import RestaurantsPage from './pages/services/RestaurantsPage';
import SupermarketsPage from './pages/services/SupermarketsPage';
import TaxiDriversPage from './pages/services/TaxiDriversPage';
import TourGuidesPage from './pages/services/TourGuidesPage';
import ExcursionsPage from './pages/services/ExcursionsPage';
import BusesPage from './pages/services/BusesPage';
import EventsPage from './pages/services/EventsPage';

// Páginas admin
import AdminLogin from './pages/admin/Login';
import AdminIndex from './pages/admin/Index';
import QRMap from './pages/QRMap';

import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <Router>
              <Routes>
                {/* Rutas públicas con Header, Footer y AdvertisingProvider */}
                <Route path="/*" element={
                  <AdvertisingProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/mapa" element={<QRMap />} />
                          <Route path="/biblioteca" element={<BibliotecaReact />} />
                          <Route path="/biblioteca-react" element={<BibliotecaReact />} />
                          <Route path="/subscribe" element={<SubscribePage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/auth-callback" element={<AuthCallback />} />
                          
                          {/* Rutas de servicios */}
                          <Route path="/services" element={<ServicesHub />} />
                          <Route path="/services/:categoryRoute" element={<ServiceCategoryPage />} />
                          <Route path="/restaurants" element={<RestaurantsPage />} />
                          <Route path="/supermarkets" element={<SupermarketsPage />} />
                          <Route path="/taxis" element={<TaxiDriversPage />} />
                          <Route path="/guides" element={<TourGuidesPage />} />
                          <Route path="/excursions" element={<ExcursionsPage />} />
                          <Route path="/buses" element={<BusesPage />} />
                          <Route path="/events" element={<EventsPage />} />
                          
                          <Route path="/404" element={<NotFoundPage />} />
                          <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                      </main>
                      <Footer />
                      <ScrollToTop />
                      <CookieConsent />
                    </div>
                  </AdvertisingProvider>
                } />
                
                {/* Rutas admin SIN Header, Footer ni AdvertisingProvider - Completamente separadas */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={<AdminIndex />} />
              </Routes>
            </Router>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;