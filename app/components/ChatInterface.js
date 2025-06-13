'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import FormattedMessage from './FormattedMessage';
import {
  upsertUser,
  getOrCreateConversation,
  getConversationMessages,
  getUserStats,
} from '../lib/supabase';

export default function ChatInterface({ agent }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [messagesRemaining, setMessagesRemaining] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Validación de seguridad para agente
  if (!agent) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='text-red-500 text-lg mb-2'>⚠️ Error</div>
          <p className='text-gray-600'>No se pudo cargar el agente.</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  // Valores por defecto para evitar errores
  const agentName = agent.name || 'Agente';
  const agentEmoji = agent.emoji || '🤖';
  const agentId = agent.id || 'default-agent';
  const welcomeMessage =
    agent.welcome_message || 'Hola, ¿en qué puedo ayudarte?';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Cargar historial de conversación al montar
  useEffect(() => {
    if (user && agent) {
      loadConversationHistory();
    }
  }, [user, agent]);

  const loadConversationHistory = async () => {
    try {
      setIsLoadingHistory(true);

      // Asegurar que el usuario existe en nuestra BD
      await upsertUser(user);

      // Obtener conversación
      const conversation = await getOrCreateConversation(user.id, agentId);

      if (conversation) {
        // Cargar mensajes existentes
        const existingMessages = await getConversationMessages(conversation.id);

        if (existingMessages.length > 0) {
          setMessages(
            existingMessages.map((msg) => ({
              role: msg.role,
              content: msg.content || '[Mensaje vacío]',
            }))
          );
        } else {
          // Si no hay mensajes, mostrar mensaje de bienvenida
          setMessages([
            {
              role: 'assistant',
              content: welcomeMessage,
            },
          ]);
        }
      } else {
        // Fallback si no se puede crear conversación
        setMessages([
          {
            role: 'assistant',
            content: welcomeMessage,
          },
        ]);
      }

      // Cargar estadísticas del usuario
      const stats = await getUserStats(user.id);
      setMessagesRemaining(stats.messages_limit - stats.messages_used);
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback al mensaje de bienvenida
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage,
        },
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          agentId: agentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Error en la respuesta del servidor'
        );
      }

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.message || 'Respuesta vacía' },
      ]);

      setMessagesRemaining((prev) => Math.max(0, (prev || 100) - 1));
    } catch (error) {
      console.error('Error:', error);

      let errorMessage =
        'Disculpá, hubo un error técnico. ¿Podés intentar de nuevo?';

      if (error.message.includes('Límite de mensajes alcanzado')) {
        errorMessage =
          'Has alcanzado el límite de mensajes de tu plan. Actualizá tu plan para continuar chateando.';
      }

      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-500'>Cargando conversación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Header minimalista */}
      <div className='flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          <div className='flex items-center space-x-3'>
            <div className='text-2xl'>{agentEmoji}</div>
            <div>
              <h1 className='font-semibold text-gray-900'>{agentName}</h1>
              <p className='text-sm text-gray-500'>
                {messagesRemaining !== null
                  ? `${messagesRemaining} mensajes restantes`
                  : 'Cargando...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className='flex-1 overflow-y-auto px-4 py-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } chat-message`}
            >
              <div className='flex max-w-[80%] space-x-3'>
                {message.role === 'assistant' && (
                  <div className='flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm'>
                    {agentEmoji}
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <FormattedMessage
                    content={message.content}
                    isUser={message.role === 'user'}
                  />
                </div>

                {message.role === 'user' && (
                  <div className='flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium'>
                    {user?.firstName?.[0] || 'U'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className='flex justify-start chat-message'>
              <div className='flex max-w-[80%] space-x-3'>
                <div className='flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm'>
                  {agentEmoji}
                </div>
                <div className='bg-gray-100 rounded-2xl px-4 py-3'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className='flex-shrink-0 border-t border-gray-200 bg-white px-4 py-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='relative'>
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Mensaje a ${agentName}...`}
              className='w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[52px]'
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className='absolute bottom-2 right-2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                  />
                </svg>
              )}
            </button>
          </div>

          <div className='mt-2 text-xs text-gray-500 text-center'>
            <kbd className='bg-gray-100 px-2 py-1 rounded text-xs'>Enter</kbd>{' '}
            para enviar •{' '}
            <kbd className='bg-gray-100 px-2 py-1 rounded text-xs'>
              Shift+Enter
            </kbd>{' '}
            para nueva línea
          </div>
        </div>
      </div>
    </div>
  );
}
