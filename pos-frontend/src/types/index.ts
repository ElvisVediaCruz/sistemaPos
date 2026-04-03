export type UserTipo = 'admin' | 'vendedor' | 'supervisor';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface AuthUser {
  id_usuario: number;
  user_name: string;
  tipo: UserTipo;
  id_vendedor?: number;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
  stock: number;
  categorias?: Categoria[];
}

export interface Vendedor {
  id_vendedor: number;
  nombre: string;
  id_usuario: number;
}

export interface Usuario {
  id_usuario: number;
  user_name: string;
  tipo: UserTipo;
  vendedor?: Vendedor | null;
}

export interface DetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_historico: number;
  producto?: Producto;
}

export interface Factura {
  id_factura: number;
  id_venta: number;
  nro_factura: string;
  total: number;
}

export interface Venta {
  id_venta: number;
  id_vendedor: number;
  fecha: string;
  metodo_pago: MetodoPago;
  vendedor?: Vendedor;
  detalles?: DetalleVenta[];
  factura?: Factura;
}

export interface CartItem {
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
