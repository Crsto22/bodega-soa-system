"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Producto } from "@/types/database";
import { getProductos, createProducto, updateProducto, deleteProducto } from "@/services/productService";
import toast from "react-hot-toast";

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<{ id: number; nombre: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    marca: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
    unidad_medida: "unidad"
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductos();
  }, []);

  async function loadProductos() {
    setLoading(true);
    const result = await getProductos();
    
    if (result.success && result.data) {
      setProductos(result.data);
    } else {
      toast.error(result.error || "Error al cargar productos");
    }
    setLoading(false);
  }

  function handleOpenModal(producto?: Producto) {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria || "",
        marca: producto.marca || "",
        precio_compra: producto.precio_compra.toString(),
        precio_venta: producto.precio_venta.toString(),
        stock: producto.stock.toString(),
        unidad_medida: producto.unidad_medida || "unidad"
      });
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: "",
        categoria: "",
        marca: "",
        precio_compra: "",
        precio_venta: "",
        stock: "",
        unidad_medida: "unidad"
      });
    }
    (document.getElementById('modal_producto') as HTMLDialogElement)?.showModal();
  }

  function handleCloseModal() {
    (document.getElementById('modal_producto') as HTMLDialogElement)?.close();
    setEditingProduct(null);
    setFormData({
      nombre: "",
      categoria: "",
      marca: "",
      precio_compra: "",
      precio_venta: "",
      stock: "",
      unidad_medida: "unidad"
    });
  }

  function handleOpenDeleteModal(id: number, nombre: string) {
    setDeletingProduct({ id, nombre });
    (document.getElementById('modal_delete') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_delete') as HTMLDialogElement)?.close();
    setDeletingProduct(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre || !formData.precio_compra || !formData.precio_venta || !formData.stock) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setSubmitting(true);

    const productoData = {
      nombre: formData.nombre,
      categoria: formData.categoria || undefined,
      marca: formData.marca || undefined,
      precio_compra: parseFloat(formData.precio_compra),
      precio_venta: parseFloat(formData.precio_venta),
      stock: parseInt(formData.stock),
      unidad_medida: formData.unidad_medida || undefined
    };

    if (editingProduct) {
      // Actualizar producto
      const result = await updateProducto(editingProduct.id_producto, productoData);
      
      if (result.success) {
        toast.success("Producto actualizado correctamente");
        loadProductos();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al actualizar producto");
      }
    } else {
      // Crear nuevo producto
      const result = await createProducto(productoData);
      
      if (result.success) {
        toast.success("Producto creado correctamente");
        loadProductos();
        handleCloseModal();
      } else {
        toast.error(result.error || "Error al crear producto");
      }
    }

    setSubmitting(false);
  }

  async function handleConfirmDelete() {
    if (!deletingProduct) return;

    setDeleting(true);

    const result = await deleteProducto(deletingProduct.id);
    
    if (result.success) {
      toast.success("Producto eliminado correctamente");
      loadProductos();
      handleCloseDeleteModal();
    } else {
      toast.error(result.error || "Error al eliminar producto");
    }

    setDeleting(false);
  }

  const filteredProducts = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra tu inventario de productos</p>
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
                  placeholder="Buscar por nombre, categoría o marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
                />
              </div>

              {/* Botón Agregar Producto */}
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: 'var(--brand-dark)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Producto
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-accent)' }}></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Tabla de productos */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P. Compra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      P. Venta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((producto) => (
                      <tr key={producto.id_producto} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {producto.id_producto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {producto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {producto.marca}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          S/ {producto.precio_compra.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          S/ {producto.precio_venta.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            producto.stock < 10 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {producto.stock} {producto.unidad_medida}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleOpenModal(producto)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Editar"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleOpenDeleteModal(producto.id_producto, producto.nombre)}
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
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-lg font-medium">No se encontraron productos</p>
                          <p className="text-sm">Intenta con otra búsqueda o agrega un nuevo producto</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                  <p className="text-3xl font-bold text-gray-800">{productos.length}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--brand-accent-light)' }}>
                  <svg className="h-8 w-8" style={{ color: 'var(--brand-accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
                  <p className="text-3xl font-bold text-red-600">
                    {productos.filter(p => p.stock < 10).length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valor Inventario</p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--brand-dark)' }}>
                    S/ {productos.reduce((sum, p) => sum + (p.precio_compra * p.stock), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--brand-dark-light)' }}>
                  <svg className="h-8 w-8" style={{ color: 'var(--brand-dark)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Modal Agregar/Editar Producto - DaisyUI */}
        <dialog id="modal_producto" className="modal">
          <div className="modal-box max-w-2xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-2xl mb-6 text-gray-800">
              {editingProduct ? "Editar Producto" : "Agregar Producto"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="Ej: Coca Cola 2L"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="Ej: Bebidas"
                    />
                  </div>

                  {/* Marca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="Ej: Coca Cola"
                    />
                  </div>

                  {/* Precio Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Compra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.precio_compra}
                      onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Precio Venta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Venta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.precio_venta}
                      onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                      placeholder="0"
                    />
                  </div>

                  {/* Unidad de Medida */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad de Medida
                    </label>
                    <select
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent)"
                    >
                      <option value="unidad">Unidad</option>
                      <option value="kg">Kilogramo (kg)</option>
                      <option value="litro">Litro</option>
                      <option value="caja">Caja</option>
                      <option value="paquete">Paquete</option>
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
                      editingProduct ? "Actualizar" : "Guardar"
                    )}
                  </button>
                </div>
              </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Cerrar</button>
          </form>
        </dialog>

        {/* Modal Eliminar Producto - DaisyUI */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar el producto <span className="font-semibold text-red-600">"{deletingProduct?.nombre}"</span>?
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
