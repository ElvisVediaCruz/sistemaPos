import type { Producto } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../common/Badge';

interface Props {
  producto: Producto;
  onAgregar: (producto: Producto) => void;
}

const ProductCard = ({ producto, onAgregar }: Props) => {
  const sinStock = producto.stock === 0;

  return (
    <button
      onClick={() => !sinStock && onAgregar(producto)}
      disabled={sinStock}
      className={`bg-white border rounded-xl p-4 text-left w-full transition-all ${
        sinStock
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md hover:border-primary-400 cursor-pointer'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="font-semibold text-gray-800 text-sm leading-snug">{producto.nombre}</p>
        <Badge stock={producto.stock} />
      </div>
      <p className="text-primary-600 font-bold mt-2">{formatCurrency(Number(producto.precio))}</p>
      {producto.categorias && producto.categorias.length > 0 && (
        <p className="text-xs text-gray-400 mt-1 truncate">
          {producto.categorias.map((c) => c.nombre).join(', ')}
        </p>
      )}
    </button>
  );
};

export default ProductCard;
