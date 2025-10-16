import React from 'react';

const ProfileUpgrade: React.FC = () => {
  // Aquí puedes integrar el flujo de upgrade real
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow text-center">
      <h2 className="text-xl font-bold mb-4">Upgrade de Plan</h2>
      <p className="mb-4">¿Quieres acceder a más beneficios? Cambia tu plan fácilmente.</p>
      <button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300">Mejorar Plan</button>
    </div>
  );
};

export default ProfileUpgrade;
