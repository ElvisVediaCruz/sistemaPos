import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getVentasPorDia, getVentasPorMes, getStockBajo } from '../api/reporte.api';
import type { Producto } from '../types';
import { formatCurrency, formatDateOnly, MESES } from '../utils/formatters';
import Badge from '../components/common/Badge';

const Reportes = () => {
  const [tab, setTab] = useState<'dia' | 'mes' | 'stock'>('dia');
  const [ventasDia, setVentasDia] = useState<any[]>([]);
  const [ventasMes, setVentasMes] = useState<any[]>([]);
  const [stockBajo, setStockBajo] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const fetchDia = async () => {
    setLoading(true);
    try {
      const data = await getVentasPorDia(fechaInicio, fechaFin);
      setVentasDia(
        data.map((d: any) => ({
          fecha: formatDateOnly(d.fecha),
          ventas: Number(d.total_ventas),
          monto: Number(d.monto_total || 0),
        }))
      );
    } finally { setLoading(false); }
  };

  const fetchMes = async () => {
    setLoading(true);
    try {
      const data = await getVentasPorMes(anio);
      setVentasMes(
        data.map((d: any) => ({
          mes: MESES[(Number(d.mes) - 1)],
          ventas: Number(d.total_ventas),
          monto: Number(d.monto_total || 0),
        }))
      );
    } finally { setLoading(false); }
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      setStockBajo(await getStockBajo(5));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'dia') fetchDia();
    else if (tab === 'mes') fetchMes();
    else fetchStock();
  }, [tab]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {[
          { key: 'dia', label: 'Ventas por Día' },
          { key: 'mes', label: 'Ventas por Mes' },
          { key: 'stock', label: 'Stock Bajo' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dia' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex gap-3 mb-5 flex-wrap">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchDia} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
                Buscar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : ventasDia.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No hay datos para el período</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, name: string) =>
                  name === 'monto' ? [formatCurrency(v), 'Monto'] : [v, 'Ventas']} />
                <Bar dataKey="ventas" fill="#3b82f6" name="Ventas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {tab === 'mes' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex gap-3 mb-5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Año</label>
              <input type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))}
                min={2020} max={2030}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
            </div>
            <div className="flex items-end">
              <button onClick={fetchMes} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
                Buscar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : ventasMes.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No hay datos para el año {anio}</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, name: string) =>
                  name === 'monto' ? [formatCurrency(v), 'Monto'] : [v, 'Ventas']} />
                <Bar dataKey="ventas" fill="#2563eb" name="Ventas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {tab === 'stock' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : stockBajo.length === 0 ? (
            <p className="text-center text-green-600 py-12 font-medium">
              ✅ Todos los productos tienen stock suficiente
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo.map((p) => (
                  <tr key={p.id_producto} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(p.precio))}</td>
                    <td className="px-4 py-3"><Badge stock={p.stock} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Reportes;
