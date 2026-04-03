import { Request, Response, NextFunction } from 'express';
import * as categoriaService from '../services/categoria.service';

const handleError = (err: any, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await categoriaService.getAll();
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre } = req.body;
    if (!nombre) { res.status(400).json({ message: 'nombre es requerido' }); return; }
    const data = await categoriaService.create(nombre);
    res.status(201).json(data);
  } catch (err) { handleError(err, res, next); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre } = req.body;
    if (!nombre) { res.status(400).json({ message: 'nombre es requerido' }); return; }
    const data = await categoriaService.update(Number(req.params.id), nombre);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await categoriaService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { handleError(err, res, next); }
};
