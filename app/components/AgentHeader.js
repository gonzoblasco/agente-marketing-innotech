'use client';

import Link from 'next/link';

export default function AgentHeader({ agent }) {
  // Validación de seguridad
  if (!agent) {
    console.warn('⚠️ AgentHeader: No agent provided');
    return (
      <div className='mb-8'>
        <p className='text-red-500'>
          Error: No se pudo cargar la información del agente
        </p>
        <Link href='/' className='text-blue-600 hover:text-blue-700'>
          ← Volver a la galería
        </Link>
      </div>
    );
  }

  // Valores por defecto para evitar errores
  const agentName = agent.name || 'Agente';
  const agentTitle = agent.title || 'Especialista';
  const agentDescription =
    agent.description || 'Agente conversacional especializado';
  const agentEmoji = agent.emoji || '🤖';
  const agentGradient = agent.gradient || 'from-blue-500 to-blue-700';

  return (
    <div className='mb-8'>
      {/* Breadcrumb */}
      <div className='flex items-center text-sm text-gray-500 mb-4'>
        <Link href='/' className='hover:text-blue-600 transition-colors'>
          🏠 Galería de Agentes
        </Link>
        <span className='mx-2'>•</span>
        <span className='text-gray-700'>{agentName}</span>
      </div>

      {/* Header del agente */}
      <div
        className={`bg-gradient-to-r ${agentGradient} text-white rounded-xl p-6 shadow-lg`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <div className='text-4xl mr-4'>{agentEmoji}</div>
            <div>
              <h1 className='text-3xl font-bold mb-1'>{agentName}</h1>
              <p className='text-lg opacity-90'>{agentTitle}</p>
              <p className='text-sm opacity-75 mt-2 max-w-2xl'>
                {agentDescription}
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
