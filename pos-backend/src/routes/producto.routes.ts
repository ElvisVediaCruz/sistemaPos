import { Router } from 'express';
import * as productoController from '../controllers/producto.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, productoController.getAll);
router.get('/:id', authenticate, productoController.getById);
router.post('/', authenticate, requireRole('admin'), productoController.create);
router.put('/:id', authenticate, requireRole('admin'), productoController.update);
router.delete('/:id', authenticate, requireRole('admin'), productoController.remove);

export default router;
