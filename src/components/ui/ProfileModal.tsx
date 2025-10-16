import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName?: string;
    name?: string;
    email: string;
    country?: string;
  };
  onLogout: () => void;
  onEdit: () => void;
  onChangePassword: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout, onEdit, onChangePassword }) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} tabIndex={-1} className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 relative flex flex-col items-center border border-gray-100 animate-fade-in" aria-modal="true" role="dialog">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={onClose} aria-label={t('close')}>×</button>
        <h2 className="text-xl font-bold mb-4">{t('profile.title')}</h2>
        <div className="w-full space-y-3">
          <div><b>{t('profile.name')}:</b> {user?.fullName || user?.name || '-'}</div>
          <div><b>{t('profile.email')}:</b> {user?.email || '-'}</div>
          <div><b>{t('profile.country')}:</b> {user?.country || '-'}</div>
          <div>
            <b>{t('profile.password')}:</b> ••••••••
            <button className="ml-2 text-blue-600 underline text-xs" onClick={onChangePassword}>{t('profile.change_password')}</button>
          </div>
        </div>
        <div className="flex gap-3 mt-6 w-full">
          <button className="flex-1 bg-gray-200 rounded px-4 py-2" onClick={onEdit}>{t('profile.edit_data')}</button>
          <button className="flex-1 bg-red-600 text-white rounded px-4 py-2" onClick={onLogout}>{t('profile.logout')}</button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease; }
      `}</style>
    </div>
  );
};

export default ProfileModal; 