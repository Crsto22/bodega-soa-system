import { supabase } from "@/lib/supabaseClient";
import { Proveedor } from "@/types/database";

/**
 * Repository de Proveedores
 * Responsabilidad: SOLO acceso a datos de proveedores
 */

export interface InsertProveedor {
    nombre: string;
    ruc: string;
    telefono?: string;
    direccion?: string;
    email?: string;
}

export class ProveedorRepository {
    /**
     * Obtener todos los proveedores
     */
    async findAll(): Promise<Proveedor[]> {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener proveedores: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Buscar proveedor por ID
     */
    async findById(id: number): Promise<Proveedor | null> {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .eq('id_proveedor', id)
            .single();

        if (error) {
            console.error('Error obteniendo proveedor:', error);
            return null;
        }

        return data;
    }

    /**
     * Crear un nuevo proveedor
     */
    async create(proveedor: InsertProveedor): Promise<Proveedor> {
        const { data, error } = await supabase
            .from('proveedores')
            .insert(proveedor)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear proveedor: ${error.message}`);
        }

        return data;
    }

    /**
     * Actualizar un proveedor
     */
    async update(id: number, proveedor: Partial<InsertProveedor>): Promise<Proveedor> {
        const { data, error } = await supabase
            .from('proveedores')
            .update(proveedor)
            .eq('id_proveedor', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al actualizar proveedor: ${error.message}`);
        }

        return data;
    }

    /**
     * Eliminar un proveedor
     */
    async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from('proveedores')
            .delete()
            .eq('id_proveedor', id);

        if (error) {
            throw new Error(`Error al eliminar proveedor: ${error.message}`);
        }
    }

    /**
     * Buscar proveedores por término
     */
    async search(searchTerm: string): Promise<Proveedor[]> {
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .or(`nombre.ilike.%${searchTerm}%,ruc.ilike.%${searchTerm}%`)
            .order('nombre', { ascending: true });

        if (error) {
            throw new Error(`Error al buscar proveedores: ${error.message}`);
        }

        return data || [];
    }
}

// Exportar instancia singleton
export const proveedorRepository = new ProveedorRepository();
