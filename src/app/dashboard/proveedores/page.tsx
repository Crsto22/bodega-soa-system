"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Proveedor } from "@/types/database";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "@/services/proveedorService";
import toast from "react-hot-toast";

export default function ProveedoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [deletingProveedor, setDeletingProveedor] = useState<{ id: number; nombre: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    correo: ""
  });

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadProveedores();
  }, []);

  async function loadProveedores() {
    setLoading(true);
    const result = await getProveedores();
    
    if (result.success && result.data) {
      setProveedores(result.data);
    } else {
      toast.error(result.error || "Error al cargar proveedores");
    }
    setLoading(false);
  }

  function handleOpenModal(proveedor?: Proveedor) {
    if (proveedor) {
      setEditingProveedor(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        ruc: proveedor.ruc || "",
        telefono: proveedor.telefono || "",
        correo: proveedor.correo || ""
      });
    } else {
      setEditingProveedor(null);
      setFormData({
        nombre: "",
        ruc: "",
        telefono: "",
        correo: ""
      });
    }
    (document.getElementById('modal_proveedor') as HTMLDialogElement)?.showModal();
  }

  function handleCloseModal() {
    (document.getElementById('modal_proveedor') as HTMLDialogElement)?.close();
    setEditingProveedor(null);
    setFormData({
      nombre: "",
      ruc: "",
      telefono: "",
      correo: ""
    });
  }

  function handleOpenDeleteModal(id: number, nombre: string) {
    setDeletingProveedor({ id, nombre });
    (document.getElementById('modal_delete') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_delete') as HTMLDialogElement)?.close();
    setDeletingProveedor(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setSubmitting(true);

    const proveedorData = {
      nombre: formData.nombre,
      ruc: formData.ruc || undefined,
      telefono: formData.telefono || undefined,
      correo: formData.correo || undefined
    };

    if (editingProveedor) {
      // Actualizar proveedor
      const result = await updateProveedor(editingProveedor.id_proveedor, proveedorData);
      
      if (result.success) {
        toast.success("Proveedor actualizado correctamente");
        loadProveedores();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al actualizar proveedor");
      }
    } else {
      // Crear nuevo proveedor
      const result = await createProveedor(proveedorData);
      
      if (result.success) {
        toast.success("Proveedor creado correctamente");
        loadProveedores();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al crear proveedor");
      }
    }

    setSubmitting(false);
  }

  async function handleConfirmDelete() {
    if (!deletingProveedor) return;

    setDeleting(true);

    const result = await deleteProveedor(deletingProveedor.id);
    
    if (result.success) {
      toast.success("Proveedor eliminado correctamente");
      loadProveedores();
      handleCloseDeleteModal();
    } else {
      toast.error(result.error || "Error al eliminar proveedor");
    }

    setDeleting(false);
  }

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proveedor.ruc && proveedor.ruc.includes(searchTerm)) ||
    (proveedor.telefono && proveedor.telefono.includes(searchTerm)) ||
    (proveedor.correo && proveedor.correo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Proveedores</h1>
            <p className="text-gray-600">Administra la información de tus proveedores</p>
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
                  placeholder="Buscar por nombre, RUC, teléfono o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
                />
              </div>

              {/* Botón Agregar Proveedor */}
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: 'var(--brand-dark)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Proveedor
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-accent)' }}></div>
              <p className="text-gray-600">Cargando proveedores...</p>
            </div>
          ) : (
            <>
              {/* Tabla de proveedores */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RUC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProveedores.length > 0 ? (
                    filteredProveedores.map((proveedor) => (
                      <tr key={proveedor.id_proveedor} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {proveedor.id_proveedor}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--brand-dark)' }}>
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{proveedor.nombre}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {proveedor.ruc}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {proveedor.telefono}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {proveedor.correo}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenModal(proveedor)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Editar"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleOpenDeleteModal(proveedor.id_proveedor, proveedor.nombre)}
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
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-lg font-medium">No se encontraron proveedores</p>
                          <p className="text-sm">Intenta con otra búsqueda o agrega un nuevo proveedor</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Proveedores</p>
                  <p className="text-3xl font-bold text-gray-800">{proveedores.length}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--brand-accent-light)' }}>
                  <svg className="h-8 w-8" style={{ color: 'var(--brand-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Con RUC</p>
                  <p className="text-3xl font-bold text-green-600">
                    {proveedores.filter(p => p.ruc).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Con Correo</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                    {proveedores.filter(p => p.correo).length}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--brand-primary-light)' }}>
                  <svg className="h-8 w-8" style={{ color: 'var(--brand-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Modal Agregar/Editar Proveedor */}
        <dialog id="modal_proveedor" className="modal">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingProveedor ? 'Editar Proveedor' : 'Agregar Proveedor'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nombre *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del proveedor"
                    className="input input-bordered w-full"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">RUC</span>
                  </label>
                  <input
                    type="text"
                    placeholder="RUC"
                    className="input input-bordered w-full"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Teléfono</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    className="input input-bordered w-full"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Correo</span>
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="input input-bordered w-full"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCloseModal}>close</button>
          </form>
        </dialog>

        {/* Modal Eliminar */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de que deseas eliminar al proveedor <strong>{deletingProveedor?.nombre}</strong>?
            </p>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={handleCloseDeleteModal}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCloseDeleteModal}>close</button>
          </form>
        </dialog>
      </div>
    </ProtectedRoute>
  );
}
