import { useState } from 'react';
import type { CartItem, Producto } from '../types';

export const useCarrito = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const agregarItem = (producto: Producto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id_producto === producto.id_producto);
      if (existing) {
        if (existing.cantidad >= producto.stock) return prev;
        return prev.map((i) =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      if (producto.stock === 0) return prev;
      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: 1,
          stock: producto.stock,
        },
      ];
    });
  };

  const quitarItem = (id_producto: number) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id_producto));
  };

  const cambiarCantidad = (id_producto: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) {
      quitarItem(id_producto);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id_producto !== id_producto) return i;
        const cantidad = Math.min(nuevaCantidad, i.stock);
        return { ...i, cantidad };
      })
    );
  };

  const limpiarCarrito = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);

  return { items, agregarItem, quitarItem, cambiarCantidad, limpiarCarrito, total, totalItems };
};
