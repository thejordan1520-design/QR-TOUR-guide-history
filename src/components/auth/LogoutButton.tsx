import { useAuth } from '../../contexts/AuthContext';

const LogoutButton = () => {
  const { signOut } = useAuth();
  return (
    <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded">
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
