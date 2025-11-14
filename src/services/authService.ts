import { supabase } from '@/lib/supabaseClient';
import type { Profile } from '@/types/database';

// Tipos para las respuestas de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  profile?: Profile;
}

/**
 * Iniciar sesión con email y contraseña
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    // Validar que los campos no estén vacíos
    if (!email || !password) {
      return {
        success: false,
        message: 'Por favor completa todos los campos',
      };
    }

    // Intentar iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Mensajes de error más amigables
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          message: 'Correo o contraseña incorrectos',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'No se pudo autenticar el usuario',
      };
    }

    // Obtener el perfil del usuario desde la tabla profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error al obtener perfil:', profileError);
    }

    // Guardar datos del usuario en localStorage
    if (profileData) {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    }

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: data.user,
      profile: profileData || undefined,
    };
  } catch (error) {
    console.error('Error inesperado al iniciar sesión:', error);
    return {
      success: false,
      message: 'Error inesperado al iniciar sesión',
    };
  }
}

/**
 * Cerrar sesión
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        message: 'Error al cerrar sesión',
      };
    }

    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('userProfile');

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  } catch (error) {
    console.error('Error inesperado al cerrar sesión:', error);
    return {
      success: false,
      message: 'Error inesperado al cerrar sesión',
    };
  }
}

/**
 * Obtener el usuario actualmente autenticado
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }

    if (!user) {
      return null;
    }

    // Intentar obtener perfil de localStorage primero
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      return {
        ...user,
        profile: JSON.parse(cachedProfile),
      };
    }

    // Si no está en cache, obtener de la base de datos
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Guardar en localStorage para próximas consultas
    if (profileData) {
      localStorage.setItem('userProfile', JSON.stringify(profileData));
    }

    return {
      ...user,
      profile: profileData,
    };
  } catch (error) {
    console.error('Error inesperado al obtener usuario:', error);
    return null;
  }
}

/**
 * Obtener perfil desde localStorage
 */
export function getUserProfileFromStorage(): Profile | null {
  try {
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }
    return null;
  } catch (error) {
    console.error('Error al obtener perfil de localStorage:', error);
    return null;
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
}

/**
 * Obtener la sesión actual
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error inesperado al obtener sesión:', error);
    return null;
  }
}
