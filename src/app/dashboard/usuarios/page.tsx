"use client";

import { useState, useEffect } from "react";
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, buscarUsuarios } from "@/services/userService";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";
import type { Profile } from "@/types/database";
import { Users, Search, Plus, Edit2, Trash2, Shield, User, X } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingUsuario, setDeletingUsuario] = useState<{ id: string; nombre: string } | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    rol: "VENDEDOR" as "ADMIN" | "VENDEDOR"
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const resultado = await getUsuarios();
      if (resultado.success && resultado.data) {
        setUsuarios(resultado.data);
      } else {
        toast.error(resultado.error || "Error al cargar usuarios");
      }
    } catch (error) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(term: string) {
    setSearchTerm(term);
    if (term.trim() === "") {
      cargarUsuarios();
      return;
    }

    try {
      const resultado = await buscarUsuarios(term);
      if (resultado.success && resultado.data) {
        setUsuarios(resultado.data);
      }
    } catch (error) {
      toast.error("Error al buscar usuarios");
    }
  }

  function handleOpenModal(mode: "create" | "edit", usuario?: Profile) {
    setModalMode(mode);
    if (mode === "edit" && usuario) {
      setFormData({
        id: usuario.id,
        email: "", // No se puede editar email
        password: "",
        nombre: usuario.nombre,
        apellido: usuario.apellido || "",
        telefono: usuario.telefono || "",
        rol: usuario.rol
      });
    } else {
      setFormData({
        id: "",
        email: "",
        password: "",
        nombre: "",
        apellido: "",
        telefono: "",
        rol: "VENDEDOR"
      });
    }
    (document.getElementById('modal_usuario') as HTMLDialogElement)?.showModal();
  }

  function handleCloseModal() {
    (document.getElementById('modal_usuario') as HTMLDialogElement)?.close();
    setFormData({
      id: "",
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      telefono: "",
      rol: "VENDEDOR"
    });
  }

  function handleOpenDeleteModal(id: string, nombre: string) {
    setDeletingUsuario({ id, nombre });
    (document.getElementById('modal_delete') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_delete') as HTMLDialogElement)?.close();
    setDeletingUsuario(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === "create") {
        if (!formData.email || !formData.password || !formData.nombre) {
          toast.error("Completa los campos requeridos");
          setSubmitting(false);
          return;
        }

        const resultado = await crearUsuario({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          rol: formData.rol
        });

        if (resultado.success) {
          toast.success("Usuario creado exitosamente");
          handleCloseModal();
          cargarUsuarios();
        } else {
          toast.error(resultado.error || "Error al crear usuario");
        }
      } else {
        const resultado = await actualizarUsuario(formData.id, {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          rol: formData.rol
        } as Profile);

        if (resultado.success) {
          toast.success("Usuario actualizado exitosamente");
          handleCloseModal();
          cargarUsuarios();
        } else {
          toast.error(resultado.error || "Error al actualizar usuario");
        }
      }
    } catch (error) {
      toast.error("Error al procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deletingUsuario) return;

    setDeleting(true);
    try {
      const resultado = await eliminarUsuario(deletingUsuario.id);
      if (resultado.success) {
        toast.success("Usuario eliminado exitosamente");
        handleCloseDeleteModal();
        cargarUsuarios();
      } else {
        toast.error(resultado.error || "Error al eliminar usuario");
      }
    } catch (error) {
      toast.error("Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  }

  const filteredUsuarios = usuarios;
  const totalUsuarios = usuarios.length;
  const adminCount = usuarios.filter(u => u.rol === "ADMIN").length;
  const vendedorCount = usuarios.filter(u => u.rol === "VENDEDOR").length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-dark)' }}>
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Usuarios del Sistema</h1>
                  <p className="text-gray-600">Gestiona los usuarios y permisos</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenModal("create")}
                className="btn text-white gap-2"
                style={{ backgroundColor: 'var(--brand-dark)' }}
              >
                <Plus className="h-5 w-5" />
                Nuevo Usuario
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalUsuarios}</p>
                    <p className="text-sm text-gray-600">Total Usuarios</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                    <p className="text-sm text-gray-600">Administradores</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{vendedorCount}</p>
                    <p className="text-sm text-gray-600">Vendedores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o teléfono..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg" style={{ color: 'var(--brand-accent)' }}></span>
              </div>
            ) : filteredUsuarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: usuario.rol === 'ADMIN' ? 'var(--brand-primary)' : 'var(--brand-dark)' }}>
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {usuario.nombre} {usuario.apellido}
                              </div>
                              <div className="text-sm text-gray-500">{usuario.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            usuario.rol === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usuario.telefono || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usuario.creado_en ? new Date(usuario.creado_en).toLocaleDateString('es-ES') : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal("edit", usuario)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Crear/Editar Usuario */}
        <dialog id="modal_usuario" className="modal">
          <div className="modal-box max-w-md">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-xl mb-6 text-gray-800">
              {modalMode === "create" ? "Nuevo Usuario" : "Editar Usuario"}
            </h3>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {modalMode === "create" && (
                    <>
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Email *</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Contraseña *</span>
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="input input-bordered w-full"
                          required
                          minLength={6}
                        />
                        <label className="label">
                          <span className="label-text-alt text-gray-500">Mínimo 6 caracteres</span>
                        </label>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Nombre *</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Apellido</span>
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Teléfono</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Rol *</span>
                    </label>
                    <select
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value as "ADMIN" | "VENDEDOR" })}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="VENDEDOR">Vendedor</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
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
                      modalMode === "create" ? "Crear Usuario" : "Actualizar"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>Cerrar</button>
            </form>
          </dialog>

        {/* Modal Eliminar Usuario */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar al usuario <span className="font-semibold text-red-600">"{deletingUsuario?.nombre}"</span>?
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
