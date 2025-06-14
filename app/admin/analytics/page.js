'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    users: {
      total: 0,
      newToday: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      byPlan: { lite: 0, pro: 0, elite: 0 },
    },
    messages: {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      averagePerUser: 0,
    },
    agents: {
      total: 0,
      mostUsed: [],
      leastUsed: [],
    },
    revenue: {
      mrr: 0,
      thisMonth: 0,
      projectedAnnual: 0,
      conversionRate: 0,
    },
    engagement: {
      activeUsers: 0,
      averageSessionLength: 0,
      returnRate: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Fechas para filtros
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 1. ANÁLISIS DE USUARIOS
      const { data: allUsers } = await supabase.from('users').select('*');

      const { data: newUsersToday } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', today.toISOString());

      const { data: newUsersWeek } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', weekAgo.toISOString());

      const { data: newUsersMonth } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', monthAgo.toISOString());

      // 2. ANÁLISIS DE MENSAJES
      const { data: allMessages } = await supabase.from('messages').select('*');

      const { data: messagesToday } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', today.toISOString());

      const { data: messagesWeek } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', weekAgo.toISOString());

      const { data: messagesMonth } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', monthAgo.toISOString());

      // 3. ANÁLISIS DE AGENTES MÁS USADOS
      const { data: conversationsByAgent } = await supabase
        .from('conversations')
        .select('agent_id');

      // 4. ANÁLISIS DE INGRESOS (estimado)
      const planPrices = { lite: 0, pro: 30000, elite: 60000 };
      const usersByPlan = {
        lite: allUsers?.filter((u) => !u.plan || u.plan === 'lite').length || 0,
        pro: allUsers?.filter((u) => u.plan === 'pro').length || 0,
        elite: allUsers?.filter((u) => u.plan === 'elite').length || 0,
      };

      const mrr =
        usersByPlan.pro * planPrices.pro + usersByPlan.elite * planPrices.elite;

      // 5. MÉTRICAS DE ENGAGEMENT
      const activeUsers =
        allUsers?.filter((u) => u.messages_used > 0).length || 0;
      const totalUsers = allUsers?.length || 1;
      const conversionRate = (
        ((usersByPlan.pro + usersByPlan.elite) / totalUsers) *
        100
      ).toFixed(1);

      // 6. AGENTES MÁS USADOS
      const agentUsage = {};
      conversationsByAgent?.forEach((conv) => {
        agentUsage[conv.agent_id] = (agentUsage[conv.agent_id] || 0) + 1;
      });

      const { data: agents } = await supabase
        .from('agents')
        .select('id, name, emoji');

      const agentsWithUsage =
        agents
          ?.map((agent) => ({
            ...agent,
            usage: agentUsage[agent.id] || 0,
          }))
          .sort((a, b) => b.usage - a.usage) || [];

      setAnalytics({
        users: {
          total: allUsers?.length || 0,
          newToday: newUsersToday?.length || 0,
          newThisWeek: newUsersWeek?.length || 0,
          newThisMonth: newUsersMonth?.length || 0,
          byPlan: usersByPlan,
        },
        messages: {
          total: allMessages?.length || 0,
          today: messagesToday?.length || 0,
          thisWeek: messagesWeek?.length || 0,
          thisMonth: messagesMonth?.length || 0,
          averagePerUser:
            totalUsers > 0
              ? ((allMessages?.length || 0) / totalUsers).toFixed(1)
              : 0,
        },
        agents: {
          total: agents?.length || 0,
          mostUsed: agentsWithUsage.slice(0, 5),
          leastUsed: agentsWithUsage.slice(-3).reverse(),
        },
        revenue: {
          mrr: mrr,
          thisMonth: mrr, // Simplificado
          projectedAnnual: mrr * 12,
          conversionRate: conversionRate,
        },
        engagement: {
          activeUsers: activeUsers,
          averageSessionLength: 'N/A', // Requiere tracking adicional
          returnRate:
            totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        },
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthIndicator = (current, previous) => {
    if (previous === 0) return { percentage: 0, trend: 'neutral' };
    const growth = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(growth).toFixed(1),
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral',
    };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>
            📊 Analytics Dashboard
          </h2>
          <p className='text-gray-600'>
            Métricas de rendimiento de InnoTech Solutions
          </p>
        </div>

        <div className='flex space-x-2'>
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d'
                ? 'Última semana'
                : range === '30d'
                ? 'Último mes'
                : 'Últimos 3 meses'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Usuarios Totales */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Usuarios Totales</p>
              <p className='text-2xl font-bold text-gray-800'>
                {analytics.users.total}
              </p>
              <p className='text-xs text-green-600 mt-1'>
                +{analytics.users.newThisMonth} este mes
              </p>
            </div>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <span className='text-2xl'>👥</span>
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>MRR (Ingresos Mensuales)</p>
              <p className='text-2xl font-bold text-gray-800'>
                {formatCurrency(analytics.revenue.mrr)}
              </p>
              <p className='text-xs text-green-600 mt-1'>
                Proyección anual:{' '}
                {formatCurrency(analytics.revenue.projectedAnnual)}
              </p>
            </div>
            <div className='p-2 bg-green-100 rounded-lg'>
              <span className='text-2xl'>💰</span>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Mensajes Totales</p>
              <p className='text-2xl font-bold text-gray-800'>
                {analytics.messages.total}
              </p>
              <p className='text-xs text-blue-600 mt-1'>
                {analytics.messages.thisMonth} este mes
              </p>
            </div>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <span className='text-2xl'>💬</span>
            </div>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Tasa de Conversión</p>
              <p className='text-2xl font-bold text-gray-800'>
                {analytics.revenue.conversionRate}%
              </p>
              <p className='text-xs text-orange-600 mt-1'>
                {analytics.users.byPlan.pro + analytics.users.byPlan.elite}{' '}
                usuarios de pago
              </p>
            </div>
            <div className='p-2 bg-orange-100 rounded-lg'>
              <span className='text-2xl'>📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de Planes y Agentes Más Usados */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Distribución de Planes */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            💎 Distribución de Planes
          </h3>
          <div className='space-y-4'>
            {Object.entries(analytics.users.byPlan).map(([plan, count]) => {
              const percentage =
                analytics.users.total > 0
                  ? ((count / analytics.users.total) * 100).toFixed(1)
                  : 0;
              const colors = {
                lite: 'bg-gray-500',
                pro: 'bg-blue-500',
                elite: 'bg-purple-500',
              };

              return (
                <div key={plan} className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`w-3 h-3 rounded-full ${colors[plan]}`}
                    ></div>
                    <span className='font-medium capitalize'>{plan}</span>
                  </div>
                  <div className='text-right'>
                    <span className='font-bold'>{count}</span>
                    <span className='text-sm text-gray-500 ml-2'>
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agentes Más Usados */}
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            🤖 Agentes Más Usados
          </h3>
          <div className='space-y-3'>
            {analytics.agents.mostUsed.slice(0, 5).map((agent, index) => (
              <div key={agent.id} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <span className='text-lg'>{agent.emoji}</span>
                  <span className='font-medium'>{agent.name}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='font-bold'>{agent.usage}</span>
                  <span className='text-sm text-gray-500'>conversaciones</span>
                </div>
              </div>
            ))}
            {analytics.agents.mostUsed.length === 0 && (
              <p className='text-gray-500 text-center py-4'>
                No hay datos de uso aún
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas de Engagement */}
      <div className='bg-white rounded-lg shadow-sm border p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          ⚡ Métricas de Engagement
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-blue-600'>
              {analytics.engagement.activeUsers}
            </p>
            <p className='text-sm text-gray-600'>Usuarios Activos</p>
            <p className='text-xs text-gray-500 mt-1'>
              {analytics.engagement.returnRate}% de tasa de actividad
            </p>
          </div>

          <div className='text-center'>
            <p className='text-2xl font-bold text-green-600'>
              {analytics.messages.averagePerUser}
            </p>
            <p className='text-sm text-gray-600'>Mensajes por Usuario</p>
            <p className='text-xs text-gray-500 mt-1'>Promedio histórico</p>
          </div>

          <div className='text-center'>
            <p className='text-2xl font-bold text-purple-600'>
              {analytics.agents.total}
            </p>
            <p className='text-sm text-gray-600'>Agentes Disponibles</p>
            <p className='text-xs text-gray-500 mt-1'>En el catálogo</p>
          </div>
        </div>
      </div>

      {/* Botón de Actualizar */}
      <div className='text-center'>
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
        >
          {loading ? 'Actualizando...' : '🔄 Actualizar Datos'}
        </button>
      </div>
    </div>
  );
}
