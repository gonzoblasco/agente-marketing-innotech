'use client';

import Link from 'next/link';

export default function AgentHeader({ agent }) {
  return (
    <div className='mb-8'>
      {/* Breadcrumb */}
      <div className='flex items-center text-sm text-gray-500 mb-4'>
        <Link href='/' className='hover:text-blue-600 transition-colors'>
          🏠 Galería de Agentes
        </Link>
        <span className='mx-2'>•</span>
        <span className='text-gray-700'>{agent.name}</span>
      </div>

      {/* Header del agente */}
      <div
        className={`bg-gradient-to-r ${agent.gradient} text-white rounded-xl p-6 shadow-lg`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='text-4xl mr-4'>{agent.emoji}</div>
            <div>
              <h1 className='text-3xl font-bold mb-1'>{agent.name}</h1>
              <p className='text-lg opacity-90'>{agent.title}</p>
              <p className='text-sm opacity-75 mt-2 max-w-2xl'>
                {agent.description}
              </p>
            </div>
          </div>

          {/* Botón volver */}
          <Link
            href='/'
            className='bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium'
          >
            ← Cambiar Agente
          </Link>
        </div>
      </div>
    </div>
  );
}
