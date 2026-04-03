import api from './axios';
import type { Producto } from '../types';

export const getVentasPorDia = async (fecha_inicio?: string, fecha_fin?: string) => {
  const { data } = await api.get('/reportes/ventas-por-dia', { params: { fecha_inicio, fecha_fin } });
  return data;
};

export const getVentasPorMes = async (anio?: number) => {
  const { data } = await api.get('/reportes/ventas-por-mes', { params: { anio } });
  return data;
};

export const getStockBajo = async (umbral = 5): Promise<Producto[]> => {
  const { data } = await api.get('/reportes/stock-bajo', { params: { umbral } });
  return data;
};
