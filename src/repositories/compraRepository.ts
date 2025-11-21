import { supabase } from "@/lib/supabaseClient";
import type { Compra } from "@/types/database";

/**
 * Repository de Compras
 * Responsabilidad: SOLO acceso a datos de compras (queries)
 */

export interface InsertCompra {
    id_proveedor: number | null;
    id_usuario: string;
    fecha_compra: string;
    total: number;
}

export class CompraRepository {
    /**
     * Crear una nueva compra
     */
    async create(compra: InsertCompra): Promise<Compra> {
        const { data, error } = await supabase
            .from('compras')
            .insert(compra)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear compra: ${error.message}`);
        }

        return data;
    }

    /**
     * Buscar compra por ID con relaciones
     */
    async findById(idCompra: number): Promise<Compra | null> {
        const { data, error } = await supabase
            .from('compras')
            .select(`
        *,
        proveedor:proveedores (nombre, ruc),
        usuario:profiles (nombre, apellido)
      `)
            .eq('id_compra', idCompra)
            .single();

        if (error) {
            console.error('Error obteniendo compra:', error);
            return null;
        }

        return data;
    }

    /**
     * Obtener todas las compras con relaciones
     */
    async findAll(): Promise<Compra[]> {
        const { data, error } = await supabase
            .from('compras')
            .select(`
        *,
        proveedor:proveedores (nombre, ruc),
        usuario:profiles (nombre, apellido)
      `)
            .order('fecha_compra', { ascending: false });

        if (error) {
            throw new Error(`Error al obtener compras: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Eliminar una compra
     */
    async delete(idCompra: number): Promise<void> {
        const { error } = await supabase
            .from('compras')
            .delete()
            .eq('id_compra', idCompra);

        if (error) {
            throw new Error(`Error al eliminar compra: ${error.message}`);
        }
    }
}

// Exportar instancia singleton
export const compraRepository = new CompraRepository();
