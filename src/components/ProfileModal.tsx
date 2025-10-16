import React from 'react';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative dark:bg-neutral-900">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mi Perfil</h2>
        <div className="mb-4">
          <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">Nombre Apellido</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">País: República Dominicana</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">Correo: usuario@email.com</div>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          <button className="w-full bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-xl font-semibold">Cambiar contraseña</button>
          <button className="w-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-4 py-2 rounded-xl font-semibold">Modo claro/oscuro</button>
          <button className="w-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-4 py-2 rounded-xl font-semibold">Descargar tour offline</button>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Logros y Ranking</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow p-2">
              <span className="text-2xl">🏅</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">Explorador Colonial</span>
              <span className="ml-auto text-green-600 dark:text-green-300 font-semibold">Completado</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-neutral-800 rounded-lg shadow p-2">
              <span className="text-2xl">🎯</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">Tour Express</span>
              <span className="ml-auto text-gray-400 font-semibold">Pendiente</span>
            </div>
          </div>
        </div>
        <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold mt-2">Cerrar sesión</button>
      </div>
    </div>
  );
};

export default ProfileModal; 