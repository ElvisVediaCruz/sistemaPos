import api from './axios';
import type { Usuario, UserTipo } from '../types';

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data } = await api.get('/usuarios');
  return data;
};

export const createUsuario = async (payload: { user_name: string; password: string; tipo: UserTipo; nombre?: string }): Promise<Usuario> => {
  const { data } = await api.post('/usuarios', payload);
  return data;
};

export const updateUsuario = async (id: number, payload: Partial<{ user_name: string; password: string; tipo: UserTipo; nombre: string }>): Promise<Usuario> => {
  const { data } = await api.put(`/usuarios/${id}`, payload);
  return data;
};

export const deleteUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};
