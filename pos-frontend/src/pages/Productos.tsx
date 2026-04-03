import { useState, useEffect } from 'react';
import type { Producto, Categoria } from '../types';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/producto.api';
import { getCategorias } from '../api/categoria.api';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import socket from '../socket';

interface ProductoForm {
  nombre: string;
  precio: string;
  stock: string;
  categoria_ids: number[];
}

const emptyForm: ProductoForm = { nombre: '', precio: '', stock: '0', categoria_ids: [] };

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cats] = await Promise.all([
        getProductos({ search, limit: 100 }),
        getCategorias(),
      ]);
      setProductos(pRes.data);
      setCategorias(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { getCategorias().then(setCategorias).catch(() => {}); }, []);

  useEffect(() => {
    socket.on('stock_actualizado', fetchData);
    return () => { socket.off('stock_actualizado', fetchData); };
  }, [search]);

  const openModal = (p?: Producto) => {
    setEditando(p || null);
    setForm(
      p
        ? {
            nombre: p.nombre,
            precio: String(p.precio),
            stock: String(p.stock),
            categoria_ids: p.categorias?.map((c) => c.id_categoria) || [],
          }
        : emptyForm
    );
    setError('');
    setModalOpen(true);
  };

  const toggleCategoria = (id: number) => {
    setForm((prev) => ({
      ...prev,
      categoria_ids: prev.categoria_ids.includes(id)
        ? prev.categoria_ids.filter((c) => c !== id)
        : [...prev.categoria_ids, id],
    }));
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precio) {
      setError('Nombre y precio son requeridos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
        categoria_ids: form.categoria_ids,
      };
      if (editando) {
        await updateProducto(editando.id_producto, payload);
      } else {
        await createProducto(payload);
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
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProducto(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : productos.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay productos</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categorías</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(p.precio))}</td>
                  <td className="px-4 py-3"><Badge stock={p.stock} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {p.categorias?.map((c) => c.nombre).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openModal(p)}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_producto)}
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
        title={editando ? 'Editar producto' : 'Nuevo producto'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {categorias.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
              <div className="flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <button
                    key={c.id_categoria}
                    type="button"
                    onClick={() => toggleCategoria(c.id_categoria)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                      form.categoria_ids.includes(c.id_categoria)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'border-gray-300 text-gray-600 hover:border-primary-400'
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
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

export default Productos;
