import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-gray-600 text-sm">
          Bienvenido, <strong>{user?.user_name}</strong>
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-red-500 hover:text-red-700 font-medium"
      >
        Cerrar sesión
      </button>
    </header>
  );
};

export default Navbar;
