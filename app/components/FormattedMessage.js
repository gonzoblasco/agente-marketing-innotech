'use client';

import { marked } from 'marked';
import { useEffect, useState } from 'react';

// Configurar marked para seguridad y estilo
marked.setOptions({
  breaks: true, // Convertir \n en <br>
  gfm: true, // GitHub Flavored Markdown
});

export default function FormattedMessage({ content, isUser = false }) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Validar que content existe y no es null/undefined
    if (!content || typeof content !== 'string') {
      console.warn(
        'FormattedMessage: content is undefined, null, or not a string:',
        content
      );
      setHtmlContent('');
      return;
    }

    if (isUser) {
      // Para mensajes del usuario, solo texto plano con saltos de línea
      setHtmlContent(content.replace(/\n/g, '<br>'));
    } else {
      try {
        // Para respuestas del agente, renderizar markdown
        const html = marked(content);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error rendering markdown:', error);
        // Fallback a texto plano si hay error
        setHtmlContent(content.replace(/\n/g, '<br>'));
      }
    }
  }, [content, isUser]);

  // Si no hay contenido, mostrar placeholder
  if (!content || typeof content !== 'string') {
    return (
      <p className='text-sm opacity-60 italic'>
        {isUser ? 'Mensaje vacío' : 'Respuesta vacía'}
      </p>
    );
  }

  return (
    <div
      className={`markdown-content ${isUser ? 'text-white' : 'text-gray-900'}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
