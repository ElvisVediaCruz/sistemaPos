import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password) {
      res.status(400).json({ message: 'user_name y password son requeridos' });
      return;
    }
    const result = await authService.login(user_name, password);
    res.json(result);
  } catch (err: any) {
    if (err.status) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    next(err);
  }
};
