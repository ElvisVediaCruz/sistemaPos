import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface ProductoCategoriaAttributes {
  id_producto: number;
  id_categoria: number;
}

export class ProductoCategoria extends Model<ProductoCategoriaAttributes>
  implements ProductoCategoriaAttributes {
  declare id_producto: number;
  declare id_categoria: number;
}

ProductoCategoria.init(
  {
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  { sequelize, tableName: 'producto_categoria', timestamps: false }
);
