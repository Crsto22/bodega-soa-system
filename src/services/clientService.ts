import { supabase } from "@/lib/supabaseClient";
import { Cliente } from "@/types/database";

// Obtener todos los clientes
export async function getClientes(): Promise<{ success: boolean; data?: Cliente[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id_cliente', { ascending: true });

    if (error) {
      console.error('Error obteniendo clientes:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener clientes' };
  }
}

// Obtener un cliente por ID
export async function getClienteById(id: number): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_cliente', id)
      .single();

    if (error) {
      console.error('Error obteniendo cliente:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener cliente' };
  }
}

// Crear un nuevo cliente
export async function createCliente(cliente: Omit<Cliente, 'id_cliente' | 'fecha_registro'>): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single();

    if (error) {
      console.error('Error creando cliente:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al crear cliente' };
  }
}

// Actualizar un cliente
export async function updateCliente(id: number, cliente: Partial<Omit<Cliente, 'id_cliente' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id_cliente', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cliente:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al actualizar cliente' };
  }
}

// Eliminar un cliente
export async function deleteCliente(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id_cliente', id);

    if (error) {
      console.error('Error eliminando cliente:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al eliminar cliente' };
  }
}

// Buscar clientes por término
export async function searchClientes(searchTerm: string): Promise<{ success: boolean; data?: Cliente[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,dni.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,correo.ilike.%${searchTerm}%`)
      .order('id_cliente', { ascending: true });

    if (error) {
      console.error('Error buscando clientes:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al buscar clientes' };
  }
}
