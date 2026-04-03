import { Request, Response, NextFunction } from 'express';
import * as productoService from '../services/producto.service';

const handleError = (err: any, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, categoria_id, page, limit } = req.query;
    const result = await productoService.getAll({
      search: search as string,
      categoria_id: categoria_id ? Number(categoria_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err) { handleError(err, res, next); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await productoService.getById(Number(req.params.id));
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nombre, precio, stock, categoria_ids } = req.body;
    if (!nombre || precio === undefined) {
      res.status(400).json({ message: 'nombre y precio son requeridos' });
      return;
    }
    const data = await productoService.create({ nombre, precio, stock, categoria_ids });
    res.status(201).json(data);
  } catch (err) { handleError(err, res, next); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await productoService.update(Number(req.params.id), req.body);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await productoService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (err) { handleError(err, res, next); }
};
