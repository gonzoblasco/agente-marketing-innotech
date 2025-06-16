'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { isUserAdmin } from '../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && user) {
      checkAdminAccess();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const checkAdminAccess = async () => {
    try {
      const adminStatus = await isUserAdmin(user.id);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='text-center'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-4'>
            Acceso Denegado
          </h1>
          <p className='text-sm sm:text-base text-gray-600'>
            Necesitas iniciar sesión para acceder al panel de admin.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='text-center'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mb-4'>
            🚫 Acceso Denegado
          </h1>
          <p className='text-sm sm:text-base text-gray-600 mb-4'>
            No tienes permisos de administrador.
          </p>
          <Link
            href='/'
            className='text-blue-600 hover:text-blue-700 underline text-sm sm:text-base'
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Usuarios', href: '/admin/users', icon: '👥' },
    { name: 'Agentes', href: '/admin/agents', icon: '🤖' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Top bar - Mobile optimizado */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-3 sm:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              >
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  ) : (
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 6h16M4 12h16M4 18h16'
                    />
                  )}
                </svg>
              </button>

              <Link
                href='/'
                className='text-blue-600 hover:text-blue-700 text-sm sm:text-base'
              >
                ← <span className='hidden sm:inline'>InnoTech Solutions</span>
                <span className='sm:hidden'>Inicio</span>
              </Link>
              <h1 className='text-lg sm:text-2xl font-bold text-gray-800'>
                <span className='hidden sm:inline'>Panel de Admin</span>
                <span className='sm:hidden'>Admin</span>
              </h1>
            </div>
            <div className='text-xs sm:text-sm text-gray-600'>
              <span className='hidden sm:inline'>Admin:</span> {user.firstName}
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {mobileMenuOpen && (
        <div className='sm:hidden bg-white border-b shadow-lg'>
          <nav className='px-4 py-2 space-y-1'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className='mr-3 text-lg'>{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className='max-w-7xl mx-auto px-4 py-4 sm:py-8'>
        <div className='flex gap-4 sm:gap-8'>
          {/* Sidebar - Solo desktop */}
          <div className='hidden sm:block w-64'>
            <nav className='space-y-2'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className='mr-3'>{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content - Full width en móvil */}
          <div className='flex-1 min-w-0'>{children}</div>
        </div>
      </div>
    </div>
  );
}
