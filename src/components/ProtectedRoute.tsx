"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getUserProfileFromStorage } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// Variable global para saber si ya se verificó la sesión
let sessionChecked = false;

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(!sessionChecked);
  const [isAuth, setIsAuth] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const authenticated = await isAuthenticated();
        console.log("ProtectedRoute - isAuthenticated:", authenticated);
        
        if (!authenticated) {
          console.log("No autenticado, redirigiendo a /login");
          sessionChecked = false;
          router.push("/login");
          return;
        }

        // Verificar permisos de rol
        const userProfile = getUserProfileFromStorage();
        const isAdmin = userProfile?.rol === 'ADMIN';

        // Rutas restringidas solo para ADMIN
        const adminRoutes = ['/dashboard/compras', '/dashboard/historial-compras', '/dashboard/proveedores', '/dashboard/usuarios'];
        const isAdminRoute = adminRoutes.some(route => pathname?.startsWith(route));

        if (isAdminRoute && !isAdmin) {
          console.log("Acceso denegado: VENDEDOR intentando acceder a ruta de ADMIN");
          router.push("/dashboard");
          return;
        }

        setIsAuth(true);
        
        // Si es la primera vez que se verifica, mostrar animación
        if (!sessionChecked) {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsChecking(false);
            sessionChecked = true;
          }, 600);
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        sessionChecked = false;
        router.push("/login");
      }
    }

    checkAuth();
  }, [router, pathname]);

  // Mostrar loading solo la primera vez
  if (isChecking) {
    return (
      <div 
        className={`min-h-screen flex items-center justify-center bg-gray-50 transition-opacity duration-500 ${
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

  // Mostrar contenido directamente (sin animación en navegaciones subsecuentes)
  return isAuth ? <>{children}</> : null;
}
