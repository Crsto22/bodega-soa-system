import { supabase } from "@/lib/supabaseClient";
import { Cliente } from "@/types/database";

/**
 * Repository de Clientes
 * Responsabilidad: SOLO acceso a datos de clientes
 */

export interface InsertCliente {
    nombre: string;
    dni: string;
    telefono?: string;
    direccion?: string;
    email?: string;
}

export class ClientRepository {
    /**
     * Obtener todos los clientes
     */
    async findAll(): Promise<Cliente[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nombre', { ascending: true });

        if (error) {
            throw new Error(`Error al obtener clientes: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Buscar cliente por ID
     */
    async findById(id: number): Promise<Cliente | null> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('id_cliente', id)
            .single();

        if (error) {
            console.error('Error obteniendo cliente:', error);
            return null;
        }

        return data;
    }

    /**
     * Crear un nuevo cliente
     */
    async create(cliente: InsertCliente): Promise<Cliente> {
        const { data, error } = await supabase
            .from('clientes')
            .insert(cliente)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear cliente: ${error.message}`);
        }

        return data;
    }

    /**
     * Actualizar un cliente
     */
    async update(id: number, cliente: Partial<InsertCliente>): Promise<Cliente> {
        const { data, error } = await supabase
            .from('clientes')
            .update(cliente)
            .eq('id_cliente', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al actualizar cliente: ${error.message}`);
        }

        return data;
    }

    /**
     * Eliminar un cliente
     */
    async delete(id: number): Promise<void> {
        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id_cliente', id);

        if (error) {
            throw new Error(`Error al eliminar cliente: ${error.message}`);
        }
    }

    /**
     * Buscar clientes por término
     */
    async search(searchTerm: string): Promise<Cliente[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .or(`nombre.ilike.%${searchTerm}%,dni.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%`)
            .order('nombre', { ascending: true });

        if (error) {
            throw new Error(`Error al buscar clientes: ${error.message}`);
        }

        return data || [];
    }
}

// Exportar instancia singleton
export const clientRepository = new ClientRepository();
