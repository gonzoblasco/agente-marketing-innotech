// app/components/AgentCard.js
'use client';

import { useState } from 'react';
import { getCategoryStyles } from '../lib/categories';

export default function AgentCard({ agent, locked = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Obtener estilos de categoría
  const categoryStyles = getCategoryStyles(agent.category || 'Sin Categoría');

  // Función para obtener clases de color
  const getChatButtonClasses = () => {
    if (locked) return 'text-gray-400';
    return 'text-blue-600 hover:text-blue-700';
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

  // USAR EL GRADIENT DE LA CATEGORÍA, NO DEL AGENTE
  const cardGradient = categoryStyles.gradient || 'from-gray-500 to-gray-700';

  return (
    <div
      className={`relative group border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all duration-300 sm:transform sm:hover:scale-105 hover:shadow-xl ${
        locked ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header con gradiente de CATEGORÍA */}
      <div
        className={`bg-gradient-to-r ${cardGradient} p-4 sm:p-6 text-white relative overflow-hidden`}
      >
        {/* Efecto de hover sutil */}
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-300 ${
            isHovered ? 'opacity-10' : 'opacity-0'
          }`}
        ></div>

        {/* Efecto de brillo en hover - Solo desktop */}
        <div
          className={`hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-all duration-700 transform ${
            isHovered ? 'opacity-20 translate-x-full' : '-translate-x-full'
          }`}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            width: '100%',
            height: '100%',
          }}
        ></div>

        {/* Lock icon para usuarios no autenticados */}
        {locked && (
          <div className='absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1.5 sm:p-2 transition-all duration-300 hover:scale-110 hover:bg-opacity-70'>
            <svg
              className='w-3 h-3 sm:w-4 sm:h-4'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        )}

        {/* Contenido principal del header */}
        <div className='flex items-center mb-2 sm:mb-3 relative z-10'>
          <span
            className={`text-2xl sm:text-3xl mr-2 sm:mr-3 transition-all duration-300 ${
              isHovered ? 'sm:scale-110 sm:rotate-12' : ''
            }`}
          >
            {agent.emoji}
          </span>
          <div className='flex-1 min-w-0'>
            <h3 className='font-bold text-base sm:text-lg transition-all duration-300 truncate'>
              {agent.name}
            </h3>
            <p className='text-xs sm:text-sm opacity-90 transition-all duration-300 truncate'>
              {agent.title}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className='p-4 sm:p-6 bg-white relative'>
        {/* Descripción con expand/collapse */}
        <div className='mb-3 sm:mb-4'>
          <p className='text-gray-600 text-xs sm:text-sm leading-relaxed transition-all duration-300'>
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
              className='text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 sm:mt-2 transition-all duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1'
            >
              {isExpanded ? (
                <span className='flex items-center'>
                  <svg
                    className='w-3 h-3 mr-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 15l7-7 7 7'
                    />
                  </svg>
                  Ver menos
                </span>
              ) : (
                <span className='flex items-center'>
                  <svg
                    className='w-3 h-3 mr-1'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                  Leer más
                </span>
              )}
            </button>
          )}
        </div>

        {/* Footer con información adicional y acción */}
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            isHovered
              ? 'sm:transform sm:translate-y-0 sm:opacity-100'
              : 'sm:transform sm:translate-y-1 sm:opacity-80'
          }`}
        >
          {/* Badge de categoría con Font Awesome */}
          <div className='flex items-center'>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                categoryStyles.bgClass || 'bg-gray-100'
              } ${categoryStyles.textClass || 'text-gray-800'} ${
                isHovered ? 'sm:scale-105' : ''
              }`}
            >
              <i className={`${categoryStyles.icon} mr-1 text-xs`}></i>
              <span className='truncate max-w-[100px] sm:max-w-none'>
                {agent.category || 'Sin Categoría'}
              </span>
            </span>
          </div>

          {/* Call to action */}
          <div
            className={`text-xs sm:text-sm font-medium transition-all duration-300 flex items-center ${getChatButtonClasses()}`}
          >
            {locked ? (
              <span className='flex items-center'>
                <i className='fas fa-lock mr-1 text-xs'></i>
                <span className='hidden sm:inline'>Iniciar sesión</span>
                <span className='sm:hidden'>Login</span>
              </span>
            ) : (
              <span className='flex items-center'>
                <i className='fas fa-comments mr-1 text-xs'></i>
                Chatear
                <i
                  className={`fas fa-arrow-right ml-1 text-xs transition-all duration-300 ${
                    isHovered ? 'sm:translate-x-1 sm:scale-110' : ''
                  }`}
                ></i>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overlay de hover para efecto visual adicional - Solo desktop */}
      <div
        className={`hidden sm:block absolute inset-0 bg-gradient-to-r ${cardGradient} transition-opacity duration-300 pointer-events-none ${
          isHovered && !locked ? 'opacity-5' : 'opacity-0'
        }`}
      ></div>

      {/* Indicador de estado en la esquina superior izquierda - Solo desktop */}
      {!locked && (
        <div
          className={`hidden sm:block absolute top-2 left-2 w-3 h-3 rounded-full transition-all duration-300 ${
            isHovered ? 'scale-125' : ''
          }`}
        >
          <div
            className={`w-full h-full rounded-full bg-green-400 ${
              isHovered ? 'animate-pulse' : ''
            }`}
          ></div>
        </div>
      )}

      {/* Efecto de border hover usando el color de la categoría - Solo desktop */}
      <div
        className={`hidden sm:block absolute inset-0 rounded-2xl border-2 transition-all duration-300 pointer-events-none ${
          isHovered && !locked
            ? `border-opacity-50 shadow-lg`
            : 'border-transparent'
        }`}
        style={{
          borderColor:
            isHovered && !locked
              ? categoryStyles.color || '#3B82F6'
              : 'transparent',
          boxShadow:
            isHovered && !locked
              ? `0 10px 25px -5px ${categoryStyles.color || '#3B82F6'}20`
              : 'none',
        }}
      ></div>
    </div>
  );
}
