import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { Usuario } from '../models/Usuario';
import { Vendedor } from '../models/Vendedor';

export const login = async (user_name: string, password: string) => {
  const usuario = await Usuario.findOne({ where: { user_name } });
  if (!usuario) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  const valid = await bcrypt.compare(password, usuario.password);
  if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

  let id_vendedor: number | undefined;
  if (usuario.tipo === 'vendedor') {
    const vendedor = await Vendedor.findOne({ where: { id_usuario: usuario.id_usuario } });
    if (vendedor) id_vendedor = vendedor.id_vendedor;
  }

  const payload = {
    id_usuario: usuario.id_usuario,
    user_name: usuario.user_name,
    tipo: usuario.tipo,
    ...(id_vendedor !== undefined && { id_vendedor }),
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    user: {
      id_usuario: usuario.id_usuario,
      user_name: usuario.user_name,
      tipo: usuario.tipo,
      ...(id_vendedor !== undefined && { id_vendedor }),
    },
  };
};
