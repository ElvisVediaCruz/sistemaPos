import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DetalleVentaAttributes {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_historico: number;
}

interface DetalleVentaCreation extends Optional<DetalleVentaAttributes, 'id_detalle'> {}

export class DetalleVenta extends Model<DetalleVentaAttributes, DetalleVentaCreation>
  implements DetalleVentaAttributes {
  declare id_detalle: number;
  declare id_venta: number;
  declare id_producto: number;
  declare cantidad: number;
  declare precio_historico: number;
}

DetalleVenta.init(
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio_historico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'detalle_venta', timestamps: false }
);
