
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ProfilePassword: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({ old_password: '', new_password: '', repeat: '' });
  const [msg, setMsg] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.repeat) {
      setMsg(t('passwords_do_not_match'));
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: form.old_password, new_password: form.new_password })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(t('password_updated_successfully'));
      } else {
        setMsg(data.msg || t('error_updating_password'));
      }
    } catch {
      setMsg(t('network_error'));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setTempPassword('');
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg(t('temporary_password_generated'));
        setTempPassword(data.temp_password);
      } else {
        setResetMsg(data.msg || t('could_not_generate_temporary_password'));
      }
    } catch {
      setResetMsg(t('network_error'));
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{t('change_password')}</h2>
      {!showReset ? (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">{t('current_password')}</label>
          <input name="old_password" type="password" value={form.old_password} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" />
          <label className="block mb-2">{t('new_password')}</label>
          <input name="new_password" type="password" value={form.new_password} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" />
          <label className="block mb-2">{t('repeat_new_password')}</label>
          <input name="repeat" type="password" value={form.repeat} onChange={handleChange} className="w-full mb-4 px-4 py-2 border rounded" />
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">{t('update_password')}</button>
          {msg && <div className="mt-2 text-green-600">{msg}</div>}
          <div className="mt-4 text-sm">
            <button type="button" className="text-blue-600 underline" onClick={() => setShowReset(true)}>
              {t('forgot_password')}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <label className="block mb-2">{t('registration_email')}</label>
          <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full mb-4 px-4 py-2 border rounded" />
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">{t('request_temporary_password')}</button>
          {resetMsg && <div className="mt-2 text-green-600">{resetMsg}</div>}
          {tempPassword && (
            <div className="mt-2 text-gray-700">
              <strong>{t('temporary_password')}:</strong> {tempPassword}
              <div className="text-xs text-gray-500">{t('simulated_email_message')}</div>
            </div>
          )}
          <div className="mt-4 text-sm">
            <button type="button" className="text-blue-600 underline" onClick={() => setShowReset(false)}>
              {t('back_to_change_password')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePassword;
