import { Router } from 'express';
import * as categoriaController from '../controllers/categoria.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/', authenticate, categoriaController.getAll);
router.post('/', authenticate, requireRole('admin'), categoriaController.create);
router.put('/:id', authenticate, requireRole('admin'), categoriaController.update);
router.delete('/:id', authenticate, requireRole('admin'), categoriaController.remove);

export default router;
