"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserProfileFromStorage } from "@/services/authService";
import type { Profile } from "@/types/database";

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const profile = getUserProfileFromStorage();
    if (profile) {
      setUserProfile(profile);
    }
  }, []);

  // Filtrar módulos según el rol del usuario
  const getModulesForRole = () => {
    const isAdmin = userProfile?.rol === 'ADMIN';
    
    // Módulos para VENDEDOR (solo ventas, clientes y productos en consulta)
    const vendedorModules = [
      {
        title: "Ventas",
        description: "Registro rápido de ventas",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        href: "/dashboard/ventas",
        bgColor: "bg-emerald-500",
      },
      {
        title: "Clientes",
        description: "Administrar base de clientes",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        href: "/dashboard/clientes",
        bgColor: "bg-blue-500",
      },
      {
        title: "Productos",
        description: "Inventario y catálogo",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        href: "/dashboard/productos",
        bgColor: "bg-pink-500",
        customBg: "none",
      },
    ];

    // Módulos adicionales solo para ADMIN
    const adminModules = [
      {
        title: "Compras",
        description: "Registrar compras e inventario",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
        href: "/dashboard/compras",
        bgColor: "bg-indigo-500",
          
      },
      {
        title: "Proveedores",
        description: "Gestionar proveedores y contactos",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        href: "/dashboard/proveedores",
        customBg: 'var(--brand-primary)',
        
      },
      {
        title: "Usuarios",
        description: "Administrar usuarios del sistema",
        icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        href: "/dashboard/usuarios",
        customBg: 'var(--brand-accent)',
      },
    ];

    return isAdmin ? [...vendedorModules, ...adminModules] : vendedorModules;
  };

  const modules = getModulesForRole();

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-gradient-to-br from-[#d63715] to-[#a82a11] hover:shadow-xl hover:scale-105";
      case "accent":
        return "bg-gradient-to-br from-[#fb9b0e] to-[#e88a00] hover:shadow-xl hover:scale-105";
      case "dark":
        return "bg-gradient-to-br from-[#084a1e] to-[#053316] hover:shadow-xl hover:scale-105";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar />

      {/* Banner Verde con Saludo */}
      <div className="relative rounded-2xl mx-64 mt-2" style={{ backgroundColor: 'var(--brand-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
          <div className="flex items-center justify-between ">
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-1">
                ¡Hola, {userProfile ? userProfile.nombre : 'Usuario'}!
              </h1>
              <p className="text-lg text-white/90">¿Qué te gustaría hacer hoy?</p>
            </div>
            {/* Emoji/Ilustración de tienda */}
            <Image src="/iconos/icono-dashboard.png" alt="Tienda" width={160} height={160} className=" " />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Accesos Rápidos Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="text-green-600 mr-2">●</span>
            Accesos Rápidos
          </h2>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Link key={index} href={module.href} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 group">
              <div className="flex flex-col items-center text-center space-y-3">
                <div 
                  className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform ${module.bgColor || ''}`}
                  style={module.customBg ? { backgroundColor: module.customBg } : {}}
                >
                  {module.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                  <p className="text-sm text-gray-500">{module.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
