import { sequelize } from '../config/database';
import { Usuario } from './Usuario';
import { Vendedor } from './Vendedor';
import { Producto } from './Producto';
import { Categoria } from './Categoria';
import { ProductoCategoria } from './ProductoCategoria';
import { Venta } from './Venta';
import { DetalleVenta } from './DetalleVenta';
import { Factura } from './Factura';

// Usuario 1:1 Vendedor
Usuario.hasOne(Vendedor, { foreignKey: 'id_usuario', as: 'vendedor' });
Vendedor.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Vendedor 1:N Venta
Vendedor.hasMany(Venta, { foreignKey: 'id_vendedor', as: 'ventas' });
Venta.belongsTo(Vendedor, { foreignKey: 'id_vendedor', as: 'vendedor' });

// Producto N:N Categoria
Producto.belongsToMany(Categoria, {
  through: ProductoCategoria,
  foreignKey: 'id_producto',
  otherKey: 'id_categoria',
  as: 'categorias',
});
Categoria.belongsToMany(Producto, {
  through: ProductoCategoria,
  foreignKey: 'id_categoria',
  otherKey: 'id_producto',
  as: 'productos',
});

// Venta 1:N DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'id_venta', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'id_venta', as: 'venta' });

// DetalleVenta N:1 Producto
DetalleVenta.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });
Producto.hasMany(DetalleVenta, { foreignKey: 'id_producto', as: 'detalles' });

// Venta 1:1 Factura
Venta.hasOne(Factura, { foreignKey: 'id_venta', as: 'factura' });
Factura.belongsTo(Venta, { foreignKey: 'id_venta', as: 'venta' });

export {
  sequelize,
  Usuario,
  Vendedor,
  Producto,
  Categoria,
  ProductoCategoria,
  Venta,
  DetalleVenta,
  Factura,
};
