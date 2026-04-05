import * as productoService from '../services/producto.service';
import * as categoriaService from '../services/categoria.service';
import * as reporteService from '../services/reporte.service';
import { Factura, Venta, DetalleVenta, Producto, Vendedor } from '../models';
import { WHATSAPP_LOW_STOCK_UMBRAL } from '../config/env';

// ─── Dispatcher principal ─────────────────────────────────────────────────────

export const handleCommand = async (text: string): Promise<string> => {
  if (text === 'menu' || text === 'ayuda') return cmdAyuda();
  if (text === 'productos')               return cmdProductos();
  if (text === 'categorias')              return cmdCategorias();
  if (text === 'stock bajo')              return cmdStockBajo();
  if (text === 'ventas hoy')              return cmdVentasHoy();
  if (text === 'ventas mes')              return cmdVentasMes();
  if (text.startsWith('buscar '))         return cmdBuscar(text.slice(7).trim());
  if (text.startsWith('factura '))        return cmdFactura(text.slice(8).trim());

  return 'Comando no reconocido.\nEscribe *menu* o *ayuda* para ver los comandos disponibles.';
};

// ─── Handlers ────────────────────────────────────────────────────────────────

const cmdAyuda = (): string =>
  [
    '*--- Menu de Comandos ---*',
    '',
    '*productos* — Lista de productos (pag. 1)',
    '*buscar <nombre>* — Buscar producto por nombre',
    '*categorias* — Lista de categorias',
    '*stock bajo* — Productos con stock critico',
    '*ventas hoy* — Resumen de ventas del dia',
    '*ventas mes* — Resumen del mes actual',
    '*factura <numero>* — Detalle de factura (ej: FAC-0001)',
    '*ayuda* — Muestra este menu',
  ].join('\n');

const cmdProductos = async (): Promise<string> => {
  const result = await productoService.getAll({ page: 1, limit: 10 });
  if (result.data.length === 0) return 'No hay productos registrados.';

  const lines = result.data.map(
    p => `• *${p.nombre}* — $${Number(p.precio).toFixed(2)} (stock: ${p.stock})`
  );

  const footer = result.total > 10 ? '\n_Usa "buscar <nombre>" para filtrar._' : '';
  return [`*Productos* (${result.data.length} de ${result.total}):`, ...lines, footer]
    .join('\n')
    .trim();
};

const cmdBuscar = async (nombre: string): Promise<string> => {
  if (!nombre) return 'Indica el nombre a buscar. Ej: *buscar arroz*';

  const result = await productoService.getAll({ search: nombre, page: 1, limit: 10 });
  if (result.data.length === 0) return `No se encontraron productos con "${nombre}".`;

  const lines = result.data.map(
    p => `• *${p.nombre}* — $${Number(p.precio).toFixed(2)} (stock: ${p.stock})`
  );
  return [`*Resultados para "${nombre}":*`, ...lines].join('\n');
};

const cmdCategorias = async (): Promise<string> => {
  const cats = await categoriaService.getAll();
  if (cats.length === 0) return 'No hay categorias registradas.';

  const lines = cats.map(c => `• ${c.nombre}`);
  return [`*Categorias (${cats.length}):*`, ...lines].join('\n');
};

const cmdStockBajo = async (): Promise<string> => {
  const productos = await reporteService.stockBajo(WHATSAPP_LOW_STOCK_UMBRAL);

  if (productos.length === 0)
    return `Todo el stock esta por encima del umbral de ${WHATSAPP_LOW_STOCK_UMBRAL} unidades.`;

  const lines = productos.map(p => `⚠ *${p.nombre}* — ${p.stock} unidad(es)`);
  return [`*Stock Bajo (umbral: ${WHATSAPP_LOW_STOCK_UMBRAL}):*`, ...lines].join('\n');
};

const cmdVentasHoy = async (): Promise<string> => {
  const hoy = new Date().toISOString().split('T')[0];
  const rows = (await reporteService.ventasPorDia(hoy, hoy)) as Array<{
    fecha: string;
    total_ventas: string | number;
    monto_total: string | number;
  }>;

  if (rows.length === 0 || Number(rows[0].total_ventas) === 0)
    return `No hay ventas registradas hoy (${hoy}).`;

  const r = rows[0];
  return [
    `*Ventas de Hoy (${hoy}):*`,
    `Total transacciones: ${r.total_ventas}`,
    `Monto total: $${Number(r.monto_total).toFixed(2)}`,
  ].join('\n');
};

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const cmdVentasMes = async (): Promise<string> => {
  const anio = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;

  const rows = (await reporteService.ventasPorMes(anio)) as Array<{
    mes: string | number;
    total_ventas: string | number;
    monto_total: string | number;
  }>;

  const mesRow = rows.find(r => Number(r.mes) === mesActual);
  if (!mesRow) return `No hay ventas en ${MESES[mesActual - 1]} ${anio}.`;

  return [
    `*Ventas de ${MESES[mesActual - 1]} ${anio}:*`,
    `Total transacciones: ${mesRow.total_ventas}`,
    `Monto total: $${Number(mesRow.monto_total).toFixed(2)}`,
  ].join('\n');
};

const cmdFactura = async (nroRaw: string): Promise<string> => {
  let nro = nroRaw.toUpperCase();
  if (!nro.startsWith('FAC-')) {
    const num = parseInt(nro, 10);
    if (isNaN(num)) return 'Numero de factura invalido. Ej: *factura FAC-0001*';
    nro = `FAC-${String(num).padStart(4, '0')}`;
  }

  const factura = await Factura.findOne({
    where: { nro_factura: nro },
    include: [
      {
        model: Venta,
        as: 'venta',
        include: [
          { model: Vendedor, as: 'vendedor' },
          {
            model: DetalleVenta,
            as: 'detalles',
            include: [{ model: Producto, as: 'producto' }],
          },
        ],
      },
    ],
  });

  if (!factura) return `Factura *${nro}* no encontrada.`;

  const venta = (factura as any).venta;
  const fecha = new Date(venta.fecha).toLocaleDateString('es-MX');
  const detalles: string[] = venta.detalles.map(
    (d: any) =>
      `  • ${d.producto.nombre} x${d.cantidad} = $${(
        Number(d.precio_historico) * d.cantidad
      ).toFixed(2)}`
  );

  return [
    `*Factura ${nro}*`,
    `Fecha: ${fecha}`,
    `Vendedor: ${venta.vendedor?.nombre ?? 'N/D'}`,
    `Pago: ${venta.metodo_pago}`,
    '',
    '*Detalle:*',
    ...detalles,
    '',
    `*Total: $${Number(factura.total).toFixed(2)}*`,
  ].join('\n');
};
