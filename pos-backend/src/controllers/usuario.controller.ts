import { Request, Response, NextFunction } from 'express';
import * as usuarioService from '../services/usuario.service';

const handleError = (err: any, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await usuarioService.getAll());
  } catch (err) { handleError(err, res, next); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(await usuarioService.getById(Number(req.params.id)));
  } catch (err) { handleError(err, res, next); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user_name, password, tipo, nombre } = req.body;
    if (!user_name || !password || !tipo) {
      res.status(400).json({ message: 'user_name, password y tipo son requeridos' });
      return;
    }
    const data = await usuarioService.create({ user_name, password, tipo, nombre });
    res.status(201).json(data);
  } catch (err) { handleError(err, res, next); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await usuarioService.update(Number(req.params.id), req.body);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await usuarioService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { handleError(err, res, next); }
};
