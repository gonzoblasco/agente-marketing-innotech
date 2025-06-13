'use client';

import Link from 'next/link';
import { useUser, UserButton } from '@clerk/nextjs';

export default function AgentHeader({ agent }) {
  const { user } = useUser();

  // Validación de seguridad
  if (!agent) {
    console.warn('⚠️ AgentHeader: No agent provided');
    return (
      <div className='flex items-center justify-between'>
        <div className='flex items-center text-sm text-gray-500'>
          <Link href='/' className='hover:text-blue-600 transition-colors'>
            🏠 Galería de Agentes
          </Link>
          <span className='mx-2'>•</span>
          <span className='text-red-500'>Error</span>
        </div>
        {user && (
          <div className='flex items-center space-x-3'>
            <Link
              href='/dashboard'
              className='text-sm text-gray-600 hover:text-blue-600 transition-colors'
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl='/' />
          </div>
        )}
      </div>
    );
  }

  // Valores por defecto para evitar errores
  const agentName = agent.name || 'Agente';

  return (
    <div className='flex items-center justify-between'>
      {/* Breadcrumb */}
      <div className='flex items-center text-sm text-gray-500'>
        <Link href='/' className='hover:text-blue-600 transition-colors'>
          🏠 Galería de Agentes
        </Link>
        <span className='mx-2'>•</span>
        <span className='text-gray-700'>{agentName}</span>
      </div>

      {/* Usuario autenticado */}
      {user && (
        <div className='flex items-center space-x-3'>
          <Link
            href='/dashboard'
            className='text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium'
          >
            Dashboard
          </Link>
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
