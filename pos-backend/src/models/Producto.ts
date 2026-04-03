import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ProductoAttributes {
  id_producto: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface ProductoCreation extends Optional<ProductoAttributes, 'id_producto' | 'stock'> {}

export class Producto extends Model<ProductoAttributes, ProductoCreation>
  implements ProductoAttributes {
  declare id_producto: number;
  declare nombre: string;
  declare precio: number;
  declare stock: number;
}

Producto.init(
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  { sequelize, tableName: 'producto', timestamps: false }
);
