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

  // Validación de seguridad para agente
  if (!agent) {
    return (
      <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center'>
        <h2 className='text-xl font-bold text-red-600 mb-4'>
          ⚠️ Error: Agente no disponible
        </h2>
        <p className='text-gray-600 mb-4'>
          No se pudo cargar la información del agente.
        </p>
        <button
          onClick={() => window.location.reload()}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
        >
          Recargar página
        </button>
      </div>
    );
  }

  // Valores por defecto para evitar errores
  const agentName = agent.name || 'Agente';
  const agentTitle = agent.title || 'Especialista';
  const agentEmoji = agent.emoji || '🤖';
  const agentGradient = agent.gradient || 'from-blue-500 to-blue-700';
  const agentId = agent.id || 'default-agent';
  const welcomeMessage =
    agent.welcome_message || 'Hola, ¿en qué puedo ayudarte?';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar historial de conversación al montar
  useEffect(() => {
    if (user && agent) {
      loadConversationHistory();
    }
  }, [user, agent]);

  const loadConversationHistory = async () => {
    try {
      setIsLoadingHistory(true);

      console.log('🔄 Loading conversation history');
      console.log('👤 User:', user?.id);
      console.log('🤖 Agent:', agentId);

      // Asegurar que el usuario existe en nuestra BD
      console.log('👤 Upserting user...');
      await upsertUser(user);

      // Obtener conversación
      console.log('💬 Getting/creating conversation...');
      const conversation = await getOrCreateConversation(user.id, agentId);

      if (conversation) {
        console.log('✅ Conversation found/created:', conversation.id);

        // Cargar mensajes existentes
        const existingMessages = await getConversationMessages(conversation.id);
        console.log(`📝 Found ${existingMessages.length} existing messages`);

        if (existingMessages.length > 0) {
          setMessages(
            existingMessages.map((msg) => ({
              role: msg.role,
              content: msg.content || '[Mensaje vacío]',
            }))
          );
        } else {
          // Si no hay mensajes, mostrar mensaje de bienvenida
          console.log('💬 No existing messages, showing welcome message');
          setMessages([
            {
              role: 'assistant',
              content: welcomeMessage,
            },
          ]);
        }
      } else {
        console.log('❌ Could not create/get conversation, using fallback');
        // Fallback si no se puede crear conversación
        setMessages([
          {
            role: 'assistant',
            content: welcomeMessage,
          },
        ]);
      }
    } catch (error) {
      console.error('💥 Error loading conversation:', error);
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
      <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className={`bg-gradient-to-r ${agentGradient} text-white p-4`}>
          <div className='flex items-center'>
            <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3'>
              {agentEmoji}
            </div>
            <div>
              <h3 className='font-semibold'>{agentName}</h3>
              <p className='text-white/80 text-sm'>{agentTitle}</p>
            </div>
          </div>
        </div>

        <div className='h-96 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-500'>Cargando conversación...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
      {/* Header del chat */}
      <div className={`bg-gradient-to-r ${agentGradient} text-white p-4`}>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3'>
            {agentEmoji}
          </div>
          <div>
            <h3 className='font-semibold'>{agentName}</h3>
            <p className='text-white/80 text-sm'>{agentTitle}</p>
            <p className='text-white/60 text-xs mt-1'>
              Mensajes restantes: {messagesRemaining || '...'}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className='h-96 overflow-y-auto p-4 space-y-4 bg-gray-50'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? `bg-gradient-to-r ${agentGradient} text-white`
                  : 'bg-white text-gray-800 shadow border'
              }`}
            >
              <FormattedMessage
                content={message.content}
                isUser={message.role === 'user'}
              />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-white text-gray-800 px-4 py-2 rounded-lg shadow border'>
              <div className='flex space-x-1'>
                <div className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'></div>
                <div
                  className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className='border-t bg-white p-4'>
        <div className='flex space-x-3'>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Escribí tu consulta...'
            className='flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white'
            rows='2'
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`bg-gradient-to-r ${agentGradient} text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium`}
          >
            {isLoading ? (
              <div className='flex items-center'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                Enviando...
              </div>
            ) : (
              'Enviar'
            )}
          </button>
        </div>

        <div className='mt-3 text-xs text-gray-500 text-center'>
          Presioná <kbd className='bg-gray-100 px-2 py-1 rounded'>Enter</kbd>{' '}
          para enviar •{' '}
          <kbd className='bg-gray-100 px-2 py-1 rounded'>Shift+Enter</kbd> para
          nueva línea
        </div>
      </div>
    </div>
  );
}
