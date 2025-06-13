// __tests__/components/ChatInterface.test.js
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../../app/components/ChatInterface';
import {
  upsertUser,
  getOrCreateConversation,
  getConversationMessages,
  getUserStats,
  deleteConversationMessages,
} from '../../app/lib/supabase';

// Mock de fetch para API de chat
global.fetch = jest.fn();

const mockAgent = {
  id: 'marketing-digital',
  name: 'Consultor de Marketing Digital',
  emoji: '🎯',
  welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
};

const mockConversation = {
  id: 'conv-123',
  user_id: 'test-user-id',
  agent_id: 'marketing-digital',
};

const mockUserStats = {
  plan: 'lite',
  messages_used: 5,
  messages_limit: 100,
};

describe('ChatInterface', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mocks
    upsertUser.mockResolvedValue({ id: 'test-user-id' });
    getOrCreateConversation.mockResolvedValue(mockConversation);
    getConversationMessages.mockResolvedValue([]);
    getUserStats.mockResolvedValue(mockUserStats);

    // Mock successful API response
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message: 'Esta es una respuesta del agente',
        }),
    });
  });

  describe('Renderizado inicial', () => {
    test('muestra información del agente en el header', async () => {
      render(<ChatInterface agent={mockAgent} />);

      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(
        screen.getByText('Consultor de Marketing Digital')
      ).toBeInTheDocument();
    });

    test('muestra estado de carga inicial', () => {
      render(<ChatInterface agent={mockAgent} />);

      expect(screen.getByText(/Cargando conversación/)).toBeInTheDocument();
    });

    test('carga historial de conversación', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(upsertUser).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-user-id',
          })
        );
        expect(getOrCreateConversation).toHaveBeenCalledWith(
          'test-user-id',
          'marketing-digital'
        );
        expect(getUserStats).toHaveBeenCalledWith('test-user-id');
      });
    });

    test('muestra mensaje de bienvenida cuando no hay historial', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByText('¡Hola! Soy tu consultor de marketing digital.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Historial de mensajes', () => {
    test('carga mensajes existentes de la conversación', async () => {
      const existingMessages = [
        { role: 'user', content: 'Hola, necesito ayuda con marketing' },
        { role: 'assistant', content: 'Por supuesto, ¿en qué puedo ayudarte?' },
      ];

      getConversationMessages.mockResolvedValue(existingMessages);

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByText('Hola, necesito ayuda con marketing')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Por supuesto, ¿en qué puedo ayudarte?')
        ).toBeInTheDocument();
      });
    });

    test('maneja mensajes vacíos correctamente', async () => {
      const messagesWithEmpty = [
        { role: 'user', content: null },
        { role: 'assistant', content: '' },
      ];

      getConversationMessages.mockResolvedValue(messagesWithEmpty);

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(screen.getByText('[Mensaje vacío]')).toBeInTheDocument();
      });
    });
  });

  describe('Contador de mensajes', () => {
    test('muestra mensajes restantes correctamente', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(screen.getByText('95 mensajes restantes')).toBeInTheDocument();
      });
    });

    test('actualiza contador después de enviar mensaje', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      await waitFor(() => {
        expect(screen.getByText('94 mensajes restantes')).toBeInTheDocument();
      });
    });
  });

  describe('Envío de mensajes', () => {
    test('envía mensaje correctamente', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      const sendButton = screen.getByRole('button', { name: /enviar/i });

      await user.type(input, 'Hola, necesito ayuda');
      await user.click(sendButton);

      // Verificar que el mensaje aparece en el chat
      expect(screen.getByText('Hola, necesito ayuda')).toBeInTheDocument();

      // Verificar que se llama a la API
      expect(fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Hola, necesito ayuda'),
        })
      );
    });

    test('envía mensaje con Enter', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);

      await user.type(input, 'Test message{enter}');

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalled();
    });

    test('no envía mensaje vacío', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, '   '); // Solo espacios

      expect(screen.getByRole('button', { name: /enviar/i })).toBeDisabled();
    });

    test('deshabilita input durante envío', async () => {
      const user = userEvent.setup();

      // Mock API response con delay
      fetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ message: 'Response' }),
                }),
              100
            )
          )
      );

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      // Verificar que el input está deshabilitado durante el envío
      expect(input).toBeDisabled();
    });
  });

  describe('Respuestas del agente', () => {
    test('muestra respuesta del agente después de enviar mensaje', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test question');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Esta es una respuesta del agente')
        ).toBeInTheDocument();
      });
    });

    test('muestra estado de carga mientras espera respuesta', async () => {
      const user = userEvent.setup();

      // Mock API con delay
      fetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve({ message: 'Response' }),
                }),
              100
            )
          )
      );

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      // Verificar indicador de carga
      expect(screen.getByText('...')).toBeInTheDocument(); // dots animation
    });
  });

  describe('Manejo de errores', () => {
    test('muestra error cuando falla la API', async () => {
      const user = userEvent.setup();

      fetch.mockRejectedValue(new Error('Network error'));

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/Disculpá, hubo un error técnico/)
        ).toBeInTheDocument();
      });
    });

    test('muestra error específico cuando se alcanzan límites', async () => {
      const user = userEvent.setup();

      fetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            error: 'Límite de mensajes alcanzado',
          }),
      });

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      await waitFor(() => {
        expect(screen.getByText(/límite de mensajes/)).toBeInTheDocument();
      });
    });
  });

  describe('Reset de conversación', () => {
    test('muestra modal de confirmación al hacer reset', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Nueva conversación/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Nueva conversación/i })
      );

      expect(screen.getByText(/¿Resetear conversación?/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Resetear/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Cancelar/i })
      ).toBeInTheDocument();
    });

    test('cancela reset correctamente', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Nueva conversación/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Nueva conversación/i })
      );
      await user.click(screen.getByRole('button', { name: /Cancelar/i }));

      expect(
        screen.queryByText(/¿Resetear conversación?/)
      ).not.toBeInTheDocument();
    });

    test('ejecuta reset y limpia conversación', async () => {
      const user = userEvent.setup();
      deleteConversationMessages.mockResolvedValue(true);

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Nueva conversación/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /Nueva conversación/i })
      );
      await user.click(screen.getByRole('button', { name: /Resetear/i }));

      await waitFor(() => {
        expect(deleteConversationMessages).toHaveBeenCalled();
        expect(screen.getByText(mockAgent.welcome_message)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-resize textarea', () => {
    test('textarea se expande con contenido', async () => {
      const user = userEvent.setup();
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);

      await user.type(textarea, 'Línea 1\nLínea 2\nLínea 3');

      // El textarea debería tener más altura
      expect(textarea.style.height).not.toBe('auto');
    });
  });

  describe('Manejo de agente inválido', () => {
    test('muestra error cuando no hay agente', () => {
      render(<ChatInterface agent={null} />);

      expect(
        screen.getByText(/No se pudo cargar el agente/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Recargar/i })
      ).toBeInTheDocument();
    });

    test('usa valores por defecto para agente incompleto', () => {
      const incompleteAgent = { id: 'test' };
      render(<ChatInterface agent={incompleteAgent} />);

      expect(screen.getByText('Agente')).toBeInTheDocument(); // nombre por defecto
      expect(screen.getByText('🤖')).toBeInTheDocument(); // emoji por defecto
    });
  });

  describe('Accesibilidad', () => {
    test('textarea tiene label apropiado', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
        expect(textarea).toHaveAttribute(
          'placeholder',
          'Mensaje a Consultor de Marketing Digital...'
        );
      });
    });

    test('botón de envío tiene estado apropiado', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        const sendButton = screen.getByRole('button', { name: /enviar/i });
        expect(sendButton).toBeDisabled(); // Inicialmente deshabilitado
      });
    });

    test('mensajes tienen estructura semántica correcta', async () => {
      getConversationMessages.mockResolvedValue([
        { role: 'user', content: 'Test user message' },
        { role: 'assistant', content: 'Test assistant message' },
      ]);

      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(screen.getByText('Test user message')).toBeInTheDocument();
        expect(screen.getByText('Test assistant message')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive design', () => {
    test('aplica clases CSS correctas para mobile', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        const chatContainer =
          screen.getByRole('main') ||
          document.querySelector('.flex.flex-col.h-full');
        expect(chatContainer).toHaveClass('h-full');
      });
    });

    test('textarea tiene altura mínima y máxima apropiada', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
        expect(textarea).toHaveClass('min-h-[52px]', 'max-h-32');
      });
    });
  });

  describe('Performance', () => {
    test('no realiza llamadas innecesarias a la API', async () => {
      render(<ChatInterface agent={mockAgent} />);

      await waitFor(() => {
        expect(upsertUser).toHaveBeenCalledTimes(1);
        expect(getOrCreateConversation).toHaveBeenCalledTimes(1);
        expect(getUserStats).toHaveBeenCalledTimes(1);
      });
    });

    test('limpia listeners correctamente al desmontar', () => {
      const { unmount } = render(<ChatInterface agent={mockAgent} />);

      // No debería haber errores al desmontar
      expect(() => unmount()).not.toThrow();
    });
  });
});
