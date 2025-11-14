"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, isAuthenticated } from "@/services/authService";
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const router = useRouter();

  // Verificar si ya está autenticado al cargar la página
  useEffect(() => {
    async function checkAuth() {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        console.log("Ya está autenticado, redirigiendo a dashboard");
        router.push("/dashboard");
      } else {
        // Iniciar animación de desenfoque
        setIsFadingOut(true);
        // Esperar a que termine la animación
        setTimeout(() => {
          setChecking(false);
        }, 600);
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Mostrar toast de carga
    const loadingToast = toast.loading('Iniciando sesión...');

    try {
      console.log("Intentando login con:", email);
      const result = await signIn(email, password);
      console.log("Resultado del login:", result);

      // Remover toast de carga
      toast.dismiss(loadingToast);

      if (result.success) {
        console.log("Login exitoso, redirigiendo a dashboard...");
        
        // Mostrar toast de éxito
        toast.success('¡Bienvenido! Redirigiendo...');
        
        // Pequeña pausa para mostrar el toast
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usar window.location para forzar una navegación completa
        window.location.href = "/dashboard";
      } else {
        // Mostrar toast de error
        toast.error(result.message);
      }
    } catch (err) {
      // Remover toast de carga
      toast.dismiss(loadingToast);
      
      console.error("Error en login:", err);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  // Mostrar loading mientras verifica autenticación
  if (checking) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center bg-gray-200 transition-opacity duration-500 ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="animate-pulse">
          <img 
            src="/la-bodega.png" 
            alt="La Bodega" 
            width={150} 
            height={150} 
            className="object-contain" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-200">
      <div className="max-w-sm w-full bg-white shadow-xl rounded-3xl p-8 relative">
        {/* Logo en círculo rojo centrado arriba */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="h-30 w-30 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--brand-accent)' }}>
            <Image src="/la-bodega.png" alt="La Bodega" width={90} height={90} className="object-contain" />
          </div>
        </div>

        <form className="mt-16" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent focus:bg-white transition-all"
                placeholder="Usuario"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--brand-accent) focus:border-transparent focus:bg-white transition-all"
                placeholder="Contraseña"
              />
            </div>

            <div className="flex items-center text-xs text-gray-500">
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn border-none w-full flex justify-center py-3 px-4 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              style={{ backgroundColor: 'var(--brand-dark)', color: 'white' }}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
