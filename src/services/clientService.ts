// REFACTORIZADO: Ahora usa Repository Pattern
import { clientRepository } from "@/repositories/clientRepository";
import { Cliente } from "@/types/database";

// Obtener todos los clientes
export async function getClientes(): Promise<{ success: boolean; data?: Cliente[]; error?: string }> {
  try {
    // USA REPOSITORY
    const clientes = await clientRepository.findAll();
    return { success: true, data: clientes };
  } catch (error: any) {
    console.error('Error obteniendo clientes:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener clientes' };
  }
}

// Obtener un cliente por ID
export async function getClienteById(id: number): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    // USA REPOSITORY
    const cliente = await clientRepository.findById(id);

    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' };
    }

    return { success: true, data: cliente };
  } catch (error: any) {
    console.error('Error obteniendo cliente:', error);
    return { success: false, error: error.message || 'Error inesperado al obtener cliente' };
  }
}

// Crear un nuevo cliente
export async function createCliente(cliente: Omit<Cliente, 'id_cliente' | 'fecha_registro'>): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (!cliente.nombre || cliente.nombre.trim() === '') {
      return { success: false, error: 'El nombre del cliente es obligatorio' };
    }

    if (!cliente.dni || cliente.dni.trim() === '') {
      return { success: false, error: 'El DNI del cliente es obligatorio' };
    }

    // USA REPOSITORY
    const nuevoCliente = await clientRepository.create(cliente);
    return { success: true, data: nuevoCliente };
  } catch (error: any) {
    console.error('Error creando cliente:', error);
    return { success: false, error: error.message || 'Error inesperado al crear cliente' };
  }
}

// Actualizar un cliente
export async function updateCliente(id: number, cliente: Partial<Omit<Cliente, 'id_cliente' | 'fecha_registro'>>): Promise<{ success: boolean; data?: Cliente; error?: string }> {
  try {
    // LÓGICA DE NEGOCIO: Validaciones
    if (cliente.nombre !== undefined && cliente.nombre.trim() === '') {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }

    if (cliente.dni !== undefined && cliente.dni.trim() === '') {
      return { success: false, error: 'El DNI no puede estar vacío' };
    }

    // USA REPOSITORY
    const clienteActualizado = await clientRepository.update(id, cliente);
    return { success: true, data: clienteActualizado };
  } catch (error: any) {
    console.error('Error actualizando cliente:', error);
    return { success: false, error: error.message || 'Error inesperado al actualizar cliente' };
  }
}

// Eliminar un cliente
export async function deleteCliente(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // USA REPOSITORY
    await clientRepository.delete(id);
    return { success: true };
  } catch (error: any) {
    console.error('Error eliminando cliente:', error);
    return { success: false, error: error.message || 'Error inesperado al eliminar cliente' };
  }
}

// Buscar clientes por término
export async function searchClientes(searchTerm: string): Promise<{ success: boolean; data?: Cliente[]; error?: string }> {
  try {
    // USA REPOSITORY
    const clientes = await clientRepository.search(searchTerm);
    return { success: true, data: clientes };
  } catch (error: any) {
    console.error('Error buscando clientes:', error);
    return { success: false, error: error.message || 'Error inesperado al buscar clientes' };
  }
}
