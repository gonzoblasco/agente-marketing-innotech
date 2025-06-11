'use client';

import { getAllAgents } from '../data/agents';
import Link from 'next/link';

export default function AgentGallery() {
  const agents = getAllAgents();

  return (
    <div className='max-w-6xl mx-auto px-4 py-8'>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold text-gray-800 mb-4'>
          🚀 InnoTech Solutions
        </h1>
        <p className='text-xl text-gray-600 mb-2'>
          Netflix de Agentes Conversacionales
        </p>
        <p className='text-lg text-gray-500'>
          Elegí tu experto ideal para resolver problemas específicos de tu
          empresa
        </p>
      </div>

      {/* Grid de agentes */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/chat/${agent.id}`}
            className='group block'
          >
            <div className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden'>
              {/* Header con gradiente */}
              <div
                className={`bg-gradient-to-r ${agent.gradient} p-6 text-white`}
              >
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
                    <span className='text-sm mr-1'>Chatear</span>
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
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className='text-center mt-12 p-6 bg-gray-50 rounded-lg'>
        <p className='text-gray-600 mb-2'>
          <strong>¿Cómo funciona?</strong>
        </p>
        <p className='text-sm text-gray-500'>
          1. Elegí el agente ideal para tu consulta • 2. Chateá como si fuera
          una consultoría • 3. Exportá el contexto para continuar después
        </p>
      </div>
    </div>
  );
}
