'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ agent }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: agent.welcomeMessage,
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          agentId: agent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.message },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Disculpá, hubo un error técnico. ¿Podés intentar de nuevo?',
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

  return (
    <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
      {/* Header del chat */}
      <div className={`bg-gradient-to-r ${agent.gradient} text-white p-4`}>
        <div className='flex items-center'>
          <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3'>
            {agent.emoji}
          </div>
          <div>
            <h3 className='font-semibold'>{agent.name}</h3>
            <p className='text-white/80 text-sm'>{agent.title}</p>
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
                  ? `bg-gradient-to-r ${agent.gradient} text-white`
                  : 'bg-white text-gray-800 shadow border'
              }`}
            >
              <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
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

      {/* Input area - MEJORADO */}
      <div className='border-t bg-white p-4'>
        <div className='flex space-x-3'>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Escribí tu consulta sobre marketing digital...'
            className='flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white'
            rows='2'
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`bg-gradient-to-r ${agent.gradient} text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all font-medium`}
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
