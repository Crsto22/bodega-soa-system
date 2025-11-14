'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getProductos } from "@/services/productService";
import { getProveedores } from "@/services/proveedorService";
import { crearCompra } from "@/services/compraService";
import toast from "react-hot-toast";
import { 
  Search, 
  ShoppingCart, 
  Package, 
  Plus, 
  Minus, 
  Trash2,
  Box,
  CupSoda,
  Milk,
  Sandwich,
  Cookie
} from "lucide-react";

interface Producto {
  id_producto: number;
  nombre: string;
  precio_compra: number;
  stock: number;
  categoria?: string;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  ruc?: string;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export default function ComprasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Cargar productos y proveedores
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resultProductos, resultProveedores] = await Promise.all([
        getProductos(),
        getProveedores()
      ]);

      if (resultProductos.success && resultProductos.data) {
        setProductos(resultProductos.data);
        setProductosFiltrados(resultProductos.data);
      } else {
        toast.error('Error al cargar productos');
      }

      if (resultProveedores.success && resultProveedores.data) {
        setProveedores(resultProveedores.data);
      } else {
        toast.error('Error al cargar proveedores');
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (busqueda.trim() === "") {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
      );
      setProductosFiltrados(filtrados);
    }
  }, [busqueda, productos]);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = carrito.find(item => item.producto.id_producto === producto.id_producto);

    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.producto.id_producto === producto.id_producto
          ? {
              ...item,
              cantidad: item.cantidad + 1,
              subtotal: (item.cantidad + 1) * producto.precio_compra
            }
          : item
      ));
    } else {
      setCarrito([
        ...carrito,
        {
          producto,
          cantidad: 1,
          subtotal: producto.precio_compra
        }
      ]);
    }
  };

  // Modificar cantidad
  const modificarCantidad = (idProducto: number, delta: number) => {
    setCarrito(carrito.map(item => {
      if (item.producto.id_producto === idProducto) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad <= 0) return item; // No permitir cantidad negativa
        return {
          ...item,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * item.producto.precio_compra
        };
      }
      return item;
    }));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (idProducto: number) => {
    setCarrito(carrito.filter(item => item.producto.id_producto !== idProducto));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  };

  // Procesar compra
  const procesarCompra = async () => {
    if (carrito.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      toast.error("Usuario no autenticado");
      return;
    }

    const { id: userId } = JSON.parse(userProfile);

    setProcesando(true);
    const datosCompra = {
      id_proveedor: proveedorSeleccionado,
      id_usuario: userId,
      productos: carrito.map(item => ({
        id_producto: item.producto.id_producto,
        cantidad: item.cantidad,
        precio_compra: item.producto.precio_compra
      }))
    };

    const resultado = await crearCompra(datosCompra);
    setProcesando(false);

    if (resultado.success) {
      toast.success("Compra registrada exitosamente");
      setCarrito([]);
      setProveedorSeleccionado(null);
      await cargarDatos(); // Recargar productos para actualizar stock
    } else {
      toast.error(resultado.error || "Error al registrar compra");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Layout Principal: 2 Columnas */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* COLUMNA IZQUIERDA: Productos (70%) */}
          <div className="w-[70%] p-6 overflow-y-auto">
            {/* Buscador y Botón Historial */}
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-(--brand-accent) text-lg shadow-sm"
                />
              </div>
              <Link
                href="/dashboard/historial-compras"
                className="px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Historial
              </Link>
            </div>

            {/* Grid de Productos */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg" style={{ color: 'var(--brand-accent)' }}></span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4">
                  {productosFiltrados.map((producto) => {
                    const IconComponent = 
                      producto.categoria === "Bebidas" ? CupSoda :
                      producto.categoria === "Abarrotes" ? Package :
                      producto.categoria === "Lácteos" ? Milk :
                      producto.categoria === "Panadería" ? Sandwich :
                      producto.categoria === "Snacks" ? Cookie :
                      producto.categoria === "Conservas" ? Box : Package;
                    
                    return (
                      <div
                        key={producto.id_producto}
                        onClick={() => agregarAlCarrito(producto)}
                        className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-(--brand-accent) group"
                      >
                        {/* Icono del producto */}
                        <div 
                          className="w-full h-24 rounded-lg flex items-center justify-center mb-3 transition-colors"
                          style={{ backgroundColor: 'rgba(251, 155, 14, 0.1)' }}
                        >
                          <IconComponent 
                            className="h-12 w-12"
                            style={{ color: 'var(--brand-accent)' }}
                          />
                        </div>
                        
                        {/* Nombre */}
                        <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 h-10">
                          {producto.nombre}
                        </h3>
                        
                        {/* Precio */}
                        <p className="text-lg font-bold mb-2" style={{ color: 'var(--brand-dark)' }}>
                          S/ {producto.precio_compra.toFixed(2)}
                        </p>
                        
                        {/* Stock */}
                        <div className="flex items-center gap-1 text-sm">
                          <Package className="h-4 w-4" style={{ color: producto.stock < 10 ? 'var(--brand-primary)' : 'gray' }} />
                          <span className={producto.stock < 10 ? 'font-semibold' : ''} style={{ color: producto.stock < 10 ? 'var(--brand-primary)' : 'gray' }}>
                            {producto.stock} unid
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {productosFiltrados.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No se encontraron productos</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* COLUMNA DERECHA: Carrito (30%) */}
          <div className="w-[30%] bg-white border-l border-gray-200 flex flex-col">
            {/* Header del Carrito */}
            <div className="p-4 border-b border-gray-200" style={{ backgroundColor: 'rgba(251, 155, 14, 0.05)' }}>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--brand-accent)' }}>
                <ShoppingCart className="h-6 w-6" />
                Carrito de Compra
              </h2>
              
              {/* Selector de Proveedor */}
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <select
                  value={proveedorSeleccionado || ""}
                  onChange={(e) => setProveedorSeleccionado(e.target.value ? parseInt(e.target.value) : null)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-(--brand-accent) cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                      {proveedor.nombre} {proveedor.ruc ? `(${proveedor.ruc})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Productos en el Carrito */}
            <div className="flex-1 overflow-y-auto p-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="h-24 w-24 mb-4" />
                  <p className="text-lg font-semibold">Carrito vacío</p>
                  <p className="text-sm mt-2">Selecciona productos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.producto.id_producto} className="bg-white border-2 border-gray-100 rounded-lg p-3 hover:border-(--brand-accent) transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm flex-1">{item.producto.nombre}</h4>
                        <button
                          onClick={() => eliminarDelCarrito(item.producto.id_producto)}
                          className="hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--brand-primary)' }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, -1)}
                            className="btn btn-xs btn-circle"
                            style={{ backgroundColor: 'var(--brand-accent)', color: 'white', border: 'none' }}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                          <button
                            onClick={() => modificarCantidad(item.producto.id_producto, 1)}
                            className="btn btn-xs btn-circle"
                            style={{ backgroundColor: 'var(--brand-dark)', color: 'white', border: 'none' }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">S/ {item.producto.precio_compra.toFixed(2)} c/u</p>
                          <p className="font-bold text-lg" style={{ color: 'var(--brand-dark)' }}>
                            S/ {item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen y Pago */}
            {carrito.length > 0 && (
              <div className="border-t-2 p-4 space-y-4" style={{ borderColor: 'var(--brand-accent)' }}>
                {/* Total */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold" style={{ color: 'var(--brand-dark)' }}>TOTAL:</span>
                    <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                      S/ {calcularTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-2">
                  <button
                    onClick={() => setCarrito([])}
                    className="btn w-full bg-red-500 text-white hover:opacity-80 transition-opacity"
                  >
                    <Trash2 className="h-5 w-5" />
                    Cancelar
                  </button>
                  <button
                    onClick={procesarCompra}
                    disabled={procesando}
                    className="btn w-full text-white text-lg font-bold hover:opacity-90 transition-opacity shadow-lg"
                    style={{ backgroundColor: 'var(--brand-accent)' }}
                  >
                    {procesando ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <ShoppingCart className="h-6 w-6" />
                    )}
                    {procesando ? 'PROCESANDO...' : `REGISTRAR S/ ${calcularTotal().toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
