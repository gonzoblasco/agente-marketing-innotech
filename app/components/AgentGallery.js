'use client';

import { getAllAgents } from '../data/agents';
import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AgentGallery() {
  const { isSignedIn, user } = useUser();
  const agents = getAllAgents();

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>
          Netflix de Agentes Conversacionales
        </h1>
        <p className='text-xl text-gray-600 mb-2'>
          Elegí tu experto ideal para resolver problemas específicos de tu
          empresa
        </p>

        {/* Estado de usuario */}
        {isSignedIn ? (
          <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6 inline-block'>
            <p className='text-green-800'>
              ¡Hola {user.firstName}! Tenés acceso completo a todos los agentes
            </p>
          </div>
        ) : (
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 inline-block'>
            <p className='text-blue-800 mb-2'>
              Iniciá sesión para acceder a todos los agentes especializados
            </p>
            <SignInButton>
              <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                Crear Cuenta Gratis
              </button>
            </SignInButton>
          </div>
        )}
      </div>

      {/* Grid de agentes */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {agents.map((agent) => (
          <div key={agent.id} className='group block'>
            {isSignedIn ? (
              <Link href={`/chat/${agent.id}`}>
                <AgentCard agent={agent} />
              </Link>
            ) : (
              <div
                className='cursor-pointer'
                onClick={() =>
                  document.querySelector('[data-clerk-sign-in]')?.click()
                }
              >
                <AgentCard agent={agent} locked={true} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='text-center mt-12 p-6 bg-gray-50 rounded-lg'>
        <p className='text-gray-600 mb-2'>
          <strong>¿Cómo funciona?</strong>
        </p>
        <p className='text-sm text-gray-500'>
          1. Creá tu cuenta gratuita • 2. Elegí el agente ideal • 3. Chateá como
          si fuera una consultoría
        </p>
      </div>
    </div>
  );
}

// Componente para las cards de agentes
function AgentCard({ agent, locked = false }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden ${
        locked ? 'opacity-75' : ''
      }`}
    >
      {/* Header con gradiente */}
      <div
        className={`bg-gradient-to-r ${agent.gradient} p-6 text-white relative`}
      >
        {locked && (
          <div className='absolute top-2 right-2'>
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        )}

        <div className='flex items-center mb-3'>
          <div className='text-3xl mr-3'>{agent.emoji}</div>
          <div>
            <h3 className='text-xl font-bold'>{agent.name}</h3>
            <p className='text-sm opacity-90'>{agent.title}</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className='p-6'>
        <p className='text-gray-600 mb-4 leading-relaxed'>
          {agent.description}
        </p>

        <div className='flex items-center justify-between'>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${agent.color}-100 text-${agent.color}-800`}
          >
            Especialista
          </div>
          <div className='flex items-center text-gray-400 group-hover:text-gray-600 transition-colors'>
            <span className='text-sm mr-1'>
              {locked ? 'Iniciar Sesión' : 'Chatear'}
            </span>
            <svg
              className='w-4 h-4 transform group-hover:translate-x-1 transition-transform'
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
        </div>
      </div>
    </div>
  );
}
