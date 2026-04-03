import api from './axios';
import type { Categoria } from '../types';

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get('/categorias');
  return data;
};

export const createCategoria = async (nombre: string): Promise<Categoria> => {
  const { data } = await api.post('/categorias', { nombre });
  return data;
};

export const updateCategoria = async (id: number, nombre: string): Promise<Categoria> => {
  const { data } = await api.put(`/categorias/${id}`, { nombre });
  return data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};
