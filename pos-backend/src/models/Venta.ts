import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

interface VentaAttributes {
  id_venta: number;
  id_vendedor: number;
  fecha: Date;
  metodo_pago: MetodoPago;
}

interface VentaCreation extends Optional<VentaAttributes, 'id_venta' | 'fecha'> {}

export class Venta extends Model<VentaAttributes, VentaCreation>
  implements VentaAttributes {
  declare id_venta: number;
  declare id_vendedor: number;
  declare fecha: Date;
  declare metodo_pago: MetodoPago;
}

Venta.init(
  {
    id_venta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_vendedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    metodo_pago: {
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'venta', timestamps: false }
);
