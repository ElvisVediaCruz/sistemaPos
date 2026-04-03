import api from './axios';
import type { Venta, MetodoPago, PaginatedResponse } from '../types';

interface ItemVenta {
  id_producto: number;
  cantidad: number;
}

export const crearVenta = async (metodo_pago: MetodoPago, items: ItemVenta[]) => {
  const { data } = await api.post('/ventas', { metodo_pago, items });
  return data;
};

export const getVentas = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  vendedor_id?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Venta>> => {
  const { data } = await api.get('/ventas', { params });
  return data;
};

export const getMisVentas = async (params?: {
  fecha_inicio?: string;
  fecha_fin?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Venta>> => {
  const { data } = await api.get('/ventas/mis-ventas', { params });
  return data;
};

export const getVenta = async (id: number): Promise<Venta> => {
  const { data } = await api.get(`/ventas/${id}`);
  return data;
};
