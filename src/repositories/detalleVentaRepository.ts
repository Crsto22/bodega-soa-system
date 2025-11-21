import { supabase } from "@/lib/supabaseClient";
import type { DetalleVenta } from "@/types/database";

/**
 * Repository de Detalles de Venta
 * Responsabilidad: SOLO acceso a datos de detalles de venta
 */

export interface InsertDetalleVenta {
    id_venta: number;
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export class DetalleVentaRepository {
    /**
     * Crear múltiples detalles de venta
     */
    async createMany(detalles: InsertDetalleVenta[]): Promise<DetalleVenta[]> {
        const { data, error } = await supabase
            .from('detalle_venta')
            .insert(detalles)
            .select();

        if (error) {
            throw new Error(`Error al crear detalles de venta: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Obtener detalles de una venta específica
     */
    async findByVenta(idVenta: number): Promise<DetalleVenta[]> {
        const { data, error } = await supabase
            .from('detalle_venta')
            .select(`
        *,
        producto:productos (nombre, precio_venta)
      `)
            .eq('id_venta', idVenta);

        if (error) {
            throw new Error(`Error al obtener detalles de venta: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Eliminar todos los detalles de una venta
     */
    async deleteByVenta(idVenta: number): Promise<void> {
        const { error } = await supabase
            .from('detalle_venta')
            .delete()
            .eq('id_venta', idVenta);

        if (error) {
            throw new Error(`Error al eliminar detalles de venta: ${error.message}`);
        }
    }
}

// Exportar instancia singleton
export const detalleVentaRepository = new DetalleVentaRepository();
