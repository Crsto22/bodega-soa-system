// REFACTORIZADO: Ahora usa Repository Pattern
import { productRepository } from "@/repositories/productRepository";
import { Producto } from "@/types/database";


// Obtener todos los productos
export async function getProductos(): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    // USA REPOSITORY
    const productos = await productRepository.findAll();
    return { success: true, data: productos };
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener productos' };
  }
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    // USA REPOSITORY
    const producto = await productRepository.findById(id);

    if (!producto) {
      return { success: false, error: 'Producto no encontrado' };
    }

    return { success: true, data: producto };
  } catch (error: any) {
    console.error('Error obteniendo producto:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener producto' };
  }
}

// Crear un nuevo producto
export async function createProducto(producto: Omit<Producto, 'id_producto' | 'fecha_registro'>): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (!producto.nombre || producto.nombre.trim() === '') {
      return { success: false, error: 'El nombre del producto es obligatorio' };
    }

    if (producto.precio_venta <= 0) {
      return { success: false, error: 'El precio de venta debe ser mayor a 0' };
    }

    if (producto.stock < 0) {
      return { success: false, error: 'El stock no puede ser negativo' };
    }

    // USA REPOSITORY
    const nuevoProducto = await productRepository.create(producto);
    return { success: true, data: nuevoProducto };
  } catch (error: any) {
    console.error('Error creando producto:', error);
    return { success: false, error: error.message || 'Error inesperado al crear producto' };
  }
}

// Actualizar un producto
export async function updateProducto(id: number, producto: Partial<Omit<Producto, 'id_producto' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (producto.precio_venta !== undefined && producto.precio_venta <= 0) {
      return { success: false, error: 'El precio de venta debe ser mayor a 0' };
    }

    if (producto.stock !== undefined && producto.stock < 0) {
      return { success: false, error: 'El stock no puede ser negativo' };
    }

    // USA REPOSITORY
    const productoActualizado = await productRepository.update(id, producto);
    return { success: true, data: productoActualizado };
  } catch (error: any) {
    console.error('Error actualizando producto:', error);
    return { success: false, error: error.message || 'Error inesperado al actualizar producto' };
  }
}

// Eliminar un producto
export async function deleteProducto(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // USA REPOSITORY
    await productRepository.delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Error eliminando producto:', error);
    return { success: false, error: error.message || 'Error inesperado al eliminar producto' };
  }
}

// Buscar productos por término
export async function searchProductos(searchTerm: string): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    // USA REPOSITORY
    const productos = await productRepository.search(searchTerm);
    return { success: true, data: productos };
  } catch (error: any) {
    console.error('Error buscando productos:', error);
    return { success: false, error: error.message || 'Error inesperado al buscar productos' };
  }
}

// Obtener productos con stock bajo (menos de 10)
export async function getProductosStockBajo(): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    // USA REPOSITORY
    const productos = await productRepository.findLowStock();
    return { success: true, data: productos };
  } catch (error: any) {
    console.error('Error obteniendo productos con stock bajo:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener productos con stock bajo' };
  }
}
