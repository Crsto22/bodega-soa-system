import { supabase } from "@/lib/supabaseClient";
import { Producto } from "@/types/database";

// Obtener todos los productos
export async function getProductos(): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id_producto', { ascending: true });

    if (error) {
      console.error('Error obteniendo productos:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener productos' };
  }
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id_producto', id)
      .single();

    if (error) {
      console.error('Error obteniendo producto:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener producto' };
  }
}

// Crear un nuevo producto
export async function createProducto(producto: Omit<Producto, 'id_producto' | 'fecha_registro'>): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single();

    if (error) {
      console.error('Error creando producto:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al crear producto' };
  }
}

// Actualizar un producto
export async function updateProducto(id: number, producto: Partial<Omit<Producto, 'id_producto' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Producto; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id_producto', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando producto:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al actualizar producto' };
  }
}

// Eliminar un producto
export async function deleteProducto(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', id);

    if (error) {
      console.error('Error eliminando producto:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al eliminar producto' };
  }
}

// Buscar productos por término
export async function searchProductos(searchTerm: string): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .or(`nombre.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%`)
      .order('id_producto', { ascending: true });

    if (error) {
      console.error('Error buscando productos:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al buscar productos' };
  }
}

// Obtener productos con stock bajo (menos de 10)
export async function getProductosStockBajo(): Promise<{ success: boolean; data?: Producto[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .lt('stock', 10)
      .order('stock', { ascending: true });

    if (error) {
      console.error('Error obteniendo productos con stock bajo:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado al obtener productos con stock bajo' };
  }
}
