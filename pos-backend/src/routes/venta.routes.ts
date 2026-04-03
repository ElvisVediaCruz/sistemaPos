import { Router } from 'express';
import * as ventaController from '../controllers/venta.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/', authenticate, requireRole('vendedor'), ventaController.create);
router.get('/mis-ventas', authenticate, requireRole('vendedor'), ventaController.getMisVentas);
router.get('/', authenticate, requireRole('admin', 'supervisor'), ventaController.getAll);
router.get('/:id', authenticate, ventaController.getById);

export default router;
