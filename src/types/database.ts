// Tipos TypeScript para las tablas de la base de datos

export interface Profile {
  id: string; // UUID
  nombre: string;
  apellido?: string;
  telefono?: string;
  rol: 'ADMIN' | 'VENDEDOR';
  creado_en?: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  categoria?: string;
  marca?: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  unidad_medida?: string;
  fecha_registro?: string;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  dni?: string;
  telefono?: string;
  correo?: string;
  fecha_registro?: string;
}

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  ruc?: string;
  telefono?: string;
  correo?: string;
  fecha_registro?: string;
}

export interface Venta {
  id_venta: number;
  id_cliente?: number;
  id_usuario?: string; // UUID
  fecha_venta?: string;
  total?: number;
  metodo_pago?: 'EFECTIVO' | 'YAPE' | 'IZIPAY' | 'TRANSFERENCIA';
}

export interface DetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Compra {
  id_compra: number;
  id_proveedor?: number;
  id_usuario?: string; // UUID
  fecha_compra?: string;
  total?: number;
}

export interface DetalleCompra {
  id_detalle: number;
  id_compra: number;
  id_producto: number;
  cantidad: number;
  precio_compra: number;
  subtotal: number;
}

// Tipos extendidos para consultas con joins
export interface VentaConDetalles extends Venta {
  cliente?: Cliente;
  usuario?: Profile;
  detalles?: DetalleVenta[];
}

export interface CompraConDetalles extends Compra {
  proveedor?: Proveedor;
  usuario?: Profile;
  detalles?: DetalleCompra[];
}
