import api from './axios';
import type { AuthUser } from '../types';

export const loginRequest = async (user_name: string, password: string): Promise<{ token: string; user: AuthUser }> => {
  const { data } = await api.post('/auth/login', { user_name, password });
  return data;
};
