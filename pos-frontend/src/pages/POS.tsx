import { useState } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import ProductGrid from '../components/pos/ProductGrid';
import CarritoPanel from '../components/pos/CarritoPanel';
import { crearVenta } from '../api/venta.api';
import type { MetodoPago, Factura } from '../types';
import { formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';

const POS = () => {
  const { items, agregarItem, quitarItem, cambiarCantidad, limpiarCarrito, total } = useCarrito();
  const [facturaConfirmada, setFacturaConfirmada] = useState<Factura | null>(null);

  const handleConfirmar = async (metodo_pago: MetodoPago) => {
    const ventaItems = items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad }));
    const result = await crearVenta(metodo_pago, ventaItems);
    limpiarCarrito();
    setFacturaConfirmada(result.factura);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-8rem)]">
      <div className="flex-1 min-w-0 min-h-[60vh] lg:min-h-0">
        <ProductGrid onAgregar={agregarItem} />
      </div>

      <div className="w-full lg:w-80 flex-shrink-0">
        <CarritoPanel
          items={items}
          total={total}
          onCambiarCantidad={cambiarCantidad}
          onQuitar={quitarItem}
          onLimpiar={limpiarCarrito}
          onConfirmar={handleConfirmar}
        />
      </div>

      <Modal
        isOpen={!!facturaConfirmada}
        onClose={() => setFacturaConfirmada(null)}
        title="¡Venta Realizada!"
        size="sm"
      >
        {facturaConfirmada && (
          <div className="text-center space-y-4">
            <div className="text-5xl">✅</div>
            <div>
              <p className="text-gray-500 text-sm">Número de Factura</p>
              <p className="text-2xl font-bold text-primary-600">{facturaConfirmada.nro_factura}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total cobrado</p>
              <p className="text-xl font-bold">{formatCurrency(Number(facturaConfirmada.total))}</p>
            </div>
            <button
              onClick={() => setFacturaConfirmada(null)}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700"
            >
              Nueva Venta
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default POS;
