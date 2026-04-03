import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-600 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

interface Props {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-600">POS Sistema</h1>
            <p className="text-xs text-gray-500 mt-1 capitalize">{user.tipo}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {user.tipo === 'vendedor' && (
            <NavLink to="/pos" className={linkClass} onClick={onClose}>
              🛒 Punto de Venta
            </NavLink>
          )}

          {(user.tipo === 'admin' || user.tipo === 'supervisor') && (
            <NavLink to="/historial" className={linkClass} onClick={onClose}>
              📋 Historial de Ventas
            </NavLink>
          )}

          {user.tipo === 'vendedor' && (
            <NavLink to="/historial" className={linkClass} onClick={onClose}>
              📋 Mis Ventas
            </NavLink>
          )}

          {user.tipo === 'admin' && (
            <>
              <NavLink to="/productos" className={linkClass} onClick={onClose}>
                📦 Productos
              </NavLink>
              <NavLink to="/categorias" className={linkClass} onClick={onClose}>
                🏷️ Categorías
              </NavLink>
              <NavLink to="/usuarios" className={linkClass} onClick={onClose}>
                👥 Usuarios
              </NavLink>
            </>
          )}

          {(user.tipo === 'admin' || user.tipo === 'supervisor') && (
            <NavLink to="/reportes" className={linkClass} onClick={onClose}>
              📊 Reportes
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate">{user.user_name}</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
