import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { sequelize } from './models';
import { PORT, NODE_ENV } from './config/env';
import router from './routes';
import { errorHandler } from './middleware/error.middleware';
import { initSocket } from './socket';
import { initWhatsApp } from './services/whatsapp.service';

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada correctamente.');

    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos.');
    }

    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

    initWhatsApp();
  } catch (error) {
    console.error('Error al iniciar:', error);
    process.exit(1);
  }
};

start();

export default app;
