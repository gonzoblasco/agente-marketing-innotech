'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { isUserAdmin } from '../../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && user) {
      checkAdminAccess();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

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
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            Acceso Denegado
          </h1>
          <p className='text-gray-600'>
            Necesitas iniciar sesión para acceder al panel de admin.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            🚫 Acceso Denegado
          </h1>
          <p className='text-gray-600 mb-4'>
            No tienes permisos de administrador.
          </p>
          <Link
            href='/'
            className='text-blue-600 hover:text-blue-700 underline'
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
      {/* Top bar */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link href='/' className='text-blue-600 hover:text-blue-700'>
                ← InnoTech Solutions
              </Link>
              <h1 className='text-2xl font-bold text-gray-800'>
                Panel de Admin
              </h1>
            </div>
            <div className='text-sm text-gray-600'>
              Admin: {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex gap-8'>
          {/* Sidebar */}
          <div className='w-64'>
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

          {/* Main content */}
          <div className='flex-1'>{children}</div>
        </div>
      </div>
    </div>
  );
}
