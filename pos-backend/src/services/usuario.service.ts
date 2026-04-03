import bcrypt from 'bcryptjs';
import { Usuario, UserTipo } from '../models/Usuario';
import { Vendedor } from '../models/Vendedor';

interface UsuarioInput {
  user_name: string;
  password: string;
  tipo: UserTipo;
  nombre?: string;
}

const safeUser = (u: Usuario) => ({
  id_usuario: u.id_usuario,
  user_name: u.user_name,
  tipo: u.tipo,
});

export const getAll = async () => {
  const usuarios = await Usuario.findAll({
    include: [{ model: Vendedor, as: 'vendedor' }],
  });
  return usuarios.map((u) => ({ ...safeUser(u), vendedor: (u as any).vendedor ?? null }));
};

export const getById = async (id: number) => {
  const usuario = await Usuario.findByPk(id, {
    include: [{ model: Vendedor, as: 'vendedor' }],
  });
  if (!usuario) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return { ...safeUser(usuario), vendedor: (usuario as any).vendedor ?? null };
};

export const create = async ({ user_name, password, tipo, nombre }: UsuarioInput) => {
  const hashed = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ user_name, password: hashed, tipo });

  if (tipo === 'vendedor') {
    if (!nombre) throw Object.assign(new Error('El nombre del vendedor es requerido'), { status: 400 });
    await Vendedor.create({ nombre, id_usuario: usuario.id_usuario });
  }

  return getById(usuario.id_usuario);
};

export const update = async (id: number, data: Partial<UsuarioInput>) => {
  const usuario = await Usuario.findByPk(id, {
    include: [{ model: Vendedor, as: 'vendedor' }],
  });
  if (!usuario) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

  const updateData: Partial<{ user_name: string; password: string; tipo: UserTipo }> = {};
  if (data.user_name) updateData.user_name = data.user_name;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
  if (data.tipo) updateData.tipo = data.tipo;

  await usuario.update(updateData);

  if (data.nombre) {
    const vendedor = (usuario as any).vendedor as Vendedor | null;
    if (vendedor) {
      await vendedor.update({ nombre: data.nombre });
    } else if (usuario.tipo === 'vendedor') {
      await Vendedor.create({ nombre: data.nombre, id_usuario: id });
    }
  }

  return getById(id);
};

export const remove = async (id: number) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  await usuario.destroy();
};
