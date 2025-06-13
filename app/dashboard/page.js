'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getUserStats, getAgentsByCategory, supabase } from '../lib/supabase';
import { getCategoryStyles } from '../lib/categories';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
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

      // Cargar agentes populares para acciones rápidas (diversificados por categoría)
      const popularAgents = await getAgentsByCategory();

      // Seleccionar un agente por categoría para diversidad
      const categoriesRepresented = [];
      const diverseAgents = [];

      for (const agent of popularAgents) {
        const agentCategory = agent.category || 'Sin Categoría';
        if (
          !categoriesRepresented.includes(agentCategory) &&
          diverseAgents.length < 6
        ) {
          diverseAgents.push(agent);
          categoriesRepresented.push(agentCategory);
        }
      }

      // Si no tenemos suficientes, agregar más
      if (diverseAgents.length < 6) {
        for (const agent of popularAgents) {
          if (
            !diverseAgents.find((a) => a.id === agent.id) &&
            diverseAgents.length < 6
          ) {
            diverseAgents.push(agent);
          }
        }
      }

      setQuickActions(diverseAgents);
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
                              'es-AR',
                              {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
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
                <div className='text-center py-8'>
                  <div className='text-4xl mb-4'>💬</div>
                  <p className='text-gray-500 mb-4'>
                    No tenés conversaciones aún
                  </p>
                  <Link
                    href='/'
                    className='text-blue-600 hover:text-blue-700 font-medium'
                  >
                    ¡Empezá chateando con un agente! →
                  </Link>
                </div>
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
                  <Link
                    href='/pricing'
                    className='block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center'
                  >
                    Actualizar Plan
                  </Link>
                )}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                ⚡ Acciones Rápidas
              </h3>

              <div className='space-y-3'>
                {quickActions.map((agent) => {
                  const categoryStyles = getCategoryStyles(
                    agent.category || 'Sin Categoría'
                  );

                  return (
                    <Link
                      key={agent.id}
                      href={`/chat/${agent.id}`}
                      className='block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                          <span className='text-2xl mr-3'>{agent.emoji}</span>
                          <div>
                            <p className='font-medium text-sm'>{agent.name}</p>
                            <div className='flex items-center space-x-2'>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyles.bgClass} ${categoryStyles.textClass}`}
                              >
                                <span className='mr-1'>
                                  {categoryStyles.icon}
                                </span>
                                {agent.category || 'Sin Categoría'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <svg
                          className='w-4 h-4 text-gray-400'
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
                  );
                })}

                <Link
                  href='/'
                  className='block w-full text-center p-2 text-blue-600 hover:text-blue-700 text-sm font-medium'
                >
                  Ver todos los agentes →
                </Link>
              </div>
            </div>

            {/* Tips y ayuda */}
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6'>
              <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                💡 Tips para aprovechar al máximo
              </h3>
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  Sé específico en tus preguntas para mejores respuestas
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  Probá diferentes agentes según tu necesidad
                </li>
                <li className='flex items-start'>
                  <span className='text-blue-500 mr-2'>•</span>
                  Podés continuar conversaciones previas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
