import api from './axios';
import type { Producto, PaginatedResponse } from '../types';

interface ProductoFiltros {
  search?: string;
  categoria_id?: number;
  page?: number;
  limit?: number;
}

export const getProductos = async (filtros: ProductoFiltros = {}): Promise<PaginatedResponse<Producto>> => {
  const { data } = await api.get('/productos', { params: filtros });
  return data;
};

export const getProducto = async (id: number): Promise<Producto> => {
  const { data } = await api.get(`/productos/${id}`);
  return data;
};

export const createProducto = async (payload: { nombre: string; precio: number; stock: number; categoria_ids: number[] }): Promise<Producto> => {
  const { data } = await api.post('/productos', payload);
  return data;
};

export const updateProducto = async (id: number, payload: Partial<{ nombre: string; precio: number; stock: number; categoria_ids: number[] }>): Promise<Producto> => {
  const { data } = await api.put(`/productos/${id}`, payload);
  return data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`);
};
