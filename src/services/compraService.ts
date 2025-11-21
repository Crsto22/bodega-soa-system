// REFACTORIZADO: Ahora usa Repository Pattern
import { compraRepository } from "@/repositories/compraRepository";
import { detalleCompraRepository } from "@/repositories/detalleCompraRepository";
import { productRepository } from "@/repositories/productRepository";
import type { Compra } from "@/types/database";

interface ResultadoCompra {
  success: boolean;
  data?: Compra;
  error?: string;
}

interface ProductoCompra {
  id_producto: number;
  cantidad: number;
  precio_compra: number;
}

interface DatosCompra {
  id_proveedor: number | null;
  id_usuario: string;
  productos: ProductoCompra[];
}

/**
 * Servicio de Compras
 * Responsabilidad: SOLO lógica de negocio (validaciones, cálculos, orquestación)
 * Delega el acceso a datos a los Repositories
 */

// Crear compra completa (compra + detalles + actualizar stock)
export async function crearCompra(datos: DatosCompra): Promise<ResultadoCompra> {
  try {
    // LÓGICA DE NEG OCIO: Validar que haya productos
    if (datos.productos.length === 0) {
      return { success: false, error: 'No hay productos en la compra' };
    }

    // LÓGICA DE NEGOCIO: Calcular total
    const total = datos.productos.reduce(
      (sum, item) => sum + (item.precio_compra * item.cantidad),
      0
    );

    // USA REPOSITORY: Crear registro de compra
    const compra = await compraRepository.create({
      id_proveedor: datos.id_proveedor || null,
      id_usuario: datos.id_usuario,
      fecha_compra: new Date().toISOString(),
      total: total
    });

    // LÓGICA DE NEGOCIO: Preparar detalles
    const detalles = datos.productos.map(producto => ({
      id_compra: compra.id_compra,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio_compra: producto.precio_compra,
      subtotal: producto.precio_compra * producto.cantidad
    }));

    try {
      // USA REPOSITORY: Crear detalles de compra
      await detalleCompraRepository.createMany(detalles);

      // USA REPOSITORY: Actualizar stock de productos (INCREMENTAR)
      for (const producto of datos.productos) {
        await productRepository.incrementarStock(producto.id_producto, producto.cantidad);
      }

      return { success: true, data: compra };
    } catch (error: any) {
      // Si falla, revertir compra creada
      await compraRepository.delete(compra.id_compra);
      return { success: false, error: 'Error al registrar productos de la compra' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar compra' };
  }
}

// Obtener todas las compras
export async function getCompras() {
  try {
    // USA REPOSITORY
    const compras = await compraRepository.findAll();
    return { success: true, data: compras };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener compra por ID con detalles
export async function getCompraById(idCompra: number) {
  try {
    // USA REPOSITORY: Obtener compra
    const compra = await compraRepository.findById(idCompra);

    if (!compra) {
      return { success: false, error: 'Compra no encontrada' };
    }

    // USA REPOSITORY: Obtener detalles
    const detalles = await detalleCompraRepository.findByCompra(idCompra);

    return { success: true, data: { ...compra, detalles } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Eliminar compra (reducir stock y eliminar registros)
export async function eliminarCompra(idCompra: number) {
  try {
    // USA REPOSITORY: Obtener detalles para revertir stock
    const detalles = await detalleCompraRepository.findByCompra(idCompra);

    // LÓGICA DE NEGOCIO + REPOSITORY: Reducir stock (porque eliminamos la compra)
    for (const detalle of detalles) {
      await productRepository.decrementarStock(detalle.id_producto, detalle.cantidad);
    }

    // USA REPOSITORY: Eliminar detalles
    await detalleCompraRepository.deleteByCompra(idCompra);

    // USA REPOSITORY: Eliminar compra
    await compraRepository.delete(idCompra);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar compra' };
  }
}
