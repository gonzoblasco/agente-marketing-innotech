// app/components/AgentCard.js
'use client';

import { useState } from 'react';
import { getCategoryStyles } from '../lib/categories';

export default function AgentCard({ agent, locked = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryStyles = getCategoryStyles(agent.category || 'Sin Categoría');

  // Función para obtener clases de color - simplificado a gris
  const getChatButtonClasses = () => {
    if (locked) return 'text-gray-400';
    return 'text-gray-600 hover:text-gray-700';
  };

  // Función para verificar si la descripción es larga
  const isLongDescription = (agent.description || '').length > 120;

  // Función para truncar texto
  const getTruncatedDescription = () => {
    if (!isLongDescription || isExpanded) {
      return agent.description;
    }
    return agent.description.substring(0, 120) + '...';
  };

  return (
    <div
      className={`relative group border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
        locked ? 'opacity-75' : ''
      }`}
    >
      {/* Header con gradiente y categoría */}
      <div
        className={`bg-gradient-to-r ${
          agent.gradient || categoryStyles.gradient
        } p-6 text-white relative`}
      >
        {locked && (
          <div className='absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        )}

        <div className='flex items-center mb-3'>
          <span className='text-3xl mr-3'>{agent.emoji}</span>
          <div>
            <h3 className='font-bold text-lg'>{agent.name}</h3>
            <p className='text-sm opacity-90'>{agent.title}</p>
          </div>
        </div>

        {/* Badge de categoría */}
        <div className='absolute bottom-2 right-2'>
          <span className='text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
            {categoryStyles.icon} {agent.category || 'Sin Categoría'}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className='p-6 bg-white'>
        <div className='mb-4'>
          <p className='text-gray-600 text-sm leading-relaxed'>
            {getTruncatedDescription()}
          </p>

          {/* Botón para expandir/contraer si es descripción larga */}
          {isLongDescription && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className='text-blue-600 hover:text-blue-700 text-xs font-medium mt-2 transition-colors'
            >
              {isExpanded ? '← Ver menos' : 'Leer más →'}
            </button>
          )}
        </div>

        {/* Footer con acción */}
        <div className='flex justify-end'>
          <div
            className={`text-sm font-medium transition-colors ${getChatButtonClasses()}`}
          >
            {locked ? '🔒 Iniciar sesión' : 'Chatear →'}
          </div>
        </div>
      </div>

      {/* Overlay de hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          agent.gradient || categoryStyles.gradient
        } opacity-0 ${
          locked ? '' : 'group-hover:opacity-10'
        } transition-opacity duration-300 pointer-events-none`}
      ></div>
    </div>
  );
}
