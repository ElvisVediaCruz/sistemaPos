import { useState, useEffect } from 'react';
import type { Categoria } from '../types';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/categoria.api';
import Modal from '../components/common/Modal';

const Categorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setCategorias(await getCategorias());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (cat?: Categoria) => {
    setEditando(cat || null);
    setNombre(cat?.nombre || '');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    try {
      if (editando) {
        await updateCategoria(editando.id_categoria, nombre.trim());
      } else {
        await createCategoria(nombre.trim());
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
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteCategoria(id);
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
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {categorias.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay categorías registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id_categoria} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{cat.id_categoria}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{cat.nombre}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openModal(cat)}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id_categoria)}
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
        title={editando ? 'Editar categoría' : 'Nueva categoría'}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nombre de la categoría"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
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

export default Categorias;
