import { supabase } from "@/lib/supabaseClient";
import type { Venta, DetalleVenta } from "@/types/database";

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

// Crear venta completa (venta + detalles + actualizar stock)
export async function crearVenta(datos: DatosVenta): Promise<ResultadoVenta> {
  try {
    // Calcular total
    const total = datos.productos.reduce(
      (sum, item) => sum + (item.precio_unitario * item.cantidad), 
      0
    );

    // 1. Crear registro de venta
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert({
        id_cliente: datos.id_cliente || null,
        id_usuario: datos.id_usuario,
        fecha_venta: new Date().toISOString(),
        total: total,
        metodo_pago: datos.metodo_pago
      })
      .select()
      .single();

    if (errorVenta || !venta) {
      return { success: false, error: errorVenta?.message || 'Error al crear venta' };
    }

    // 2. Crear detalles de venta
    const detalles = datos.productos.map(producto => ({
      id_venta: venta.id_venta,
      id_producto: producto.id_producto,
      cantidad: producto.cantidad,
      precio_unitario: producto.precio_unitario,
      subtotal: producto.precio_unitario * producto.cantidad
    }));

    const { error: errorDetalles } = await supabase
      .from('detalle_venta')
      .insert(detalles);

    if (errorDetalles) {
      // Si falla, intentar eliminar la venta creada
      await supabase.from('ventas').delete().eq('id_venta', venta.id_venta);
      return { success: false, error: 'Error al registrar productos de la venta' };
    }

    // 3. Actualizar stock de productos
    for (const producto of datos.productos) {
      const { data: productoActual } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto', producto.id_producto)
        .single();

      if (productoActual) {
        const nuevoStock = productoActual.stock - producto.cantidad;
        
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id_producto', producto.id_producto);
      }
    }

    return { success: true, data: venta };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al procesar venta' };
  }
}

// Obtener todas las ventas
export async function getVentas() {
  try {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes (nombre, dni),
        usuario:profiles (nombre, apellido)
      `)
      .order('fecha_venta', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener venta por ID con detalles
export async function getVentaById(idVenta: number) {
  try {
    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes (nombre, dni),
        usuario:profiles (nombre, apellido)
      `)
      .eq('id_venta', idVenta)
      .single();

    if (errorVenta || !venta) {
      return { success: false, error: errorVenta?.message || 'Venta no encontrada' };
    }

    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_venta')
      .select(`
        *,
        producto:productos (nombre, precio_venta)
      `)
      .eq('id_venta', idVenta);

    if (errorDetalles) {
      return { success: false, error: errorDetalles.message };
    }

    return { success: true, data: { ...venta, detalles } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Buscar ventas por cliente o fecha
export async function buscarVentas(termino: string) {
  try {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes (nombre, dni),
        usuario:profiles (nombre, apellido)
      `)
      .or(`clientes.nombre.ilike.%${termino}%,clientes.dni.ilike.%${termino}%`)
      .order('fecha_venta', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener ventas del día
export async function getVentasDelDia() {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioDelDia = hoy.toISOString();

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', inicioDelDia)
      .order('fecha_venta', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const totalVentas = data?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
    const cantidadVentas = data?.length || 0;

    return { 
      success: true, 
      data: {
        ventas: data || [],
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
    // 1. Obtener detalles de la venta para restaurar stock
    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_venta')
      .select('id_producto, cantidad')
      .eq('id_venta', idVenta);

    if (errorDetalles) {
      return { success: false, error: 'Error al obtener detalles de la venta' };
    }

    // 2. Restaurar stock de productos
    if (detalles && detalles.length > 0) {
      for (const detalle of detalles) {
        const { data: productoActual } = await supabase
          .from('productos')
          .select('stock')
          .eq('id_producto', detalle.id_producto)
          .single();

        if (productoActual) {
          const nuevoStock = productoActual.stock + detalle.cantidad;
          
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id_producto', detalle.id_producto);
        }
      }
    }

    // 3. Eliminar detalles de venta
    const { error: errorEliminarDetalles } = await supabase
      .from('detalle_venta')
      .delete()
      .eq('id_venta', idVenta);

    if (errorEliminarDetalles) {
      return { success: false, error: 'Error al eliminar detalles de la venta' };
    }

    // 4. Eliminar venta
    const { error: errorEliminarVenta } = await supabase
      .from('ventas')
      .delete()
      .eq('id_venta', idVenta);

    if (errorEliminarVenta) {
      return { success: false, error: 'Error al eliminar la venta' };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al eliminar venta' };
  }
}
