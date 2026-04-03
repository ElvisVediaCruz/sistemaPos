import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface FacturaAttributes {
  id_factura: number;
  id_venta: number;
  nro_factura: string;
  total: number;
}

interface FacturaCreation extends Optional<FacturaAttributes, 'id_factura'> {}

export class Factura extends Model<FacturaAttributes, FacturaCreation>
  implements FacturaAttributes {
  declare id_factura: number;
  declare id_venta: number;
  declare nro_factura: string;
  declare total: number;
}

Factura.init(
  {
    id_factura: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    nro_factura: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'factura', timestamps: false }
);
