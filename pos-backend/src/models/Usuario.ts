import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type UserTipo = 'admin' | 'vendedor' | 'supervisor';

interface UsuarioAttributes {
  id_usuario: number;
  user_name: string;
  password: string;
  tipo: UserTipo;
}

interface UsuarioCreation extends Optional<UsuarioAttributes, 'id_usuario'> {}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreation>
  implements UsuarioAttributes {
  declare id_usuario: number;
  declare user_name: string;
  declare password: string;
  declare tipo: UserTipo;
}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('admin', 'vendedor', 'supervisor'),
      allowNull: false,
    },
  },
  { sequelize, tableName: 'usuario', timestamps: false }
);
