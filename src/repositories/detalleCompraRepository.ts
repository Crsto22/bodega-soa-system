import { supabase } from "@/lib/supabaseClient";
import type { DetalleCompra } from "@/types/database";

/**
 * Repository de Detalles de Compra
 * Responsabilidad: SOLO acceso a datos de detalles de compra
 */

export interface InsertDetalleCompra {
    id_compra: number;
    id_producto: number;
    cantidad: number;
    precio_compra: number;
    subtotal: number;
}

export class DetalleCompraRepository {
    /**
     * Crear múltiples detalles de compra
     */
    async createMany(detalles: InsertDetalleCompra[]): Promise<DetalleCompra[]> {
        const { data, error } = await supabase
            .from('detalle_compra')
            .insert(detalles)
            .select();

        if (error) {
            throw new Error(`Error al crear detalles de compra: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Obtener detalles de una compra específica
     */
    async findByCompra(idCompra: number): Promise<DetalleCompra[]> {
        const { data, error } = await supabase
            .from('detalle_compra')
            .select(`
        *,
        producto:productos (nombre, precio_compra)
      `)
            .eq('id_compra', idCompra);

        if (error) {
            throw new Error(`Error al obtener detalles de compra: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Eliminar todos los detalles de una compra
     */
    async deleteByCompra(idCompra: number): Promise<void> {
        const { error } = await supabase
            .from('detalle_compra')
            .delete()
            .eq('id_compra', idCompra);

        if (error) {
            throw new Error(`Error al eliminar detalles de compra: ${error.message}`);
        }
    }
}

// Exportar instancia singleton
export const detalleCompraRepository = new DetalleCompraRepository();
