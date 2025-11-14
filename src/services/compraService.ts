import { supabase } from "@/lib/supabaseClient";
import type { Compra, DetalleCompra } from "@/types/database";

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

// Crear compra completa (compra + detalles + actualizar stock)
export async function crearCompra(datos: DatosCompra): Promise<ResultadoCompra> {
  try {
    // Calcular total
    const total = datos.productos.reduce(
      (sum, item) => sum + (item.precio_compra * item.cantidad), 
      0
    );

    // 1. Crear registro de compra
    const { data: compra, error: errorCompra } = await supabase
      .from('compras')
      .insert({
        id_proveedor: datos.id_proveedor || null,
        id_usuario: datos.id_usuario,
        fecha_compra: new Date().toISOString(),
        total: total
      })
      .select()
      .single();

    if (errorCompra || !compra) {
      return { success: false, error: errorCompra?.message || 'Error al crear compra' };
    }

    // 2. Crear detalles de compra
    const detalles = datos.productos.map(producto => ({
      id_compra: compra.id_compra,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio_compra: producto.precio_compra,
      subtotal: producto.precio_compra * producto.cantidad
    }));

    const { error: errorDetalles } = await supabase
      .from('detalle_compra')
      .insert(detalles);

    if (errorDetalles) {
      // Si falla, intentar eliminar la compra creada
      await supabase.from('compras').delete().eq('id_compra', compra.id_compra);
      return { success: false, error: 'Error al registrar productos de la compra' };
    }

    // 3. Actualizar stock de productos (INCREMENTAR)
    for (const producto of datos.productos) {
      const { data: productoActual } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto', producto.id_producto)
        .single();

      if (productoActual) {
        const nuevoStock = productoActual.stock + producto.cantidad;
        
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id_producto', producto.id_producto);
      }
    }

    return { success: true, data: compra };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar compra' };
  }
}

// Obtener todas las compras
export async function getCompras() {
  try {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        proveedor:proveedores (nombre, ruc),
        usuario:profiles (nombre, apellido)
      `)
      .order('fecha_compra', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener compra por ID con detalles
export async function getCompraById(idCompra: number) {
  try {
    const { data: compra, error: errorCompra } = await supabase
      .from('compras')
      .select(`
        *,
        proveedor:proveedores (nombre, ruc),
        usuario:profiles (nombre, apellido)
      `)
      .eq('id_compra', idCompra)
      .single();

    if (errorCompra || !compra) {
      return { success: false, error: errorCompra?.message || 'Compra no encontrada' };
    }

    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_compra')
      .select(`
        *,
        producto:productos (nombre, precio_compra)
      `)
      .eq('id_compra', idCompra);

    if (errorDetalles) {
      return { success: false, error: errorDetalles.message };
    }

    return { success: true, data: { ...compra, detalles } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Eliminar compra (restaurar stock y eliminar registros)
export async function eliminarCompra(idCompra: number) {
  try {
    // 1. Obtener detalles de la compra para restaurar stock
    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_compra')
      .select('id_producto, cantidad')
      .eq('id_compra', idCompra);

    if (errorDetalles) {
      return { success: false, error: 'Error al obtener detalles de la compra' };
    }

    // 2. Restaurar stock de productos (REDUCIR porque se elimina la compra)
    if (detalles && detalles.length > 0) {
      for (const detalle of detalles) {
        const { data: productoActual } = await supabase
          .from('productos')
          .select('stock')
          .eq('id_producto', detalle.id_producto)
          .single();

        if (productoActual) {
          const nuevoStock = productoActual.stock - detalle.cantidad;
          
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id_producto', detalle.id_producto);
        }
      }
    }

    // 3. Eliminar detalles de compra
    const { error: errorEliminarDetalles } = await supabase
      .from('detalle_compra')
      .delete()
      .eq('id_compra', idCompra);

    if (errorEliminarDetalles) {
      return { success: false, error: 'Error al eliminar detalles de la compra' };
    }

    // 4. Eliminar compra
    const { error: errorEliminarCompra } = await supabase
      .from('compras')
      .delete()
      .eq('id_compra', idCompra);

    if (errorEliminarCompra) {
      return { success: false, error: 'Error al eliminar la compra' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar compra' };
  }
}
