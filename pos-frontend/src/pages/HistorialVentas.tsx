import { useState, useEffect } from 'react';
import type { Venta } from '../types';
import { getVentas, getMisVentas, getVenta } from '../api/venta.api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import Modal from '../components/common/Modal';
import socket from '../socket';

const METODO_LABEL = { efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', transferencia: '🏦 Transferencia' };

const HistorialVentas = () => {
  const { user } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<Venta | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        fecha_inicio: fechaInicio || undefined,
        fecha_fin: fechaFin || undefined,
        limit: 50,
      };
      const res = user?.tipo === 'vendedor'
        ? await getMisVentas(params)
        : await getVentas(params);
      setVentas(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    socket.on('nueva_venta', fetchData);
    return () => { socket.off('nueva_venta', fetchData); };
  }, [fechaInicio, fechaFin]);

  const handleVerDetalle = async (id: number) => {
    setDetalleLoading(true);
    try {
      const data = await getVenta(id);
      setDetalle(data);
    } finally {
      setDetalleLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {user?.tipo === 'vendedor' ? 'Mis Ventas' : 'Historial de Ventas'}
      </h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchData}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700"
          >
            Filtrar
          </button>
        </div>
        {(fechaInicio || fechaFin) && (
          <div className="flex items-end">
            <button
              onClick={() => { setFechaInicio(''); setFechaFin(''); setTimeout(fetchData, 100); }}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : ventas.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No hay ventas registradas</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Factura</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                {user?.tipo !== 'vendedor' && (
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                )}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Método</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id_venta} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-primary-600">
                    {v.factura?.nro_factura || `#${v.id_venta}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(v.fecha)}</td>
                  {user?.tipo !== 'vendedor' && (
                    <td className="px-4 py-3 text-gray-600">{v.vendedor?.nombre || '—'}</td>
                  )}
                  <td className="px-4 py-3 text-gray-600">{METODO_LABEL[v.metodo_pago]}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(Number(v.factura?.total || 0))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleVerDetalle(v.id_venta)}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={!!detalle || detalleLoading}
        onClose={() => setDetalle(null)}
        title={`Factura ${detalle?.factura?.nro_factura || ''}`}
        size="md"
      >
        {detalleLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : detalle ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Fecha:</span>{' '}
                <span className="font-medium">{formatDate(detalle.fecha)}</span>
              </div>
              <div>
                <span className="text-gray-500">Vendedor:</span>{' '}
                <span className="font-medium">{detalle.vendedor?.nombre || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500">Método de pago:</span>{' '}
                <span className="font-medium">{METODO_LABEL[detalle.metodo_pago]}</span>
              </div>
              <div>
                <span className="text-gray-500">Nº Factura:</span>{' '}
                <span className="font-mono font-bold text-primary-600">{detalle.factura?.nro_factura}</span>
              </div>
            </div>

            <table className="w-full text-sm border-t pt-2">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left py-2">Producto</th>
                  <th className="text-center py-2">Cant.</th>
                  <th className="text-right py-2">Precio</th>
                  <th className="text-right py-2">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.detalles?.map((d) => (
                  <tr key={d.id_detalle} className="border-t">
                    <td className="py-2">{d.producto?.nombre || `#${d.id_producto}`}</td>
                    <td className="py-2 text-center">{d.cantidad}</td>
                    <td className="py-2 text-right">{formatCurrency(Number(d.precio_historico))}</td>
                    <td className="py-2 text-right font-medium">
                      {formatCurrency(Number(d.precio_historico) * d.cantidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(Number(detalle.factura?.total || 0))}</span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default HistorialVentas;
