import { Request, Response, NextFunction } from 'express';
import { UserTipo } from '../models/Usuario';

export const requireRole = (...roles: UserTipo[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.tipo)) {
      res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
      return;
    }
    next();
  };
};
