import { Categoria } from '../models/Categoria';

export const getAll = async () => {
  return Categoria.findAll({ order: [['nombre', 'ASC']] });
};

export const getById = async (id: number) => {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) throw Object.assign(new Error('Categoría no encontrada'), { status: 404 });
  return categoria;
};

export const create = async (nombre: string) => {
  return Categoria.create({ nombre });
};

export const update = async (id: number, nombre: string) => {
  const categoria = await getById(id);
  await categoria.update({ nombre });
  return categoria;
};

export const remove = async (id: number) => {
  const categoria = await getById(id);
  await categoria.destroy();
};
