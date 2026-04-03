import { Op } from 'sequelize';
import { Producto } from '../models/Producto';
import { Categoria } from '../models/Categoria';

interface ProductoFiltros {
  search?: string;
  categoria_id?: number;
  page?: number;
  limit?: number;
}

interface ProductoInput {
  nombre: string;
  precio: number;
  stock?: number;
  categoria_ids?: number[];
}

export const getAll = async ({ search, categoria_id, page = 1, limit = 20 }: ProductoFiltros) => {
  const where: Record<string, unknown> = {};
  if (search) where.nombre = { [Op.like]: `%${search}%` };

  const offset = (page - 1) * limit;

  const { count, rows } = await Producto.findAndCountAll({
    where,
    include: [
      {
        model: Categoria,
        as: 'categorias',
        through: { attributes: [] },
        ...(categoria_id && { where: { id_categoria: categoria_id } }),
      },
    ],
    order: [['nombre', 'ASC']],
    limit,
    offset,
    distinct: true,
  });

  return { data: rows, total: count, page, limit };
};

export const getById = async (id: number) => {
  const producto = await Producto.findByPk(id, {
    include: [{ model: Categoria, as: 'categorias', through: { attributes: [] } }],
  });
  if (!producto) throw Object.assign(new Error('Producto no encontrado'), { status: 404 });
  return producto;
};

export const create = async ({ nombre, precio, stock = 0, categoria_ids = [] }: ProductoInput) => {
  const producto = await Producto.create({ nombre, precio, stock });
  if (categoria_ids.length > 0) {
    const categorias = await Categoria.findAll({ where: { id_categoria: categoria_ids } });
    await (producto as any).setCategorias(categorias);
  }
  return getById(producto.id_producto);
};

export const update = async (id: number, data: Partial<ProductoInput>) => {
  const producto = await getById(id);
  const { categoria_ids, ...fields } = data;

  const [, categorias] = await Promise.all([
    producto.update(fields),
    categoria_ids !== undefined
      ? Categoria.findAll({ where: { id_categoria: categoria_ids } })
      : Promise.resolve(null),
  ]);

  if (categorias !== null) {
    await (producto as any).setCategorias(categorias);
  }

  return getById(id);
};

export const remove = async (id: number) => {
  const producto = await getById(id);
  await producto.destroy();
};
