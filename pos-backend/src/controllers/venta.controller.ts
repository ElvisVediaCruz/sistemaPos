import { Request, Response, NextFunction } from 'express';
import * as ventaService from '../services/venta.service';

const handleError = (err: any, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { metodo_pago, items } = req.body;
    const id_vendedor = req.user!.id_vendedor;

    if (!id_vendedor) {
      res.status(400).json({ message: 'Usuario no tiene perfil de vendedor' });
      return;
    }
    if (!metodo_pago || !items) {
      res.status(400).json({ message: 'metodo_pago e items son requeridos' });
      return;
    }

    const result = await ventaService.crearVenta(id_vendedor, metodo_pago, items);
    res.status(201).json(result);
  } catch (err) { handleError(err, res, next); }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin, vendedor_id, page, limit } = req.query;
    const result = await ventaService.getAll({
      fecha_inicio: fecha_inicio as string,
      fecha_fin: fecha_fin as string,
      vendedor_id: vendedor_id ? Number(vendedor_id) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err) { handleError(err, res, next); }
};

export const getMisVentas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id_vendedor = req.user!.id_vendedor!;
    const { fecha_inicio, fecha_fin, page, limit } = req.query;
    const result = await ventaService.getMisVentas(id_vendedor, {
      fecha_inicio: fecha_inicio as string,
      fecha_fin: fecha_fin as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    res.json(result);
  } catch (err) { handleError(err, res, next); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    const id_vendedor = user.tipo === 'vendedor' ? user.id_vendedor : undefined;
    const result = await ventaService.getById(Number(req.params.id), id_vendedor);
    res.json(result);
  } catch (err) { handleError(err, res, next); }
};
