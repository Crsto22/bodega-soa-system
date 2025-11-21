// REFACTORIZADO: Ahora usa Repository Pattern
import { ventaRepository } from "@/repositories/ventaRepository";
import { detalleVentaRepository } from "@/repositories/detalleVentaRepository";
import { productRepository } from "@/repositories/productRepository";
import type { Venta } from "@/types/database";

interface ResultadoVenta {
  success: boolean;
  data?: Venta;
  error?: string;
}

interface ProductoVenta {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

interface DatosVenta {
  id_cliente: number | null;
  id_usuario: string;
  metodo_pago: 'EFECTIVO' | 'YAPE' | 'IZIPAY' | 'TRANSFERENCIA';
  productos: ProductoVenta[];
}

/**
 * Servicio de Ventas
 * Responsabilidad: SOLO lógica de negocio (validaciones, cálculos, orquestación)
 * Delega el acceso a datos a los Repositories
 */

// Crear venta completa (venta + detalles + actualizar stock)
export async function crearVenta(datos: DatosVenta): Promise<ResultadoVenta> {
  try {
    // LÓGICA DE NEGOCIO: Validar que haya productos
    if (datos.productos.length === 0) {
      return { success: false, error: 'El carrito está vacío' };
    }

    // LÓGICA DE NEGOCIO: Verificar stock antes de procesar
    for (const item of datos.productos) {
      const producto = await productRepository.findById(item.id_producto);

      if (!producto) {
        return { success: false, error: `Producto ${item.id_producto} no encontrado` };
      }

      if (producto.stock < item.cantidad) {
        return { success: false, error: `Stock insuficiente para ${producto.nombre}` };
      }
    }

    // LÓGICA DE NEGOCIO: Calcular total
    const total = datos.productos.reduce(
      (sum, item) => sum + (item.precio_unitario * item.cantidad),
      0
    );

    // USA REPOSITORY: Crear registro de venta
    const venta = await ventaRepository.create({
      id_cliente: datos.id_cliente || null,
      id_usuario: datos.id_usuario,
      fecha_venta: new Date().toISOString(),
      total: total,
      metodo_pago: datos.metodo_pago
    });

    // LÓGICA DE NEGOCIO: Preparar detalles
    const detalles = datos.productos.map(producto => ({
      id_venta: venta.id_venta,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio_unitario,
      subtotal: producto.precio_unitario * producto.cantidad
    }));

    try {
      // USA REPOSITORY: Crear detalles de venta
      await detalleVentaRepository.createMany(detalles);

      // USA REPOSITORY: Actualizar stock de productos
      for (const producto of datos.productos) {
        await productRepository.decrementarStock(producto.id_producto, producto.cantidad);
      }

      return { success: true, data: venta };
    } catch (error: any) {
      // Si falla, revertir venta creada
      await ventaRepository.delete(venta.id_venta);
      return { success: false, error: 'Error al registrar productos de la venta' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar venta' };
  }
}

// Obtener todas las ventas
export async function getVentas() {
  try {
    // USA REPOSITORY: Delega al repository
    const ventas = await ventaRepository.findAll();
    return { success: true, data: ventas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener venta por ID con detalles
export async function getVentaById(idVenta: number) {
  try {
    // USA REPOSITORY: Obtener venta
    const venta = await ventaRepository.findById(idVenta);

    if (!venta) {
      return { success: false, error: 'Venta no encontrada' };
    }

    // USA REPOSITORY: Obtener detalles
    const detalles = await detalleVentaRepository.findByVenta(idVenta);

    return { success: true, data: { ...venta, detalles } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Buscar ventas por cliente o fecha
export async function buscarVentas(termino: string) {
  try {
    // USA REPOSITORY: Delega búsqueda
    const ventas = await ventaRepository.search(termino);
    return { success: true, data: ventas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener ventas del día
export async function getVentasDelDia() {
  try {
    // USA REPOSITORY: Obtener ventas del día
    const ventas = await ventaRepository.findToday();

    // LÓGICA DE NEGOCIO: Calcular totales
    const totalVentas = ventas.reduce((sum: number, venta: any) => sum + (venta.total || 0), 0);
    const cantidadVentas = ventas.length;

    return {
      success: true,
      data: {
        ventas,
        totalVentas,
        cantidadVentas
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Eliminar venta (restaurar stock y eliminar registros)
export async function eliminarVenta(idVenta: number) {
  try {
    // USA REPOSITORY: Obtener detalles para revertir stock
    const detalles = await detalleVentaRepository.findByVenta(idVenta);

    // LÓGICA DE NEGOCIO + REPOSITORY: Restaurar stock de productos
    for (const detalle of detalles) {
      await productRepository.incrementarStock(detalle.id_producto, detalle.cantidad);
    }

    // USA REPOSITORY: Eliminar detalles
    await detalleVentaRepository.deleteByVenta(idVenta);

    // USA REPOSITORY: Eliminar venta
    await ventaRepository.delete(idVenta);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar venta' };
  }
}
