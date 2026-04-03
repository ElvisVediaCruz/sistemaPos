import { Request, Response, NextFunction } from 'express';
import * as reporteService from '../services/reporte.service';

const handleError = (err: any, res: Response, next: NextFunction) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
};

export const ventasPorDia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const data = await reporteService.ventasPorDia(fecha_inicio as string, fecha_fin as string);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const ventasPorMes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { anio } = req.query;
    const data = await reporteService.ventasPorMes(anio ? Number(anio) : undefined);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};

export const stockBajo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { umbral } = req.query;
    const data = await reporteService.stockBajo(umbral ? Number(umbral) : 5);
    res.json(data);
  } catch (err) { handleError(err, res, next); }
};
