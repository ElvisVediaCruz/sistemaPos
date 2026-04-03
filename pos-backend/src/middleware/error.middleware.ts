import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  res.status(500).json({
    message: err.message || 'Error interno del servidor',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};
