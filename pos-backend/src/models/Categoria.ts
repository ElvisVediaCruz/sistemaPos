import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CategoriaAttributes {
  id_categoria: number;
  nombre: string;
}

interface CategoriaCreation extends Optional<CategoriaAttributes, 'id_categoria'> {}

export class Categoria extends Model<CategoriaAttributes, CategoriaCreation>
  implements CategoriaAttributes {
  declare id_categoria: number;
  declare nombre: string;
}

Categoria.init(
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
  },
  { sequelize, tableName: 'categoria', timestamps: false }
);
