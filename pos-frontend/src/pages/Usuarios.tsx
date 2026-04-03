import { useState, useEffect } from 'react';
import type { Usuario, UserTipo } from '../types';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/usuario.api';
import Modal from '../components/common/Modal';

interface UsuarioForm {
  user_name: string;
  password: string;
  tipo: UserTipo;
  nombre: string;
}

const emptyForm: UsuarioForm = { user_name: '', password: '', tipo: 'vendedor', nombre: '' };

const TIPOS: UserTipo[] = ['admin', 'vendedor', 'supervisor'];

const rolLabel = (tipo: UserTipo) =>
  ({ admin: 'Admin', vendedor: 'Vendedor', supervisor: 'Supervisor' }[tipo]);

const rolColor = (tipo: UserTipo) =>
  ({
    admin: 'bg-purple-100 text-purple-700',
    vendedor: 'bg-blue-100 text-blue-700',
    supervisor: 'bg-green-100 text-green-700',
  }[tipo]);

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<UsuarioForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setUsuarios(await getUsuarios());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (u?: Usuario) => {
    setEditando(u || null);
    setForm(
      u
        ? { user_name: u.user_name, password: '', tipo: u.tipo, nombre: u.vendedor?.nombre || '' }
        : emptyForm
    );
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.user_name || (!editando && !form.password)) {
      setError('user_name y password son requeridos');
      return;
    }
    if (form.tipo === 'vendedor' && !form.nombre) {
      setError('El nombre es requerido para vendedores');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: any = { user_name: form.user_name, tipo: form.tipo };
      if (form.password) payload.password = form.password;
      if (form.nombre) payload.nombre = form.nombre;

      if (editando) {
        await updateUsuario(editando.id_usuario, payload);
      } else {
        await createUsuario({ ...payload, password: form.password });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await deleteUsuario(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {usuarios.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay usuarios</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre Vendedor</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.user_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rolColor(u.tipo)}`}>
                      {rolLabel(u.tipo)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.vendedor?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openModal(u)}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u.id_usuario)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar usuario' : 'Nuevo usuario'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
            <input
              type="text"
              value={form.user_name}
              onChange={(e) => setForm({ ...form, user_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {editando && '(dejar vacío para no cambiar)'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as UserTipo })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{rolLabel(t)}</option>
              ))}
            </select>
          </div>
          {form.tipo === 'vendedor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del vendedor *
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Usuarios;
