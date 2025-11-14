"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getUserProfileFromStorage } from "@/services/authService";
import type { Profile } from "@/types/database";

interface NavbarProps {
  userName?: string;
  userInitial?: string;
}

export default function Navbar({ userName, userInitial }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const router = useRouter();

  // Cargar perfil del usuario desde localStorage
  useEffect(() => {
    const profile = getUserProfileFromStorage();
    if (profile) {
      setUserProfile(profile);
    }
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const result = await signOut();
      if (result.success) {
        setUserProfile(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
      setIsUserMenuOpen(false);
    }
  }

  // Obtener nombre completo y inicial del usuario
  const displayName = userName || (userProfile ? `${userProfile.nombre} ${userProfile.apellido || ''}`.trim() : 'Usuario');
  const displayInitial = userInitial || (userProfile ? userProfile.nombre.charAt(0).toUpperCase() : 'U');
  const displayRole = userProfile?.rol || 'USER';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Menu Icon + Logo */}
          <div className="flex items-center space-x-4">
            {/* Menu hamburger icon */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src="/la-bodega.png"
                  alt="La Bodega"
                  width={35}
                  height={35}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Right Section: Home Icon + User */}
          <div className="flex items-center space-x-4">
            {/* Home Icon */}
            <Link
              href="/dashboard"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Inicio"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>

            {/* User Section */}
            <div className="relative flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: 'var(--brand-dark)' }}
                aria-label="Menú de usuario"
              >
                {displayInitial}
              </button>

              {/* Dropdown User Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{displayRole}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cerrando...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu (opcional - se puede expandir) */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/dashboard/clientes"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Clientes
            </Link>
            <Link
              href="/dashboard/ventas"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Ventas
            </Link>
            <Link
              href="/dashboard/compras"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Compras
            </Link>
            <Link
              href="/dashboard/proveedores"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Proveedores
            </Link>
            <Link
              href="/dashboard/productos"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Productos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
