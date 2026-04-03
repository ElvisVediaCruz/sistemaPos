import { useState } from 'react';
import type { CartItem, MetodoPago } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import CarritoItem from './CarritoItem';
import CheckoutModal from './CheckoutModal';

interface Props {
  items: CartItem[];
  total: number;
  onCambiarCantidad: (id: number, cantidad: number) => void;
  onQuitar: (id: number) => void;
  onLimpiar: () => void;
  onConfirmar: (metodo_pago: MetodoPago) => Promise<void>;
}

const CarritoPanel = ({ items, total, onCambiarCantidad, onQuitar, onLimpiar, onConfirmar }: Props) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-800">Carrito</h2>
        {items.length > 0 && (
          <button onClick={onLimpiar} className="text-xs text-red-400 hover:text-red-600">
            Vaciar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <span className="text-4xl">🛒</span>
            <p className="text-sm">Agrega productos al carrito</p>
          </div>
        ) : (
          items.map((item) => (
            <CarritoItem
              key={item.id_producto}
              item={item}
              onCambiarCantidad={onCambiarCantidad}
              onQuitar={onQuitar}
            />
          ))
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between mb-3">
          <span className="font-semibold text-gray-700">Total</span>
          <span className="font-bold text-xl text-primary-600">{formatCurrency(total)}</span>
        </div>
        <button
          onClick={() => setCheckoutOpen(true)}
          disabled={items.length === 0}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cobrar
        </button>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirmar={onConfirmar}
        items={items}
        total={total}
      />
    </div>
  );
};

export default CarritoPanel;
