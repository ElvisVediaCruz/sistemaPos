import { Router } from 'express';
import authRoutes from './auth.routes';
import categoriaRoutes from './categoria.routes';
import productoRoutes from './producto.routes';
import usuarioRoutes from './usuario.routes';
import ventaRoutes from './venta.routes';
import reporteRoutes from './reporte.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/ventas', ventaRoutes);
router.use('/reportes', reporteRoutes);

export default router;
