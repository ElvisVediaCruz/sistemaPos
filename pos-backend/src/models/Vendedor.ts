import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface VendedorAttributes {
  id_vendedor: number;
  nombre: string;
  id_usuario: number;
}

interface VendedorCreation extends Optional<VendedorAttributes, 'id_vendedor'> {}

export class Vendedor extends Model<VendedorAttributes, VendedorCreation>
  implements VendedorAttributes {
  declare id_vendedor: number;
  declare nombre: string;
  declare id_usuario: number;
}

Vendedor.init(
  {
    id_vendedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, tableName: 'vendedor', timestamps: false }
);
