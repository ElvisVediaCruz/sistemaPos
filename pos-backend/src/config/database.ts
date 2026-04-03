import { Sequelize } from 'sequelize';
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from './env';

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
