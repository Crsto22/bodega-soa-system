"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Cliente } from "@/types/database";
import { getClientes, createCliente, updateCliente, deleteCliente } from "@/services/clientService";
import toast from "react-hot-toast";

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<{ id: number; nombre: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    telefono: "",
    correo: ""
  });

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    setLoading(true);
    const result = await getClientes();
    
    if (result.success && result.data) {
      setClientes(result.data);
    } else {
      toast.error(result.error || "Error al cargar clientes");
    }
    setLoading(false);
  }

  function handleOpenModal(cliente?: Cliente) {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        dni: cliente.dni || "",
        telefono: cliente.telefono || "",
        correo: cliente.correo || ""
      });
    } else {
      setEditingCliente(null);
      setFormData({
        nombre: "",
        dni: "",
        telefono: "",
        correo: ""
      });
    }
    (document.getElementById('modal_cliente') as HTMLDialogElement)?.showModal();
  }

  function handleCloseModal() {
    (document.getElementById('modal_cliente') as HTMLDialogElement)?.close();
    setEditingCliente(null);
    setFormData({
      nombre: "",
      dni: "",
      telefono: "",
      correo: ""
    });
  }

  function handleOpenDeleteModal(id: number, nombre: string) {
    setDeletingCliente({ id, nombre });
    (document.getElementById('modal_delete') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_delete') as HTMLDialogElement)?.close();
    setDeletingCliente(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setSubmitting(true);

    const clienteData = {
      nombre: formData.nombre,
      dni: formData.dni || undefined,
      telefono: formData.telefono || undefined,
      correo: formData.correo || undefined
    };

    if (editingCliente) {
      // Actualizar cliente
      const result = await updateCliente(editingCliente.id_cliente, clienteData);
      
      if (result.success) {
        toast.success("Cliente actualizado correctamente");
        loadClientes();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al actualizar cliente");
      }
    } else {
      // Crear nuevo cliente
      const result = await createCliente(clienteData);
      
      if (result.success) {
        toast.success("Cliente creado correctamente");
        loadClientes();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al crear cliente");
      }
    }

    setSubmitting(false);
  }

  async function handleConfirmDelete() {
    if (!deletingCliente) return;

    setDeleting(true);

    const result = await deleteCliente(deletingCliente.id);
    
    if (result.success) {
      toast.success("Cliente eliminado correctamente");
      loadClientes();
      handleCloseDeleteModal();
    } else {
      toast.error(result.error || "Error al eliminar cliente");
    }

    setDeleting(false);
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cliente.dni && cliente.dni.includes(searchTerm)) ||
    (cliente.telefono && cliente.telefono.includes(searchTerm)) ||
    (cliente.correo && cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Clientes</h1>
            <p className="text-gray-600">Administra la información de tus clientes</p>
          </div>

          {/* Barra de búsqueda y botón agregar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Búsqueda */}
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI, teléfono o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
                />
              </div>

              {/* Botón Agregar Cliente */}
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: 'var(--brand-dark)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Cliente
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-accent)' }}></div>
              <p className="text-gray-600">Cargando clientes...</p>
            </div>
          ) : (
            <>
              {/* Tabla de clientes */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClientes.length > 0 ? (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cliente.id_cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: 'var(--brand-accent)' }}>
                              {cliente.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {cliente.dni}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {cliente.telefono}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {cliente.correo}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenModal(cliente)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Editar"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleOpenDeleteModal(cliente.id_cliente, cliente.nombre)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium">No se encontraron clientes</p>
                          <p className="text-sm">Intenta con otra búsqueda o agrega un nuevo cliente</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clientes</p>
                  <p className="text-3xl font-bold text-gray-800">{clientes.length}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--brand-accent-light)' }}>
                  <svg className="h-8 w-8" style={{ color: 'var(--brand-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Con DNI</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {clientes.filter(c => c.dni).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Con Correo</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--brand-dark)' }}>
                    {clientes.filter(c => c.correo).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Modal Agregar/Editar Cliente - DaisyUI */}
        <dialog id="modal_cliente" className="modal">
          <div className="modal-box max-w-2xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-2xl mb-6 text-gray-800">
              {editingCliente ? "Editar Cliente" : "Agregar Cliente"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                    placeholder="Ej: Juan Pérez García"
                  />
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                    placeholder="12345678"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                    placeholder="987654321"
                  />
                </div>

                {/* Correo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn text-white"
                  style={{ backgroundColor: 'var(--brand-dark)' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Guardando...
                    </>
                  ) : (
                    editingCliente ? "Actualizar" : "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Cerrar</button>
          </form>
        </dialog>

        {/* Modal Eliminar Cliente - DaisyUI */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar al cliente <span className="font-semibold text-red-600">"{deletingCliente?.nombre}"</span>?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="btn btn-outline"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-error text-white"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Cerrar</button>
          </form>
        </dialog>
      </div>
    </ProtectedRoute>
  );
}
