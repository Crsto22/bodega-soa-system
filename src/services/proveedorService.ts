// REFACTORIZADO: Ahora usa Repository Pattern
import { proveedorRepository } from "@/repositories/proveedorRepository";
import { Proveedor } from "@/types/database";

// Obtener todos los proveedores
export async function getProveedores(): Promise<{ success: boolean; data?: Proveedor[]; error?: string }> {
  try {
    // USA REPOSITORY
    const proveedores = await proveedorRepository.findAll();
    return { success: true, data: proveedores };
  } catch (error: any) {
    console.error('Error obteniendo proveedores:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener proveedores' };
  }
}

// Obtener un proveedor por ID
export async function getProveedorById(id: number): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    // USA REPOSITORY
    const proveedor = await proveedorRepository.findById(id);

    if (!proveedor) {
      return { success: false, error: 'Proveedor no encontrado' };
    }

    return { success: true, data: proveedor };
  } catch (error: any) {
    console.error('Error obteniendo proveedor:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener proveedor' };
  }
}

// Crear un nuevo proveedor
export async function createProveedor(proveedor: Omit<Proveedor, 'id_proveedor' | 'fecha_registro'>): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (!proveedor.nombre || proveedor.nombre.trim() === '') {
      return { success: false, error: 'El nombre del proveedor es obligatorio' };
    }

    if (!proveedor.ruc || proveedor.ruc.trim() === '') {
      return { success: false, error: 'El RUC del proveedor es obligatorio' };
    }

    // USA REPOSITORY
    const nuevoProveedor = await proveedorRepository.create(proveedor);
    return { success: true, data: nuevoProveedor };
  } catch (error: any) {
    console.error('Error creando proveedor:', error);
    return { success: false, error: error.message || 'Error inesperado al crear proveedor' };
  }
}

// Actualizar un proveedor
export async function updateProveedor(id: number, proveedor: Partial<Omit<Proveedor, 'id_proveedor' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Proveedor; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (proveedor.nombre !== undefined && proveedor.nombre.trim() === '') {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }

    if (proveedor.ruc !== undefined && proveedor.ruc.trim() === '') {
      return { success: false, error: 'El RUC no puede estar vacío' };
    }

    // USA REPOSITORY
    const proveedorActualizado = await proveedorRepository.update(id, proveedor);
    return { success: true, data: proveedorActualizado };
  } catch (error: any) {
    console.error('Error actualizando proveedor:', error);
    return { success: false, error: error.message || 'Error inesperado al actualizar proveedor' };
  }
}

// Eliminar un proveedor
export async function deleteProveedor(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // USA REPOSITORY
    await proveedorRepository.delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Error eliminando proveedor:', error);
    return { success: false, error: error.message || 'Error inesperado al eliminar proveedor' };
  }
}

// Buscar proveedores por término
export async function searchProveedores(searchTerm: string): Promise<{ success: boolean; data?: Proveedor[]; error?: string }> {
  try {
    // USA REPOSITORY
    const proveedores = await proveedorRepository.search(searchTerm);
    return { success: true, data: proveedores };
  } catch (error: any) {
    console.error('Error buscando proveedores:', error);
    return { success: false, error: error.message || 'Error inesperado al buscar proveedores' };
  }
}
