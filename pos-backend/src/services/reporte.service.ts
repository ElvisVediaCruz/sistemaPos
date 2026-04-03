import { fn, col, Op, QueryTypes } from 'sequelize';
import { sequelize } from '../models';
import { Producto } from '../models/Producto';

export const ventasPorDia = async (fecha_inicio?: string, fecha_fin?: string) => {
  const conditions: string[] = [];
  const replacements: Record<string, string> = {};

  if (fecha_inicio) {
    conditions.push('v.fecha >= :fecha_inicio');
    replacements.fecha_inicio = fecha_inicio;
  }
  if (fecha_fin) {
    conditions.push('v.fecha <= :fecha_fin');
    replacements.fecha_fin = fecha_fin;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await sequelize.query(
    `SELECT DATE(v.fecha) AS fecha,
            COUNT(v.id_venta) AS total_ventas,
            COALESCE(SUM(f.total), 0) AS monto_total
     FROM venta v
     LEFT JOIN factura f ON f.id_venta = v.id_venta
     ${where}
     GROUP BY DATE(v.fecha)
     ORDER BY DATE(v.fecha) ASC`,
    { replacements, type: QueryTypes.SELECT }
  );

  return result;
};

export const ventasPorMes = async (anio?: number) => {
  const year = anio || new Date().getFullYear();

  const result = await sequelize.query(
    `SELECT MONTH(v.fecha) AS mes,
            COUNT(v.id_venta) AS total_ventas,
            COALESCE(SUM(f.total), 0) AS monto_total
     FROM venta v
     LEFT JOIN factura f ON f.id_venta = v.id_venta
     WHERE YEAR(v.fecha) = :year
     GROUP BY MONTH(v.fecha)
     ORDER BY MONTH(v.fecha) ASC`,
    { replacements: { year }, type: QueryTypes.SELECT }
  );

  return result;
};

export const stockBajo = async (umbral = 5) => {
  return Producto.findAll({
    where: { stock: { [Op.lte]: umbral } },
    order: [['stock', 'ASC']],
  });
};
