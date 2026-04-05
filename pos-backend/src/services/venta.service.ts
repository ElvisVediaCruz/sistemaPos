import { Op, Transaction } from 'sequelize';
import { sequelize, Venta, DetalleVenta, Factura, Producto, Vendedor } from '../models';
import { MetodoPago } from '../models/Venta';
import { getIO } from '../socket';
import { imprimirRecibo, ItemRecibo } from './print.service';

interface ItemVenta {
  id_producto: number;
  cantidad: number;
}

export const crearVenta = async (
  id_vendedor: number,
  metodo_pago: MetodoPago,
  items: ItemVenta[]
) => {
  if (!items || items.length === 0) {
    throw Object.assign(new Error('La venta debe tener al menos un producto'), { status: 400 });
  }

  return sequelize.transaction(async (t: Transaction) => {
    // 1. Validar stock y bloquear filas en paralelo
    const productosEncontrados = await Promise.all(
      items.map((item) =>
        Producto.findByPk(item.id_producto, { transaction: t, lock: t.LOCK.UPDATE })
      )
    );

    const productoMap: Record<number, Producto> = {};
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const producto = productosEncontrados[i];

      if (!producto) {
        throw Object.assign(
          new Error(`Producto con id ${item.id_producto} no existe`),
          { status: 404 }
        );
      }
      if (producto.stock < item.cantidad) {
        throw Object.assign(
          new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`),
          { status: 400 }
        );
      }
      productoMap[item.id_producto] = producto;
    }

    // 2. Crear venta
    const venta = await Venta.create(
      { id_vendedor, metodo_pago, fecha: new Date() },
      { transaction: t }
    );

    // 3. Crear detalles y descontar stock
    let total = 0;
    for (const item of items) {
      const producto = productoMap[item.id_producto];
      const precio = Number(producto.precio);

      await DetalleVenta.create(
        {
          id_venta: venta.id_venta,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_historico: precio,
        },
        { transaction: t }
      );

      await Producto.decrement('stock', {
        by: item.cantidad,
        where: { id_producto: item.id_producto },
        transaction: t,
      });

      total += precio * item.cantidad;
    }

    // 4. Generar número de factura correlativo
    const lastFactura = await Factura.findOne({
      order: [['id_factura', 'DESC']],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    let nextNum = 1;
    if (lastFactura) {
      const parts = lastFactura.nro_factura.split('-');
      nextNum = parseInt(parts[1] || '0', 10) + 1;
    }
    const nro_factura = `FAC-${String(nextNum).padStart(4, '0')}`;

    // 5. Crear factura
    const factura = await Factura.create(
      { id_venta: venta.id_venta, nro_factura, total: Math.round(total * 100) / 100 },
      { transaction: t }
    );

    // Capturar items con nombre para el recibo (datos ya en memoria)
    const itemsConNombre: ItemRecibo[] = items.map((item) => ({
      nombre: productoMap[item.id_producto].nombre,
      cantidad: item.cantidad,
      precio_historico: Number(productoMap[item.id_producto].precio),
    }));

    return { venta, factura, itemsConNombre };
  }).then((result) => {
    getIO().emit('nueva_venta', {
      id_venta: result.venta.id_venta,
      nro_factura: result.factura.nro_factura,
      total: result.factura.total,
      metodo_pago: result.venta.metodo_pago,
      fecha: result.venta.fecha,
    });
    getIO().emit('stock_actualizado');

    // Imprimir recibo de forma asíncrona — un fallo no afecta la venta
    imprimirRecibo({
      nro_factura: result.factura.nro_factura,
      fecha: result.venta.fecha,
      metodo_pago: result.venta.metodo_pago,
      items: result.itemsConNombre,
      total: Number(result.factura.total),
    }).catch((err) => console.error('[PrintService] Error al imprimir recibo:', err));

    return { venta: result.venta, factura: result.factura };
  });
};

export const getAll = async (filters: {
  fecha_inicio?: string;
  fecha_fin?: string;
  vendedor_id?: number;
  page?: number;
  limit?: number;
}) => {
  const { fecha_inicio, fecha_fin, vendedor_id, page = 1, limit = 20 } = filters;
  const where: Record<string, unknown> = {};

  if (fecha_inicio || fecha_fin) {
    where.fecha = {};
    if (fecha_inicio) (where.fecha as Record<string, unknown>)[Op.gte as unknown as string] = new Date(fecha_inicio!);
    if (fecha_fin) (where.fecha as Record<string, unknown>)[Op.lte as unknown as string] = new Date(fecha_fin!);
  }
  if (vendedor_id) where.id_vendedor = vendedor_id;

  const { count, rows } = await Venta.findAndCountAll({
    where,
    include: [
      { model: Vendedor, as: 'vendedor' },
      { model: Factura, as: 'factura' },
    ],
    order: [['fecha', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return { data: rows, total: count, page, limit };
};

export const getMisVentas = async (id_vendedor: number, filters: {
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}) => {
  return getAll({ ...filters, vendedor_id: id_vendedor });
};

export const getById = async (id: number, id_vendedor?: number) => {
  const venta = await Venta.findByPk(id, {
    include: [
      { model: Vendedor, as: 'vendedor' },
      {
        model: DetalleVenta,
        as: 'detalles',
        include: [{ model: Producto, as: 'producto' }],
      },
      { model: Factura, as: 'factura' },
    ],
  });

  if (!venta) throw Object.assign(new Error('Venta no encontrada'), { status: 404 });

  // Si es vendedor, verificar ownership
  if (id_vendedor !== undefined && venta.id_vendedor !== id_vendedor) {
    throw Object.assign(new Error('Acceso denegado'), { status: 403 });
  }

  return venta;
};
