'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { getAgentsByCategory, isUserAdmin } from '../lib/supabase';
import { getCategoryStyles } from '../lib/categories';
import AgentCard from './AgentCard';
import Link from 'next/link';

// Componente AdminButton con Font Awesome
function AdminButton({ userId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await isUserAdmin(userId);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <Link
      href='/admin'
      className='inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium mr-3'
    >
      <i className='fas fa-cog mr-2'></i>
      Administración
    </Link>
  );
}

export default function AgentGallery() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [categories, setCategories] = useState(['Todas']);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAgents();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading categories and agents...');

      const allAgentsData = await getAgentsByCategory(null);

      const sortedAgents = (allAgentsData || []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'es', {
          sensitivity: 'base',
        })
      );

      setAllAgents(sortedAgents);

      const uniqueCategories = [
        ...new Set(
          sortedAgents.map((agent) => agent.category || 'Sin Categoría')
        ),
      ].sort();

      setCategories(['Todas', ...uniqueCategories]);
      setAgents(sortedAgents);
    } catch (error) {
      console.error('💥 Exception loading data:', error);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      console.log(`🔄 Loading agents for category: ${selectedCategory}`);

      let filteredAgents;
      if (selectedCategory === 'Todas') {
        filteredAgents = allAgents;
      } else {
        filteredAgents = allAgents.filter(
          (agent) => agent.category === selectedCategory
        );
      }

      const sortedFilteredAgents = filteredAgents.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'es', {
          sensitivity: 'base',
        })
      );

      setAgents(sortedFilteredAgents);

      console.log(
        `✅ Showing ${sortedFilteredAgents.length} agents for category: ${selectedCategory}`
      );
    } catch (error) {
      console.error('💥 Exception loading agents:', error);
      setError('Error al cargar agentes');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getAgentCountForCategory = (category) => {
    if (category === 'Todas') {
      return allAgents.length;
    }
    return allAgents.filter((agent) => agent.category === category).length;
  };

  const getAgentStats = () => {
    const totalAgents = allAgents.length;
    const categoriesCount = categories.length - 1;
    return { totalAgents, categoriesCount };
  };

  const { totalAgents, categoriesCount } = getAgentStats();

  // 🚀 SOLUCIÓN SIMPLE: Solo mostrar loading mientras Clerk no esté listo
  if (!isLoaded) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            Netflix de Agentes Conversacionales
          </h1>
          <p className='text-xl text-gray-600 mb-2'>Inicializando...</p>
        </div>
        <div className='flex justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            Netflix de Agentes Conversacionales
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Cargando agentes especializados...
          </p>
        </div>
        <div className='flex justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            Netflix de Agentes Conversacionales
          </h1>
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6 inline-block'>
            <p className='text-red-800 mb-2'>❌ {error}</p>
            <button
              onClick={loadData}
              className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Header CON LÓGICA SIMPLE */}
      {isSignedIn && user ? (
        // ✅ USUARIO LOGUEADO
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>
              <i className='fas fa-hand-wave mr-2 text-yellow-500'></i>
              ¡Hola {user.firstName}!
            </h1>
            <p className='text-gray-600'>
              <i className='fas fa-robot mr-1'></i>
              {totalAgents} agentes disponibles en
              <i className='fas fa-tags ml-1 mr-1'></i>
              {categoriesCount} categorías
            </p>
          </div>
          <div className='flex items-center'>
            <AdminButton userId={user?.id} />

            <Link
              href='/dashboard'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm'
            >
              <i className='fas fa-chart-bar mr-2'></i>
              Mi Dashboard
            </Link>
          </div>
        </div>
      ) : (
        // ❌ USUARIO NO LOGUEADO - SIN SignInButton
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-4'>
            <i className='fas fa-play mr-3 text-red-500'></i>
            Netflix de Agentes Conversacionales
          </h1>
          <p className='text-xl text-gray-600 mb-2'>
            Elegí tu experto ideal para PyMEs, emprendedores y profesionales
            independientes
          </p>
          <p className='text-sm text-gray-500'>
            <i className='fas fa-robot mr-1'></i>
            {totalAgents} agentes especializados en
            <i className='fas fa-tags ml-1 mr-1'></i>
            {categoriesCount} categorías
          </p>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 inline-block'>
            <p className='text-blue-800 mb-3'>
              <i className='fas fa-sign-in-alt mr-2'></i>
              Iniciá sesión para acceder a todos los agentes especializados
            </p>
            {/* 🔧 BOTÓN PERSONALIZADO EN LUGAR DE SignInButton */}
            <Link
              href='/sign-in'
              className='inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              <i className='fas fa-user-plus mr-2'></i>
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      )}

      {/* Filtros con Font Awesome */}
      <div className='mb-8'>
        <div className='flex flex-wrap justify-center gap-2'>
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const categoryStyles =
              category !== 'Todas' ? getCategoryStyles(category) : null;
            const agentCount = getAgentCountForCategory(category);

            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? category === 'Todas'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : `bg-gradient-to-r ${categoryStyles?.gradient} text-white ring-2 ring-white/20 shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                {category === 'Todas' ? (
                  <>
                    <i className='fas fa-search mr-2'></i>
                    {category}
                  </>
                ) : (
                  <>
                    <i className={`${categoryStyles?.icon} mr-2`}></i>
                    {category}
                  </>
                )}
                <span className='ml-1 text-xs opacity-75'>({agentCount})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de agentes */}
      {agents.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {agents.map((agent) => (
            <div key={agent.id} className='group block'>
              {isSignedIn ? (
                <Link href={`/chat/${agent.id}`}>
                  <AgentCard agent={agent} />
                </Link>
              ) : (
                <div className='cursor-pointer'>
                  <AgentCard agent={agent} locked={true} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <i className='fas fa-exclamation-triangle text-4xl text-gray-400 mb-4'></i>
          <p className='text-gray-500 text-lg mb-4'>
            {selectedCategory === 'Todas'
              ? 'No hay agentes disponibles en este momento'
              : `No hay agentes en la categoría "${selectedCategory}"`}
          </p>
        </div>
      )}

      {/* Footer para no logueados */}
      {!isSignedIn && (
        <div className='text-center mt-12 p-6 bg-gray-50 rounded-lg'>
          <p className='text-gray-600 mb-2'>
            <i className='fas fa-question-circle mr-2'></i>
            <strong>¿Cómo funciona?</strong>
          </p>
          <p className='text-sm text-gray-500'>
            <i className='fas fa-user-plus mr-1'></i>
            1. Creá tu cuenta gratuita •
            <i className='fas fa-mouse-pointer ml-2 mr-1'></i>
            2. Elegí el agente ideal •
            <i className='fas fa-comments ml-2 mr-1'></i>
            3. Chateá como si fuera una consultoría
          </p>
        </div>
      )}
    </div>
  );
}
