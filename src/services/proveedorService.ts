import { supabase } from "@/lib/supabaseClient";
import { Proveedor } from "@/types/database";

// Obtener todos los proveedores
export async function getProveedores(): Promise<{ success: boolean; data?: Proveedor[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('id_proveedor', { ascending: true });

    if (error) {
      console.error('Error obteniendo proveedores:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener proveedores' };
  }
}

// Obtener un proveedor por ID
export async function getProveedorById(id: number): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .eq('id_proveedor', id)
      .single();

    if (error) {
      console.error('Error obteniendo proveedor:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener proveedor' };
  }
}

// Crear un nuevo proveedor
export async function createProveedor(proveedor: Omit<Proveedor, 'id_proveedor' | 'fecha_registro'>): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .insert([proveedor])
      .select()
      .single();

    if (error) {
      console.error('Error creando proveedor:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al crear proveedor' };
  }
}

// Actualizar un proveedor
export async function updateProveedor(id: number, proveedor: Partial<Omit<Proveedor, 'id_proveedor' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .update(proveedor)
      .eq('id_proveedor', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando proveedor:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al actualizar proveedor' };
  }
}

// Eliminar un proveedor
export async function deleteProveedor(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('proveedores')
      .delete()
      .eq('id_proveedor', id);

    if (error) {
      console.error('Error eliminando proveedor:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al eliminar proveedor' };
  }
}

// Buscar proveedores por término
export async function searchProveedores(searchTerm: string): Promise<{ success: boolean; data?: Proveedor[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,ruc.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%,correo.ilike.%${searchTerm}%`)
      .order('id_proveedor', { ascending: true });

    if (error) {
      console.error('Error buscando proveedores:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al buscar proveedores' };
  }
}
