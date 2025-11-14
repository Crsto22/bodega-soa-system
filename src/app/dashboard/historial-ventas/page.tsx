"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getVentas, eliminarVenta, getVentaById } from "@/services/ventaService";
import toast from "react-hot-toast";
import type { VentaConDetalles } from "@/types/database";
import { Search, ShoppingCart, User, Calendar, CreditCard, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<VentaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConDetalles | null>(null);
  const [ventaAEliminar, setVentaAEliminar] = useState<{ id: number; cliente: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  async function cargarVentas() {
    setLoading(true);
    try {
      const resultado = await getVentas();
      if (resultado.success && resultado.data) {
        setVentas(resultado.data);
      } else {
        toast.error(resultado.error || "Error al cargar ventas");
      }
    } catch (error) {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenModal(venta: VentaConDetalles) {
    setLoadingDetalle(true);
    (document.getElementById('modal_detalle') as HTMLDialogElement)?.showModal();
    
    try {
      const resultado = await getVentaById(venta.id_venta);
      if (resultado.success && resultado.data) {
        setVentaSeleccionada(resultado.data);
      } else {
        toast.error(resultado.error || "Error al cargar detalles");
        handleCloseModal();
      }
    } catch (error) {
      toast.error("Error al cargar detalles de la venta");
      handleCloseModal();
    } finally {
      setLoadingDetalle(false);
    }
  }

  function handleCloseModal() {
    (document.getElementById('modal_detalle') as HTMLDialogElement)?.close();
    setVentaSeleccionada(null);
  }

  function handleOpenDeleteModal(id: number, cliente: string) {
    setVentaAEliminar({ id, cliente });
    (document.getElementById('modal_delete') as HTMLDialogElement)?.showModal();
  }

  function handleCloseDeleteModal() {
    (document.getElementById('modal_delete') as HTMLDialogElement)?.close();
    setVentaAEliminar(null);
  }

  async function handleConfirmDelete() {
    if (!ventaAEliminar) return;

    setDeleting(true);
    try {
      const resultado = await eliminarVenta(ventaAEliminar.id);
      if (resultado.success) {
        toast.success("Venta eliminada correctamente");
        handleCloseDeleteModal();
        cargarVentas();
      } else {
        toast.error(resultado.error || "Error al eliminar venta");
      }
    } catch (error) {
      toast.error("Error al eliminar venta");
    } finally {
      setDeleting(false);
    }
  }

  const filteredVentas = ventas.filter(venta =>
    venta.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venta.id_venta.toString().includes(searchTerm)
  );

  const totalVentas = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
  const ventasEfectivo = ventas.filter(v => v.metodo_pago === "EFECTIVO").reduce((sum, v) => sum + (v.total || 0), 0);
  const ventasDigitales = ventas.filter(v => v.metodo_pago !== "EFECTIVO").reduce((sum, v) => sum + (v.total || 0), 0);

  function getMetodoPagoColor(metodo?: string) {
    switch (metodo) {
      case "EFECTIVO": return "badge-success";
      case "YAPE": return "badge-warning";
      case "IZIPAY": return "badge-info";
      case "TRANSFERENCIA": return "badge-primary";
      default: return "badge-ghost";
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-dark)' }}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
                  <p className="text-gray-600">Consulta todas las ventas registradas</p>
                </div>
              </div>
              <Link
                href="/dashboard/ventas"
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: 'var(--brand-dark)' }}
              >
                <ShoppingCart className="h-5 w-5" />
                Nueva Venta
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
                    <p className="text-2xl font-bold text-gray-900">{ventas.length}</p>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(251, 155, 14, 0.1)' }}>
                    <CreditCard className="h-6 w-6" style={{ color: 'var(--brand-accent)' }} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">S/ {totalVentas.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Ingresos Totales</p>
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
                      S/ {(totalVentas / (ventas.length || 1)).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Promedio/Venta</p>
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
                placeholder="Buscar por cliente, vendedor o ID de venta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent"
              />
            </div>
          </div>

          {/* Tabla de ventas */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-accent)' }}></div>
              <p className="text-gray-600">Cargando ventas...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Venta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método Pago
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
                    {filteredVentas.length > 0 ? (
                      filteredVentas.map((venta) => (
                        <tr key={venta.id_venta} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{venta.id_venta}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: 'var(--brand-accent)' }}>
                                {venta.cliente?.nombre ? venta.cliente.nombre.charAt(0) : 'G'}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {venta.cliente?.nombre || "Cliente Genérico"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {venta.usuario?.nombre || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString('es-ES') : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge ${getMetodoPagoColor(venta.metodo_pago)}`}>
                              {venta.metodo_pago || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-dark)' }}>
                              S/ {(venta.total || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenModal(venta)}
                                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                                title="Ver Detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(venta.id_venta, venta.cliente?.nombre || "Cliente Genérico")}
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
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-12 w-12 text-gray-400" />
                            <p className="text-lg font-medium">No se encontraron ventas</p>
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

        {/* Modal Detalle de Venta */}
        <dialog id="modal_detalle" className="modal">
          <div className="modal-box max-w-3xl">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <h3 className="font-bold text-2xl mb-6 text-gray-800">
              Detalle de Venta #{ventaSeleccionada?.id_venta || '...'}
            </h3>

            {loadingDetalle ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg" style={{ color: 'var(--brand-accent)' }}></span>
              </div>
            ) : ventaSeleccionada && (
              <div className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Cliente</p>
                    <p className="font-semibold text-gray-900">
                      {ventaSeleccionada.cliente?.nombre || "Cliente Genérico"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Vendedor</p>
                    <p className="font-semibold text-gray-900">
                      {ventaSeleccionada.usuario?.nombre || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {ventaSeleccionada.fecha_venta ? new Date(ventaSeleccionada.fecha_venta).toLocaleString('es-ES') : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Método de Pago</p>
                    <span className={`badge ${getMetodoPagoColor(ventaSeleccionada.metodo_pago)}`}>
                      {ventaSeleccionada.metodo_pago || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--brand-dark)' }}>
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
                        {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 ? (
                          ventaSeleccionada.detalles.map((detalle: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {detalle.producto?.nombre || `Producto #${detalle.id_producto}`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{detalle.cantidad}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">S/ {detalle.precio_unitario.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">S/ {detalle.subtotal.toFixed(2)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-sm text-gray-500 text-center">
                              No hay productos en esta venta
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
                    <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                      S/ {(ventaSeleccionada.total || 0).toFixed(2)}
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

        {/* Modal Eliminar Venta */}
        <dialog id="modal_delete" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-xl mb-4">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Estás seguro de eliminar la venta <span className="font-semibold text-red-600">#{ventaAEliminar?.id}</span> del cliente <span className="font-semibold text-red-600">"{ventaAEliminar?.cliente}"</span>?
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción restaurará el stock de los productos y no se puede deshacer.
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
