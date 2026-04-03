import { useState, useEffect } from 'react';
import type { Producto, Categoria } from '../../types';
import { getProductos } from '../../api/producto.api';
import { getCategorias } from '../../api/categoria.api';
import ProductCard from './ProductCard';
import socket from '../../socket';

interface Props {
  onAgregar: (producto: Producto) => void;
}

const ProductGrid = ({ onAgregar }: Props) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await getProductos({ search, categoria_id: categoriaId, limit: 100 });
      setProductos(res.data);
    } catch {
      /* silenciar errores de carga */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    socket.on('stock_actualizado', fetchProductos);
    return () => { socket.off('stock_actualizado', fetchProductos); };
  }, [search, categoriaId]);

  useEffect(() => {
    const timer = setTimeout(fetchProductos, 300);
    return () => clearTimeout(timer);
  }, [search, categoriaId]);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        <button
          onClick={() => setCategoriaId(undefined)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            !categoriaId
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id_categoria}
            onClick={() => setCategoriaId(c.id_categoria)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              categoriaId === c.id_categoria
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : productos.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No se encontraron productos</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {productos.map((p) => (
              <ProductCard key={p.id_producto} producto={p} onAgregar={onAgregar} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
