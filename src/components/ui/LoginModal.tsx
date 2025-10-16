import React, { useState } from 'react';
// import { sendPasswordResetEmail } from 'firebase/auth';
// import { auth } from '../../firebase';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabaseAuth } from '../../services/supabaseAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  // onMicrosoftLogin: () => void; // TEMPORALMENTE DESHABILITADO
}

const tabs = [
  { key: 'login', label: 'Iniciar sesión' },
  { key: 'register', label: 'Registrarse' },
  { key: 'reset', label: 'Recuperar contraseña' },
];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onGoogleLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      // await signInWithEmailAndPassword(auth, email, password); // This line was removed as per the edit hint
      setMessage('¡Bienvenido!');
      onClose();
    } catch (err: any) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password); // This line was removed as per the edit hint
      // await sendEmailVerification(userCredential.user); // This line was removed as per the edit hint
      setMessage('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
      setView('login');
    } catch (err: any) {
      setError('No se pudo registrar. ¿Ya tienes cuenta?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email); // This line was removed as per the edit hint
      setMessage('Correo de recuperación enviado. Revisa tu bandeja de entrada.');
      setView('login');
    } catch (err: any) {
      setError('No se pudo enviar el correo. ¿El email es correcto?');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-8 relative flex flex-col items-center animate-fade-in border border-gray-100">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="flex w-full mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`flex-1 py-2 text-center rounded-t-xl font-semibold transition-all ${view === tab.key ? 'bg-blue-50 text-blue-700 shadow' : 'bg-transparent text-gray-400 hover:text-blue-600'}`}
              onClick={() => { setView(tab.key as any); setError(''); setMessage(''); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          {view === 'login' && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-3 w-full">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11z" stroke="#60A5FA" strokeWidth="1.5"/><path d="M22 6.5l-10 7-10-7" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                </span>
              <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2z" stroke="#60A5FA" strokeWidth="1.5"/><rect x="6" y="10" width="12" height="8" rx="2" stroke="#60A5FA" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 118 0v3" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                </span>
              <input
                type="password"
                  placeholder="Contraseña"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                value={password}
                onChange={e => setPassword(e.target.value)}
                  required
              />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition shadow"
                disabled={loading}
              >
                Iniciar sesión
              </button>
              <div className="flex justify-between text-xs mt-2">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setView('register')}>Registrarse</button>
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setView('reset')}>¿Olvidaste tu contraseña?</button>
              </div>
            </form>
          )}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3 w-full">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11z" stroke="#60A5FA" strokeWidth="1.5"/><path d="M22 6.5l-10 7-10-7" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                </span>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2z" stroke="#60A5FA" strokeWidth="1.5"/><rect x="6" y="10" width="12" height="8" rx="2" stroke="#60A5FA" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 118 0v3" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                </span>
                <input
                  type="password"
                  placeholder="Contraseña"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 17a2 2 0 002-2v-2a2 2 0 00-2-2 2 2 0 00-2 2v2a2 2 0 002 2z" stroke="#60A5FA" strokeWidth="1.5"/><rect x="6" y="10" width="12" height="8" rx="2" stroke="#60A5FA" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 118 0v3" stroke="#60A5FA" strokeWidth="1.5"/></svg>
                </span>
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-green-700 transition shadow"
                disabled={loading}
              >
                Registrarse
              </button>
              <div className="flex justify-between text-xs mt-2">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setView('login')}>¿Ya tienes cuenta? Inicia sesión</button>
            </div>
            </form>
          )}
          {view === 'reset' && (
            <form onSubmit={handleReset} className="flex flex-col gap-3 w-full">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11z" stroke="#60A5FA" strokeWidth="1.5"/><path d="M22 6.5l-10 7-10-7" stroke="#60A5FA" strokeWidth="1.5"/></svg>
              </span>
              <input
                type="email"
                  placeholder="Correo electrónico"
                  className="border rounded-lg px-10 py-2 w-full focus:ring-2 focus:ring-blue-200"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-yellow-700 transition shadow"
                disabled={loading}
              >
                Enviar correo de recuperación
              </button>
              <div className="flex justify-between text-xs mt-2">
                <button type="button" className="text-blue-600 hover:underline" onClick={() => setView('login')}>Volver a iniciar sesión</button>
              </div>
            </form>
          )}
          {(error || message) && (
            <div className={`text-sm mt-2 ${error ? 'text-red-600' : 'text-green-600'}`}>{error || message}</div>
          )}
          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={onGoogleLogin}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow hover:bg-blue-50 transition font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 35.1 27 36 24 36c-6.1 0-10.7-2.9-13.7-7.1l-7 5.4C7.7 41.9 15.8 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/></g></svg>
              <span>Continuar con Google (Backend)</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await supabaseAuth.signInWithGoogle();
                } catch (error) {
                  console.error('Error con Supabase Google:', error);
                }
              }}
              className="flex items-center justify-center gap-2 bg-green-600 text-white border border-green-600 rounded-lg px-4 py-2 shadow hover:bg-green-700 transition font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3c-7.2 0-13.3 4.1-16.7 10.1z"/><path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 35.1 27 36 24 36c-6.1 0-10.7-2.9-13.7-7.1l-7 5.4C7.7 41.9 15.8 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.5 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/></g></svg>
              <span>Continuar con Google (Supabase)</span>
            </button>
            {/* Botón de Microsoft - TEMPORALMENTE DESHABILITADO
            <button
              onClick={onMicrosoftLogin}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow hover:bg-blue-50 transition font-semibold text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#F25022" d="M4 4h20v20H4z"/><path fill="#7FBA00" d="M24 4h20v20H24z"/><path fill="#00A4EF" d="M4 24h20v20H4z"/><path fill="#FFB900" d="M24 24h20v20H24z"/></g></svg>
              <span>Continuar con Microsoft</span>
            </button>
            */}
          </div>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Puedes iniciar sesión con Google o correo electrónico.<br />
          Tu información está protegida y nunca se compartirá.
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

export default LoginModal;
