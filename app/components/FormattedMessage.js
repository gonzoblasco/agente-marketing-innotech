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
    if (isUser) {
      // Para mensajes del usuario, solo texto plano
      setHtmlContent(content);
    } else {
      // Para respuestas del agente, renderizar markdown
      const html = marked(content);
      setHtmlContent(html);
    }
  }, [content, isUser]);

  if (isUser) {
    return <p className='text-sm whitespace-pre-wrap'>{content}</p>;
  }

  return (
    <div
      className='text-sm markdown-content'
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // Estilos para el contenido markdown
        lineHeight: '1.6',
      }}
    />
  );
}
