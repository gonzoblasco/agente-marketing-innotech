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
      className='inline-flex items-center px-2 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs sm:text-sm font-medium'
    >
      <i className='fas fa-cog mr-1 sm:mr-2'></i>
      <span className='hidden sm:inline'>Administración</span>
      <span className='sm:hidden'>Admin</span>
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

  if (!isLoaded) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='text-center mb-12'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Netflix de Agentes Conversacionales
          </h1>
          <p className='text-lg sm:text-xl text-gray-600 mb-2'>
            Inicializando...
          </p>
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
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            Netflix de Agentes Conversacionales
          </h1>
          <p className='text-lg sm:text-xl text-gray-600 mb-2'>
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
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
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
    <div className='max-w-6xl mx-auto px-4 py-4 sm:py-8'>
      {/* Header */}
      {isSignedIn && user ? (
        // Usuario logueado
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>
              <i className='fas fa-hand-wave mr-2 text-yellow-500'></i>
              ¡Hola {user.firstName}!
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              <i className='fas fa-robot mr-1'></i>
              {totalAgents} agentes disponibles en
              <i className='fas fa-tags ml-1 mr-1'></i>
              {categoriesCount} categorías
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <AdminButton userId={user?.id} />
            <Link
              href='/dashboard'
              className='inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-sm'
            >
              <i className='fas fa-chart-bar mr-1 sm:mr-2'></i>
              <span className='hidden sm:inline'>Mi Dashboard</span>
              <span className='sm:hidden'>Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        // Usuario no logueado
        <div className='text-center mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4'>
            <i className='fas fa-play mr-2 sm:mr-3 text-red-500'></i>
            <span className='hidden sm:inline'>
              Netflix de Agentes Conversacionales
            </span>
            <span className='sm:hidden'>InnoTech Solutions</span>
          </h1>
          <p className='text-base sm:text-lg md:text-xl text-gray-600 mb-2 px-2'>
            Elegí tu experto ideal para PyMEs y emprendedores
          </p>
          <p className='text-xs sm:text-sm text-gray-500'>
            <i className='fas fa-robot mr-1'></i>
            {totalAgents} agentes en
            <i className='fas fa-tags ml-1 mr-1'></i>
            {categoriesCount} categorías
          </p>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6 mx-auto max-w-sm sm:max-w-md'>
            <p className='text-blue-800 mb-3 text-sm sm:text-base'>
              <i className='fas fa-sign-in-alt mr-2'></i>
              Iniciá sesión para acceder a todos los agentes
            </p>
            <Link
              href='/sign-in'
              className='inline-block bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base'
            >
              <i className='fas fa-user-plus mr-2'></i>
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      )}

      {/* Filtros de categorías - Scrollable horizontalmente en mobile */}
      <div className='mb-6 sm:mb-8'>
        <div className='overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0'>
          <div className='flex sm:flex-wrap sm:justify-center gap-2 min-w-max sm:min-w-0'>
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              const categoryStyles =
                category !== 'Todas' ? getCategoryStyles(category) : null;
              const agentCount = getAgentCountForCategory(category);

              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    isSelected
                      ? category === 'Todas'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : `bg-gradient-to-r ${categoryStyles?.gradient} text-white ring-2 ring-white/20 shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {category === 'Todas' ? (
                    <>
                      <i className='fas fa-search mr-1'></i>
                      {category}
                    </>
                  ) : (
                    <>
                      <i className={`${categoryStyles?.icon} mr-1`}></i>
                      {category}
                    </>
                  )}
                  <span className='ml-1 text-xs opacity-75'>
                    ({agentCount})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid de agentes - Responsivo mejorado */}
      {agents.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
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
        <div className='text-center py-8 sm:py-12'>
          <i className='fas fa-exclamation-triangle text-3xl sm:text-4xl text-gray-400 mb-4'></i>
          <p className='text-gray-500 text-base sm:text-lg mb-4'>
            {selectedCategory === 'Todas'
              ? 'No hay agentes disponibles en este momento'
              : `No hay agentes en la categoría "${selectedCategory}"`}
          </p>
        </div>
      )}

      {/* Footer para no logueados - Responsive */}
      {!isSignedIn && (
        <div className='text-center mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg'>
          <p className='text-gray-600 mb-2 text-sm sm:text-base font-semibold'>
            <i className='fas fa-question-circle mr-2'></i>
            ¿Cómo funciona?
          </p>
          <p className='text-xs sm:text-sm text-gray-500'>
            <span className='block sm:inline'>
              <i className='fas fa-user-plus mr-1'></i>
              1. Creá tu cuenta •
            </span>
            <span className='block sm:inline'>
              <i className='fas fa-mouse-pointer mx-1'></i>
              2. Elegí el agente •
            </span>
            <span className='block sm:inline'>
              <i className='fas fa-comments mx-1'></i>
              3. Chateá como consultoría
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
