'use client';

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCompras, getCompraById, eliminarCompra } from "@/services/compraService";
import toast from "react-hot-toast";
import { Search, Eye, Trash2, Package, CreditCard, Calendar, ShoppingCart, FileText } from "lucide-react";
import Link from "next/link";

interface Compra {
  id_compra: number;
  id_proveedor?: number;
  id_usuario: string;
  fecha_compra: string;
  total: number;
  proveedor?: {
    nombre: string;
    ruc?: string;
  };
  usuario?: {
    nombre: string;
    apellido: string;
  };
}

interface DetalleCompra {
  id_detalle_compra: number;
  id_producto: number;
  cantidad: number;
  precio_compra: number;
  subtotal: number;
  producto?: {
    nombre: string;
    precio_compra: number;
  };
}

interface CompraDetallada extends Compra {
  detalles?: DetalleCompra[];
}

export default function HistorialComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [comprasFiltradas, setComprasFiltradas] = useState<Compra[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraDetallada | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [compraAEliminar, setCompraAEliminar] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    const resultado = await getCompras();
    if (resultado.success && resultado.data) {
      setCompras(resultado.data);
      setComprasFiltradas(resultado.data);
    } else {
      toast.error("Error al cargar compras");
    }
  };

  // Filtrar compras
  useEffect(() => {
    if (busqueda.trim() === "") {
      setComprasFiltradas(compras);
    } else {
      const filtradas = compras.filter(c => 
        c.proveedor?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.proveedor?.ruc?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.usuario?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.usuario?.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.id_compra.toString().includes(busqueda)
      );
      setComprasFiltradas(filtradas);
    }
  }, [busqueda, compras]);

  // Abrir modal de detalles
  const handleOpenModal = async (compra: Compra) => {
    setLoadingDetalle(true);
    (document.getElementById('modal_detalle_compra') as HTMLDialogElement)?.showModal();
    
    try {
      const resultado = await getCompraById(compra.id_compra);
      if (resultado.success && resultado.data) {
        setCompraSeleccionada(resultado.data);
      } else {
        toast.error(resultado.error || "Error al cargar detalles");
        handleCloseModal();
      }
    } catch (error) {
      toast.error("Error al cargar detalles de la compra");
      handleCloseModal();
    } finally {
      setLoadingDetalle(false);
    }
  };

  function handleCloseModal() {
    (document.getElementById('modal_detalle_compra') as HTMLDialogElement)?.close();
    setCompraSeleccionada(null);
  }

  function handleOpenDeleteModal(id: number, proveedor: string) {
    setCompraAEliminar(id);
    (document.getElementById('modal_confirmar_eliminar') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_confirmar_eliminar') as HTMLDialogElement)?.close();
    setCompraAEliminar(null);
  }

  // Eliminar compra
  async function handleConfirmDelete() {
    if (!compraAEliminar) return;

    setLoading(true);
    try {
      const resultado = await eliminarCompra(compraAEliminar);
      if (resultado.success) {
        toast.success("Compra eliminada correctamente");
        handleCloseDeleteModal();
        cargarCompras();
      } else {
        toast.error(resultado.error || "Error al eliminar compra");
      }
    } catch (error) {
      toast.error("Error al eliminar compra");
    } finally {
      setLoading(false);
    }
  }

  // Calcular estadísticas
  const totalCompras = compras.length;
  const totalGastado = compras.reduce((sum, c) => sum + c.total, 0);
  const promedioCompra = totalCompras > 0 ? totalGastado / totalCompras : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-accent)' }}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Historial de Compras</h1>
                  <p className="text-gray-600">Consulta todas las compras registradas</p>
                </div>
              </div>
              <Link
                href="/dashboard/compras"
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                <ShoppingCart className="h-5 w-5" />
                Nueva Compra
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalCompras}</p>
                    <p className="text-sm text-gray-600">Total Compras</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 155, 14, 0.1)' }}>
                    <CreditCard className="h-6 w-6" style={{ color: 'var(--brand-accent)' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">S/ {totalGastado.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Gastado</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(8, 74, 30, 0.1)' }}>
                    <Calendar className="h-6 w-6" style={{ color: 'var(--brand-dark)' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      S/ {promedioCompra.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Promedio/Compra</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por proveedor, usuario o ID de compra..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabla de compras */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-accent)' }}></div>
              <p className="text-gray-600">Cargando compras...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Compra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comprasFiltradas.length > 0 ? (
                      comprasFiltradas.map((compra) => (
                        <tr key={compra.id_compra} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{compra.id_compra}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {compra.proveedor ? (
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: 'var(--brand-accent)' }}>
                                  {compra.proveedor.nombre.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {compra.proveedor.nombre}
                                  </div>
                                  {compra.proveedor.ruc && (
                                    <div className="text-xs text-gray-500">{compra.proveedor.ruc}</div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sin proveedor</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {compra.usuario?.nombre} {compra.usuario?.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(compra.fecha_compra).toLocaleDateString('es-ES')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-accent)' }}>
                              S/ {compra.total.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(compra)}
                                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                                title="Ver Detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(compra.id_compra, compra.proveedor?.nombre || "Sin proveedor")}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-gray-400" />
                            <p className="text-lg font-medium">No se encontraron compras</p>
                            <p className="text-sm">Intenta con otra búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Detalle de Compra */}
        <dialog id="modal_detalle_compra" className="modal">
          <div className="modal-box max-w-3xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-2xl mb-6 text-gray-800">
              Detalle de Compra #{compraSeleccionada?.id_compra || '...'}
            </h3>

            {loadingDetalle ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg" style={{ color: 'var(--brand-accent)' }}></span>
              </div>
            ) : compraSeleccionada && (
              <div className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Proveedor</p>
                    <p className="font-semibold text-gray-900">
                      {compraSeleccionada.proveedor?.nombre || "Sin proveedor"}
                    </p>
                    {compraSeleccionada.proveedor?.ruc && (
                      <p className="text-xs text-gray-500">{compraSeleccionada.proveedor.ruc}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Usuario</p>
                    <p className="font-semibold text-gray-900">
                      {compraSeleccionada.usuario?.nombre} {compraSeleccionada.usuario?.apellido}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {compraSeleccionada.fecha_compra ? new Date(compraSeleccionada.fecha_compra).toLocaleString('es-ES') : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--brand-accent)' }}>
                    Productos
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {compraSeleccionada.detalles && compraSeleccionada.detalles.length > 0 ? (
                          compraSeleccionada.detalles.map((detalle: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {detalle.producto?.nombre || `Producto #${detalle.id_producto}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.cantidad}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">S/ {detalle.precio_compra.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">S/ {detalle.subtotal.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                              No hay productos en esta compra
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold" style={{ color: 'var(--brand-dark)' }}>TOTAL:</span>
                    <span className="text-3xl font-bold" style={{ color: 'var(--brand-accent)' }}>
                      S/ {(compraSeleccionada.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-outline"
              >
                Cerrar
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Cerrar</button>
          </form>
        </dialog>

        {/* Modal Eliminar Compra */}
        <dialog id="modal_confirmar_eliminar" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar la compra <span className="font-semibold text-red-600">#{compraAEliminar}</span>?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción reducirá el stock de los productos y no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-error text-white"
                disabled={loading}
              >
                {loading ? (
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
