'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, supabase } from '../lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total usuarios
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Total conversaciones
      const { count: totalConversations } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      // Total mensajes
      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Usuarios activos
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('messages_used', 0);

      setStats({
        totalUsers: totalUsers || 0,
        totalConversations: totalConversations || 0,
        totalMessages: totalMessages || 0,
        activeUsers: activeUsers || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2'>
          Dashboard Admin
        </h2>
        <p className='text-sm sm:text-base text-gray-600'>
          Resumen general de InnoTech Solutions
        </p>
      </div>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
        {/* Card Total Usuarios */}
        <div className='bg-white rounded-lg shadow-sm border p-3 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-1.5 sm:p-2 bg-blue-100 rounded-lg'>
              <span className='text-lg sm:text-2xl'>👥</span>
            </div>
            <div className='ml-2 sm:ml-4'>
              <p className='text-xs sm:text-sm text-gray-600'>Total Usuarios</p>
              <p className='text-lg sm:text-2xl font-bold text-gray-800'>
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>

        {/* Card Conversaciones */}
        <div className='bg-white rounded-lg shadow-sm border p-3 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-1.5 sm:p-2 bg-green-100 rounded-lg'>
              <span className='text-lg sm:text-2xl'>💬</span>
            </div>
            <div className='ml-2 sm:ml-4'>
              <p className='text-xs sm:text-sm text-gray-600'>Conversaciones</p>
              <p className='text-lg sm:text-2xl font-bold text-gray-800'>
                {stats.totalConversations}
              </p>
            </div>
          </div>
        </div>

        {/* Card Total Mensajes */}
        <div className='bg-white rounded-lg shadow-sm border p-3 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-1.5 sm:p-2 bg-purple-100 rounded-lg'>
              <span className='text-lg sm:text-2xl'>📝</span>
            </div>
            <div className='ml-2 sm:ml-4'>
              <p className='text-xs sm:text-sm text-gray-600'>Total Mensajes</p>
              <p className='text-lg sm:text-2xl font-bold text-gray-800'>
                {stats.totalMessages}
              </p>
            </div>
          </div>
        </div>

        {/* Card Usuarios Activos */}
        <div className='bg-white rounded-lg shadow-sm border p-3 sm:p-6'>
          <div className='flex items-center'>
            <div className='p-1.5 sm:p-2 bg-yellow-100 rounded-lg'>
              <span className='text-lg sm:text-2xl'>⚡</span>
            </div>
            <div className='ml-2 sm:ml-4'>
              <p className='text-xs sm:text-sm text-gray-600'>
                Usuarios Activos
              </p>
              <p className='text-lg sm:text-2xl font-bold text-gray-800'>
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas - Mobile optimizado */}
      <div className='bg-white rounded-lg shadow-sm border p-4 sm:p-6'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4'>
          ⚡ Acciones Rápidas
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
          <Link href='/admin/agents' className='block'>
            <div className='p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer'>
              <div className='font-medium text-gray-800 text-sm sm:text-base'>
                Crear Nuevo Agente
              </div>
              <div className='text-xs sm:text-sm text-gray-500'>
                Agregar agente especializado
              </div>
            </div>
          </Link>

          <Link href='/admin/users' className='block'>
            <div className='p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer'>
              <div className='font-medium text-gray-800 text-sm sm:text-base'>
                Gestionar Usuarios
              </div>
              <div className='text-xs sm:text-sm text-gray-500'>
                Ver y editar usuarios
              </div>
            </div>
          </Link>

          <Link href='/admin/analytics' className='block'>
            <div className='p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer'>
              <div className='font-medium text-gray-800 text-sm sm:text-base'>
                Ver Analytics
              </div>
              <div className='text-xs sm:text-sm text-gray-500'>
                Métricas detalladas
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
