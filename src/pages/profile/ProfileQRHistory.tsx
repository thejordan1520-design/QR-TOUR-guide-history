import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ProfileQRHistory: React.FC = () => {
const { token } = useAuth();
  const [history, setHistory] = useState<Array<{place:string;datetime:string;lat:number;lon:number}>>([]);
  const { t } = useTranslation();

  useEffect(() => {
    axios.get<{place:string;datetime:string;lat:number;lon:number}[]>('/api/user/qr-history', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setHistory(res.data));
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{t('qr_history_title')}</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>{t('qr_history_place')}</th><th>{t('qr_history_datetime')}</th><th>{t('qr_history_map')}</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i} className="border-b">
              <td>{h.place}</td>
              <td>{h.datetime}</td>
              <td>
                <a href={`https://maps.google.com/?q=${h.lat},${h.lon}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{t('qr_history_view_map')}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileQRHistory;
