import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ProfileDetails: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  // If token is stored elsewhere, retrieve it accordingly, e.g. from localStorage:
  const token = localStorage.getItem('jwt');
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName || '', email: (user as any).email || '' });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('http://127.0.0.1:5000/api/user/profile', { full_name: form.fullName, email: form.email }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg(t('profile_details_updated'));
    } catch {
      setMsg(t('profile_details_update_error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{t('personal_data')}</h2>
      <label className="block mb-2">{t('full_name')}</label>
      <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" />
      <label className="block mb-2">{t('email')}</label>
      <input name="email" value={form.email} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" />
      <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">{t('save_changes')}</button>
      {msg && <div className="mt-2 text-green-600">{msg}</div>}
    </form>
  );
};

export default ProfileDetails;
