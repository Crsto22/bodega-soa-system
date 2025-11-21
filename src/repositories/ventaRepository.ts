import { supabase } from "@/lib/supabaseClient";
import type { Venta } from "@/types/database";

/**
 * Repository de Ventas
 * Responsabilidad: SOLO acceso a datos de ventas (queries)
 * NO contiene lógica de negocio
 */

export interface InsertVenta {
  id_cliente: number | null;
  id_usuario: string;
  fecha_venta: string;
  total: number;
  metodo_pago: 'EFECTIVO' | 'YAPE' | 'IZIPAY' | 'TRANSFERENCIA';
}

export class VentaRepository {
  /**
   * Crear una nueva venta
   */
  async create(venta: InsertVenta): Promise<Venta> {
    const { data, error } = await supabase
      .from('ventas')
      .insert(venta)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear venta: ${error.message}`);
    }

    return data;
  }

  /**
   * Buscar venta por ID con relaciones
   */
  async findById(idVenta: number): Promise<Venta | null> {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes (nombre, dni),
        usuario:profiles (nombre, apellido)
      `)
      .eq('id_venta', idVenta)
      .single();

    if (error) {
      console.error('Error obteniendo venta:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtener todas las ventas con relaciones
   */
  async findAll(): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        cliente:clientes (nombre, dni),
        usuario:profiles (nombre, apellido)
      `)
      .order('fecha_venta', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener ventas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Buscar ventas por rango de fechas
   */
  async findByDateRange(fechaInicio: string, fechaFin?: string): Promise<Venta[]> {
    let query = supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', fechaInicio);

    if (fechaFin) {
      query = query.lte('fecha_venta', fechaFin);
    }

    const { data, error } = await query.order('fecha_venta', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar ventas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener ventas del día actual
   */
  async findToday(): Promise<Venta[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioDelDia = hoy.toISOString();

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', inicioDelDia)
      .order('fecha_venta', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener ventas del día: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Eliminar una venta
   */
  async delete(idVenta: number): Promise<void> {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id_venta', idVenta);

    if (error) {
      throw new Error(`Error al eliminar venta: ${error.message}`);
    }
  }

  /**
   * Buscar ventas (para búsqueda en UI)
   */
  async search(termino: string): Promise<Venta[]> {
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
      throw new Error(`Error al buscar ventas: ${error.message}`);
    }

    return data || [];
  }
}

// Exportar una instancia singleton
export const ventaRepository = new VentaRepository();
