import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import type { Profile } from "@/types/database";

interface ResultadoUsuario {
  success: boolean;
  data?: any;
  error?: string;
}

interface DatosNuevoUsuario {
  email: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  rol: 'ADMIN' | 'VENDEDOR';
}

// Crear nuevo usuario (Auth + Profile)
export async function crearUsuario(datos: DatosNuevoUsuario): Promise<ResultadoUsuario> {
  try {
    // 1. Crear usuario en Supabase Auth usando el cliente admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: datos.email,
      password: datos.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        nombre: datos.nombre,
        apellido: datos.apellido || '',
        rol: datos.rol
      }
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Error al crear usuario en Auth' };
    }

    // 2. Crear perfil en la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        nombre: datos.nombre,
        apellido: datos.apellido || null,
        telefono: datos.telefono || null,
        rol: datos.rol
      })
      .select()
      .single();

    if (profileError) {
      // Si falla el perfil, eliminar el usuario de Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: 'Error al crear perfil de usuario' };
    }

    return { success: true, data: { auth: authData.user, profile: profileData } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear usuario' };
  }
}

// Obtener todos los usuarios
export async function getUsuarios() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Obtener usuario por ID
export async function getUsuarioById(id: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Actualizar perfil de usuario
export async function actualizarUsuario(id: string, datos: Partial<Profile>): Promise<ResultadoUsuario> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        rol: datos.rol
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Eliminar usuario (Auth + Profile)
export async function eliminarUsuario(id: string): Promise<ResultadoUsuario> {
  try {
    // 1. Eliminar de Supabase Auth usando el cliente admin
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return { success: false, error: 'Error al eliminar usuario de Auth: ' + authError.message };
    }

    // 2. Eliminar de la tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      console.warn('Error al eliminar perfil:', profileError);
      // No retornar error ya que el usuario de Auth ya fue eliminado
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Buscar usuarios
export async function buscarUsuarios(termino: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`nombre.ilike.%${termino}%,apellido.ilike.%${termino}%,telefono.ilike.%${termino}%`)
      .order('creado_en', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Cambiar contraseña de usuario
export async function cambiarContrasena(userId: string, nuevaContrasena: string): Promise<ResultadoUsuario> {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: nuevaContrasena }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
