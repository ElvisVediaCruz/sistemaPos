import { Router } from 'express';
import * as reporteController from '../controllers/reporte.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireRole('admin', 'supervisor'));

router.get('/ventas-por-dia', reporteController.ventasPorDia);
router.get('/ventas-por-mes', reporteController.ventasPorMes);
router.get('/stock-bajo', reporteController.stockBajo);

export default router;
