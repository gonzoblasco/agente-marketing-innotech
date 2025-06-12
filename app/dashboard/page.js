'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getUserStats, supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    }
  }, [isLoaded, user]);

  const loadUserData = async () => {
    try {
      // Cargar estadísticas del usuario
      const userStats = await getUserStats(user.id);
      setStats(userStats);

      // Cargar conversaciones recientes
      const { data: userConversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      setConversations(userConversations || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const usagePercentage = stats
    ? (stats.messages_used / stats.messages_limit) * 100
    : 0;
  const remainingMessages = stats
    ? stats.messages_limit - stats.messages_used
    : 0;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link href='/' className='text-blue-600 hover:text-blue-700'>
                ← Volver a Galería
              </Link>
              <h1 className='text-2xl font-bold text-gray-800'>Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Saludo */}
        <div className='mb-8'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            ¡Hola {user.firstName}! 👋
          </h2>
          <p className='text-gray-600'>
            Acá podés ver tu actividad y gestionar tu plan de InnoTech Solutions
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Columna principal */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Estadísticas de uso */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                📊 Uso de Mensajes
              </h3>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Mensajes utilizados
                  </span>
                  <span className='font-semibold'>
                    {stats?.messages_used || 0} / {stats?.messages_limit || 100}
                  </span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      usagePercentage > 80
                        ? 'bg-red-500'
                        : usagePercentage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>

                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-500'>
                    {remainingMessages} mensajes restantes
                  </span>
                  <span
                    className={`font-medium ${
                      usagePercentage > 80
                        ? 'text-red-600'
                        : usagePercentage > 60
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {usagePercentage.toFixed(0)}% usado
                  </span>
                </div>
              </div>
            </div>

            {/* Conversaciones recientes */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                💬 Conversaciones Recientes
              </h3>

              {conversations.length > 0 ? (
                <div className='space-y-3'>
                  {conversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={`/chat/${conv.agent_id}`}
                      className='block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='font-medium text-gray-800'>
                            {conv.title || `Chat con ${conv.agent_id}`}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {new Date(conv.updated_at).toLocaleDateString(
                              'es-AR'
                            )}
                          </p>
                        </div>
                        <svg
                          className='w-5 h-5 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500 text-center py-4'>
                  No tenés conversaciones aún. ¡Empezá chateando con un agente!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Plan actual */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                🎯 Tu Plan
              </h3>

              <div className='text-center'>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                    stats?.plan === 'elite'
                      ? 'bg-purple-100 text-purple-800'
                      : stats?.plan === 'pro'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Plan {stats?.plan?.toUpperCase() || 'LITE'}
                </div>

                <p className='text-sm text-gray-600 mb-4'>
                  {stats?.messages_limit || 100} mensajes por mes
                </p>

                {stats?.plan === 'lite' && (
                  <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'>
                    Actualizar Plan
                  </button>
                )}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                ⚡ Acciones Rápidas
              </h3>

              <div className='space-y-3'>
                <Link
                  href='/chat/marketing-digital'
                  className='block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                >
                  <div className='flex items-center'>
                    <span className='text-2xl mr-3'>🎯</span>
                    <div>
                      <p className='font-medium'>Marketing Digital</p>
                      <p className='text-xs text-gray-500'>
                        Estrategias para PyMEs
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href='/chat/mentor-productividad'
                  className='block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                >
                  <div className='flex items-center'>
                    <span className='text-2xl mr-3'>⚡</span>
                    <div>
                      <p className='font-medium'>Productividad</p>
                      <p className='text-xs text-gray-500'>
                        Organización personal
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href='/'
                  className='block w-full text-center p-2 text-blue-600 hover:text-blue-700 text-sm'
                >
                  Ver todos los agentes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
