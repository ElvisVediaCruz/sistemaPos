import { useState } from 'react';
import Modal from '../common/Modal';
import type { MetodoPago, CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (metodo_pago: MetodoPago) => Promise<void>;
  items: CartItem[];
  total: number;
}

const METODOS: { value: MetodoPago; label: string; icon: string }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
];

const CheckoutModal = ({ isOpen, onClose, onConfirmar, items, total }: Props) => {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmar = async () => {
    setError('');
    setLoading(true);
    try {
      await onConfirmar(metodo);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Venta" size="md">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
          {items.map((item) => (
            <div key={item.id_producto} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.nombre} × {item.cantidad}
              </span>
              <span className="font-medium">{formatCurrency(item.precio * item.cantidad)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span className="text-primary-600">{formatCurrency(total)}</span>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMetodo(m.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  metodo === m.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-2xl mb-1">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
