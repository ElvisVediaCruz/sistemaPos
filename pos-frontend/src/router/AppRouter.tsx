import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/layout/Layout';

import Login from '../pages/Login';
import POS from '../pages/POS';
import Productos from '../pages/Productos';
import Categorias from '../pages/Categorias';
import Usuarios from '../pages/Usuarios';
import HistorialVentas from '../pages/HistorialVentas';
import Reportes from '../pages/Reportes';
import Unauthorized from '../pages/Unauthorized';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.tipo === 'vendedor') return <Navigate to="/pos" replace />;
  if (user.tipo === 'admin') return <Navigate to="/productos" replace />;
  return <Navigate to="/historial" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          {/* Vendedor */}
          <Route element={<ProtectedRoute allowedRoles={['vendedor']} />}>
            <Route path="/pos" element={<POS />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/productos" element={<Productos />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/usuarios" element={<Usuarios />} />
          </Route>

          {/* Todos */}
          <Route path="/historial" element={<HistorialVentas />} />

          {/* Admin + Supervisor */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'supervisor']} />}>
            <Route path="/reportes" element={<Reportes />} />
          </Route>

          <Route index element={<RoleRedirect />} />
          <Route path="*" element={<RoleRedirect />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
