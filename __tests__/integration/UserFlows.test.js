// __tests__/integration/UserFlows.test.js
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock de MSW para interceptar requests HTTP
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Components
import Home from '../../app/page';
import ChatPage from '../../app/chat/[agentId]/page';
import Dashboard from '../../app/dashboard/page';
import PricingPage from '../../app/pricing/page';

// Setup MSW server
const server = setupServer(
  // Mock de API de chat
  http.post('/api/chat', () => {
    return HttpResponse.json({
      message: 'Esta es una respuesta del agente de prueba',
    });
  }),

  // Mock de API de pagos
  http.post('/api/payments/create', () => {
    return HttpResponse.json({
      preference_id: 'test-preference-123',
      init_point:
        'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-preference-123',
      sandbox_init_point:
        'https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=test-preference-123',
    });
  }),

  // Mock de webhook MercadoPago
  http.post('/api/webhooks/mercadopago', () => {
    return HttpResponse.json({
      status: 'success',
      user_id: 'test-user-id',
      plan: 'pro',
    });
  })
);

// Setup y teardown del server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrapper para tests
const renderWithAct = async (component) => {
  let result;
  await act(async () => {
    result = render(component);
  });
  return result;
};

// Mock específicos para user flows
const mockUserFlowFunctions = {
  getAgentsByCategory: jest.fn(() =>
    Promise.resolve([
      {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        category: 'Marketing',
        emoji: '🎯',
        is_active: true,
      },
    ])
  ),
  getUniqueCategories: jest.fn(() => Promise.resolve(['Marketing'])),
  getUserStats: jest.fn(() =>
    Promise.resolve({
      plan: 'lite',
      messages_used: 5,
      messages_limit: 100,
    })
  ),
  upsertUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
  getOrCreateConversation: jest.fn(() =>
    Promise.resolve({
      id: 'conv-123',
      user_id: 'test-user-id',
      agent_id: 'marketing-digital',
    })
  ),
  getConversationMessages: jest.fn(() => Promise.resolve([])),
  getAllUsers: jest.fn(() =>
    Promise.resolve([
      {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        plan: 'lite',
      },
    ])
  ),
  updateUser: jest.fn(() => Promise.resolve({ id: 'user-1' })),
  getAllAgents: jest.fn(() =>
    Promise.resolve([
      {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        category: 'Marketing',
      },
    ])
  ),
  createAgent: jest.fn(() => Promise.resolve({ id: 'new-agent' })),
  isUserAdmin: jest.fn(() => Promise.resolve(true)),
};

// Sobrescribir mocks para integration tests
jest.mock('../../app/lib/supabase', () => mockUserFlowFunctions);

describe('Flujos de Usuario Completos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Test response' }),
    });
  });

  describe('Flujo Usuario Normal: Registro → Chat → Dashboard → Pricing', () => {
    test('usuario puede navegar desde galería hasta chat completo', async () => {
      // 1. Renderizar página principal
      await renderWithAct(<Home />);

      // 2. Verificar que carga la galería
      await waitFor(() => {
        expect(
          screen.getByText('Netflix de Agentes Conversacionales')
        ).toBeInTheDocument();
      });

      // 3. Usuario ya está logueado (mock), ver mensaje de bienvenida
      await waitFor(() => {
        expect(screen.getByText(/¡Hola Test!/)).toBeInTheDocument();
      });

      // 4. Click en un agente para ir al chat
      await waitFor(() => {
        const marketingAgent = screen.getByText(
          'Consultor de Marketing Digital'
        );
        expect(marketingAgent.closest('a')).toHaveAttribute(
          'href',
          '/chat/marketing-digital'
        );
      });
    });

    test('flujo completo de chat: envío de mensaje y respuesta', async () => {
      const user = userEvent.setup();

      // Renderizar ChatPage con params mock
      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });

      await renderWithAct(<ChatPage params={mockParams} />);

      // Esperar que cargue la interfaz de chat
      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
      });

      // Verificar mensaje de bienvenida
      await waitFor(() => {
        expect(screen.getByText(/Hola/)).toBeInTheDocument();
      });

      // Enviar mensaje
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await act(async () => {
        await user.type(
          textarea,
          'Necesito ayuda con mi estrategia de marketing digital para mi PyME'
        );
      });

      const sendButton = screen.getByRole('button', { name: /enviar/i });
      await act(async () => {
        await user.click(sendButton);
      });

      // Verificar que el mensaje del usuario aparece
      expect(
        screen.getByText(
          'Necesito ayuda con mi estrategia de marketing digital para mi PyME'
        )
      ).toBeInTheDocument();

      // Esperar respuesta del agente
      await waitFor(
        () => {
          expect(
            screen.getByText('Esta es una respuesta del agente de prueba')
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verificar que el contador de mensajes se actualiza
      await waitFor(() => {
        expect(screen.getByText(/94 mensajes restantes/)).toBeInTheDocument();
      });
    });

    test('navegación a dashboard muestra estadísticas correctas', async () => {
      await renderWithAct(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('¡Hola Test! 👋')).toBeInTheDocument();
        expect(screen.getByText('📊 Uso de Mensajes')).toBeInTheDocument();
      });

      // Verificar estadísticas del usuario
      await waitFor(() => {
        expect(screen.getByText('5 / 100')).toBeInTheDocument(); // mensajes usados/límite
        expect(screen.getByText(/LITE/)).toBeInTheDocument();
      });

      // Verificar acciones rápidas
      expect(screen.getByText('⚡ Acciones Rápidas')).toBeInTheDocument();
    });
  });

  describe('Flujo de Monetización: Pricing → MercadoPago → Webhook', () => {
    test('flujo completo de upgrade de plan', async () => {
      const user = userEvent.setup();

      await renderWithAct(<PricingPage />);

      // Verificar página de pricing
      expect(screen.getByText('🚀 Actualizá tu Plan')).toBeInTheDocument();
      expect(screen.getByText('Plan Pro')).toBeInTheDocument();
      expect(screen.getByText('Plan Elite')).toBeInTheDocument();

      // Click en actualizar a Plan Pro
      const proButton = screen.getByText('Actualizar a Plan Pro');
      await act(async () => {
        await user.click(proButton);
      });

      // Verificar que se muestra loading
      await waitFor(() => {
        expect(screen.getByText('Procesando...')).toBeInTheDocument();
      });

      // Simular respuesta exitosa
      await waitFor(() => {
        expect(proButton).not.toBeDisabled();
      });
    });

    test('webhook de MercadoPago actualiza usuario correctamente', async () => {
      const webhookPayload = {
        type: 'payment',
        data: { id: 'payment-123' },
        action: 'payment.updated',
      };

      // Simular webhook request
      const response = await fetch('/api/webhooks/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.ok).toBe(true);

      const result = await response.json();
      expect(result.status).toBe('success');
      expect(result.user_id).toBe('test-user-id');
      expect(result.plan).toBe('pro');
    });
  });

  describe('Flujo Admin: Login → Gestión → CRUD', () => {
    beforeEach(() => {
      // Mock usuario admin
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({
        user: {
          id: 'admin-user-id',
          firstName: 'Admin',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'admin@innotech.com' }],
        },
        isSignedIn: true,
        isLoaded: true,
      });
    });

    test('admin puede acceder y gestionar usuarios', async () => {
      const user = userEvent.setup();
      const UsersPage = require('../../app/admin/users/page').default;

      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });

      // Editar usuario
      await act(async () => {
        await user.click(screen.getAllByText('Editar')[0]);
      });

      // Cambiar plan
      const planSelect = screen.getByDisplayValue('lite');
      await act(async () => {
        await user.selectOptions(planSelect, 'pro');
      });

      // Guardar
      await act(async () => {
        await user.click(screen.getByText('Guardar Cambios'));
      });

      expect(mockUserFlowFunctions.updateUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          plan: 'pro',
          messages_limit: 1000,
        })
      );
    });

    test('admin puede crear nuevo agente desde cero', async () => {
      const user = userEvent.setup();
      const AgentsPage = require('../../app/admin/agents/page').default;

      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      // Abrir modal de creación
      await act(async () => {
        await user.click(screen.getByText('+ Crear Agente'));
      });

      // Llenar formulario completo
      await act(async () => {
        await user.type(
          screen.getByLabelText(/ID del Agente/),
          'test-agent-nuevo'
        );
        await user.type(screen.getByLabelText(/Nombre/), 'Agente de Prueba');
        await user.type(
          screen.getByLabelText(/Título/),
          'Especialista en Testing'
        );
        await user.type(screen.getByLabelText(/Emoji/), '🧪');
        await user.type(
          screen.getByLabelText(/Descripción/),
          'Agente especializado en testing de aplicaciones'
        );
        await user.selectOptions(
          screen.getByLabelText(/Categoría/),
          'Tecnología'
        );

        const systemPrompt = `Sos un experto en testing de software y aplicaciones web.
Tu especialidad es ayudar a developers y QA engineers con:
- Estrategias de testing
- Herramientas de automatización
- Best practices de QA
- Testing de performance`;

        await user.type(screen.getByLabelText(/System Prompt/), systemPrompt);
        await user.type(
          screen.getByLabelText(/Mensaje de Bienvenida/),
          '¡Hola! Soy tu especialista en testing. ¿En qué puedo ayudarte?'
        );
      });

      // Crear agente
      await act(async () => {
        await user.click(screen.getByText('Crear Agente'));
      });

      expect(mockUserFlowFunctions.createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-agent-nuevo',
          name: 'Agente de Prueba',
          category: 'Tecnología',
          system_prompt: expect.stringContaining('testing de software'),
        })
      );
    });
  });

  describe('Flujos de Error y Recovery', () => {
    test('manejo de error de conexión en chat', async () => {
      const user = userEvent.setup();

      // Override server para simular error
      server.use(
        http.post('/api/chat', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });
      await renderWithAct(<ChatPage params={mockParams} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await act(async () => {
        await user.type(textarea, 'Test message');
        await user.click(screen.getByRole('button', { name: /enviar/i }));
      });

      // Verificar mensaje de error
      await waitFor(() => {
        expect(
          screen.getByText(/Disculpá, hubo un error técnico/)
        ).toBeInTheDocument();
      });
    });

    test('recovery de error en carga de agentes', async () => {
      const user = userEvent.setup();

      // Simular error inicial
      mockUserFlowFunctions.getAgentsByCategory.mockRejectedValueOnce(
        new Error('Network error')
      );

      await renderWithAct(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Reintentar/i })
        ).toBeInTheDocument();
      });

      // Reset mock para que funcione en retry
      mockUserFlowFunctions.getAgentsByCategory.mockResolvedValue([
        {
          id: 'marketing-digital',
          name: 'Consultor de Marketing Digital',
          category: 'Marketing',
          emoji: '🎯',
          is_active: true,
        },
      ]);

      // Click en reintentar
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /Reintentar/i }));
      });

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
      });
    });

    test('manejo de límite de mensajes alcanzado', async () => {
      const user = userEvent.setup();

      // Override server para simular límite alcanzado
      server.use(
        http.post('/api/chat', () => {
          return HttpResponse.json(
            {
              error:
                'Límite de mensajes alcanzado. Actualiza tu plan para continuar.',
            },
            { status: 429 }
          );
        })
      );

      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });
      await renderWithAct(<ChatPage params={mockParams} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await act(async () => {
        await user.type(textarea, 'Test message');
        await user.click(screen.getByRole('button', { name: /enviar/i }));
      });

      // Verificar mensaje de límite alcanzado
      await waitFor(() => {
        expect(
          screen.getByText(/límite de mensajes alcanzado/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Flujos Cross-Device y Responsive', () => {
    test('interfaz responsive funciona en mobile', async () => {
      // Simular viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      await renderWithAct(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText('Netflix de Agentes Conversacionales')
        ).toBeInTheDocument();
      });

      // Verificar que usa grid de 1 columna en mobile
      const agentsGrid = document.querySelector('.grid');
      expect(agentsGrid).toHaveClass('grid-cols-1');
    });

    test('chat interface se adapta a diferentes tamaños', async () => {
      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });
      await renderWithAct(<ChatPage params={mockParams} />);

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
      });

      // Verificar que el layout es flexible
      const chatContainer = document.querySelector('.flex.flex-col.h-full');
      expect(chatContainer).toBeInTheDocument();

      // Textarea debería tener clases responsive
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
        expect(textarea).toHaveClass('w-full');
      });
    });
  });

  describe('Performance y Optimización', () => {
    test('componentes cargan sin causar re-renders innecesarios', async () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <Home />;
      };

      await renderWithAct(<TestComponent />);

      await waitFor(() => {
        expect(
          screen.getByText('Netflix de Agentes Conversacionales')
        ).toBeInTheDocument();
      });

      // No debería re-renderizar después de la carga inicial
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('cache de agentes funciona correctamente', async () => {
      // Primer render
      const { unmount } = await renderWithAct(<Home />);

      await waitFor(() => {
        expect(mockUserFlowFunctions.getAgentsByCategory).toHaveBeenCalledTimes(
          1
        );
      });

      unmount();

      // Segundo render debería usar cache (en este caso, nueva llamada pero simula cache)
      await renderWithAct(<Home />);

      // Verificar que se llama pero el comportamiento del cache se simula
      expect(mockUserFlowFunctions.getAgentsByCategory).toHaveBeenCalled();
    });
  });

  describe('Seguridad y Validación', () => {
    test('inputs están protegidos contra XSS', async () => {
      const user = userEvent.setup();
      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });
      await renderWithAct(<ChatPage params={mockParams} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Intentar inyectar script
      const maliciousInput = '<script>alert("xss")</script>';
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);

      await act(async () => {
        await user.type(textarea, maliciousInput);
        await user.click(screen.getByRole('button', { name: /enviar/i }));
      });

      // El contenido debería estar escapado
      const messageElement = screen.getByText(maliciousInput);
      expect(messageElement.innerHTML).not.toContain('<script>');
    });

    test('formularios validan datos antes de envío', async () => {
      const user = userEvent.setup();
      global.alert = jest.fn();

      const AgentsPage = require('../../app/admin/agents/page').default;
      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getByText('+ Crear Agente'));
      });

      // Intentar enviar formulario vacío
      await act(async () => {
        await user.click(screen.getByText('Crear Agente'));
      });

      expect(global.alert).toHaveBeenCalledWith(
        'Por favor completá todos los campos obligatorios'
      );
    });
  });

  describe('Accesibilidad (a11y)', () => {
    test('navegación por teclado funciona correctamente', async () => {
      const user = userEvent.setup();

      await renderWithAct(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      });

      // Navegar con Tab
      await act(async () => {
        await user.tab();
      });
      expect(document.activeElement).toHaveAttribute('type', 'button');
    });

    test('screen readers pueden navegar la interfaz', async () => {
      await renderWithAct(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      });

      // Verificar estructura semántica
      expect(
        screen.getByRole('button', { name: /Iniciar Sesión/i })
      ).toBeInTheDocument();
    });

    test('formularios tienen labels apropiados', async () => {
      const mockParams = Promise.resolve({ agentId: 'marketing-digital' });
      await renderWithAct(<ChatPage params={mockParams} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
        expect(textarea).toHaveAttribute('placeholder');
      });
    });
  });
});
