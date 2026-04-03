import type { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  item: CartItem;
  onCambiarCantidad: (id: number, cantidad: number) => void;
  onQuitar: (id: number) => void;
}

const CarritoItem = ({ item, onCambiarCantidad, onQuitar }: Props) => {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
        <p className="text-xs text-gray-500">{formatCurrency(item.precio)} c/u</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onCambiarCantidad(item.id_producto, item.cantidad - 1)}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-sm font-bold flex items-center justify-center"
        >
          −
        </button>
        <span className="w-7 text-center text-sm font-semibold">{item.cantidad}</span>
        <button
          onClick={() => onCambiarCantidad(item.id_producto, item.cantidad + 1)}
          disabled={item.cantidad >= item.stock}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-sm font-bold flex items-center justify-center disabled:opacity-40"
        >
          +
        </button>
      </div>

      <span className="text-sm font-semibold text-gray-700 w-20 text-right">
        {formatCurrency(item.precio * item.cantidad)}
      </span>

      <button
        onClick={() => onQuitar(item.id_producto)}
        className="text-red-400 hover:text-red-600 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default CarritoItem;
