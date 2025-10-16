import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminAuthGuard from '../../components/AdminAuthGuard';

// Importar todas las páginas admin
import AdminDashboard from './Dashboard';
import AdminUsers from './Users';
import AdminPlaces from './Places';
import AdminExcursions from './Excursions';
import AdminRestaurants from './Restaurants';
import AdminSupermarkets from './Supermarkets';
import AdminServices from './Services';
import AdminQRCodes from './QRCodes';
import AdminReservations from './Reservations';
import AdminFeedback from './Feedback';
import AdminNotifications from './Notifications';
import AdminAdvertising from './Advertising';
import AdminPlans from './Plans';
import AdminPayments from './Payments';
import AdminGamification from './Gamification';
import AdminLogsConfig from './LogsConfig';
import AdminDatabase from './Database';
import AdminAccounting from './Accounting';
import AdminTranslations from './Translations';
import AdminLogs from './AdminLogs';
import AdminSettings from './Settings';
import AdminAppearance from './Appearance';

const AdminIndex: React.FC = () => {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/places" element={<AdminPlaces />} />
          <Route path="/excursions" element={<AdminExcursions />} />
          <Route path="/restaurants" element={<AdminRestaurants />} />
          <Route path="/supermarkets" element={<AdminSupermarkets />} />
          <Route path="/services" element={<AdminServices />} />
          <Route path="/qr-codes" element={<AdminQRCodes />} />
          <Route path="/reservations" element={<AdminReservations />} />
          <Route path="/feedback" element={<AdminFeedback />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="/advertising" element={<AdminAdvertising />} />
          <Route path="/plans" element={<AdminPlans />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/gamification" element={<AdminGamification />} />
          <Route path="/logs-config" element={<AdminLogsConfig />} />
          <Route path="/database" element={<AdminDatabase />} />
          <Route path="/accounting" element={<AdminAccounting />} />
          <Route path="/translations" element={<AdminTranslations />} />
          <Route path="/admin-logs" element={<AdminLogs />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/appearance" element={<AdminAppearance />} />
        </Routes>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default AdminIndex;