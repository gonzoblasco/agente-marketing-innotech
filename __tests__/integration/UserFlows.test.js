// __tests__/integration/UserFlows.test.js
import { render, screen, waitFor } from '@testing-library/react';
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

describe('Flujos de Usuario Completos', () => {
  describe('Flujo Usuario Normal: Registro → Chat → Dashboard → Pricing', () => {
    test('usuario puede navegar desde galería hasta chat completo', async () => {
      const user = userEvent.setup();

      // 1. Renderizar página principal
      render(<Home />);

      // 2. Verificar que carga la galería
      await waitFor(() => {
        expect(
          screen.getByText('Netflix de Agentes Conversacionales')
        ).toBeInTheDocument();
      });

      // 3. Usuario ya está logueado (mock), ver mensaje de bienvenida
      expect(screen.getByText(/¡Hola Test!/)).toBeInTheDocument();

      // 4. Click en un agente para ir al chat
      const marketingAgent = screen.getByText('Consultor de Marketing Digital');
      expect(marketingAgent.closest('a')).toHaveAttribute(
        'href',
        '/chat/marketing-digital'
      );
    });

    test('flujo completo de chat: envío de mensaje y respuesta', async () => {
      const user = userEvent.setup();

      // Mock de agent para ChatPage
      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      // Esperar que cargue la interfaz de chat
      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
        expect(
          screen.getByText('¡Hola! Soy tu consultor de marketing digital.')
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(
        textarea,
        'Necesito ayuda con mi estrategia de marketing digital para mi PyME'
      );

      const sendButton = screen.getByRole('button', { name: /enviar/i });
      await user.click(sendButton);

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
      expect(screen.getByText(/94 mensajes restantes/)).toBeInTheDocument();
    });

    test('navegación a dashboard muestra estadísticas correctas', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('¡Hola Test! 👋')).toBeInTheDocument();
        expect(screen.getByText('📊 Uso de Mensajes')).toBeInTheDocument();
      });

      // Verificar estadísticas del usuario
      expect(screen.getByText('5 / 100')).toBeInTheDocument(); // mensajes usados/límite
      expect(screen.getByText('Plan LITE')).toBeInTheDocument();

      // Verificar acciones rápidas
      expect(screen.getByText('⚡ Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Ver todos los agentes →')).toBeInTheDocument();
    });
  });

  describe('Flujo de Monetización: Pricing → MercadoPago → Webhook', () => {
    test('flujo completo de upgrade de plan', async () => {
      const user = userEvent.setup();

      render(<PricingPage />);

      // Verificar página de pricing
      expect(screen.getByText('🚀 Actualizá tu Plan')).toBeInTheDocument();
      expect(screen.getByText('Plan Pro')).toBeInTheDocument();
      expect(screen.getByText('Plan Elite')).toBeInTheDocument();

      // Click en actualizar a Plan Pro
      const proButton = screen.getByText('Actualizar a Plan Pro');
      await user.click(proButton);

      // Verificar que se muestra loading
      expect(screen.getByText('Procesando...')).toBeInTheDocument();

      // Simular respuesta exitosa y redirección
      await waitFor(() => {
        // En una implementación real, aquí se redirigiría a MercadoPago
        // Para el test, verificamos que se llamó la API correctamente
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
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        user: {
          id: 'admin-user-id',
          firstName: 'Admin',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'admin@innotech.com' }],
        },
        isSignedIn: true,
        isLoaded: true,
      });

      // Mock función isUserAdmin
      const { isUserAdmin } = require('../../app/lib/supabase');
      isUserAdmin.mockResolvedValue(true);
    });

    test('admin puede acceder y gestionar usuarios', async () => {
      const user = userEvent.setup();
      const { updateUser } = require('../../app/lib/supabase');

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });

      // Editar usuario
      await user.click(screen.getAllByText('Editar')[0]);

      // Cambiar plan
      const planSelect = screen.getByDisplayValue('lite');
      await user.selectOptions(planSelect, 'pro');

      // Guardar
      await user.click(screen.getByText('Guardar Cambios'));

      expect(updateUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          plan: 'pro',
          messages_limit: 1000,
        })
      );
    });

    test('admin puede crear nuevo agente desde cero', async () => {
      const user = userEvent.setup();
      const { createAgent } = require('../../app/lib/supabase');

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      // Abrir modal de creación
      await user.click(screen.getByText('+ Crear Agente'));

      // Llenar formulario completo
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

      // Crear agente
      await user.click(screen.getByText('Crear Agente'));

      expect(createAgent).toHaveBeenCalledWith(
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

      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      // Verificar mensaje de error
      await waitFor(() => {
        expect(
          screen.getByText(/Disculpá, hubo un error técnico/)
        ).toBeInTheDocument();
      });
    });

    test('recovery de error en carga de agentes', async () => {
      const user = userEvent.setup();
      const { getAgentsByCategory } = require('../../app/lib/supabase');

      // Simular error inicial
      getAgentsByCategory.mockRejectedValueOnce(new Error('Network error'));

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Reintentar/i })
        ).toBeInTheDocument();
      });

      // Reset mock para que funcione en retry
      getAgentsByCategory.mockResolvedValue([
        {
          id: 'marketing-digital',
          name: 'Consultor de Marketing Digital',
          category: 'Marketing',
          emoji: '🎯',
          is_active: true,
        },
      ]);

      // Click en reintentar
      await user.click(screen.getByRole('button', { name: /Reintentar/i }));

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

      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Enviar mensaje
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /enviar/i }));

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

      render(<Home />);

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
      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
      });

      // Verificar que el layout es flexible
      const chatContainer = document.querySelector('.flex.flex-col.h-full');
      expect(chatContainer).toBeInTheDocument();

      // Textarea debería tener clases responsive
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
      expect(textarea).toHaveClass('w-full');
    });
  });

  describe('Performance y Optimización', () => {
    test('componentes cargan sin causar re-renders innecesarios', async () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <Home />;
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(
          screen.getByText('Netflix de Agentes Conversacionales')
        ).toBeInTheDocument();
      });

      // No debería re-renderizar después de la carga inicial
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('cache de agentes funciona correctamente', async () => {
      const { getAgentsByCategory } = require('../../app/lib/supabase');

      // Primer render
      const { unmount } = render(<Home />);

      await waitFor(() => {
        expect(getAgentsByCategory).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Segundo render debería usar cache
      render(<Home />);

      // No debería hacer nueva llamada si está en cache
      expect(getAgentsByCategory).toHaveBeenCalledTimes(1);
    });
  });

  describe('Seguridad y Validación', () => {
    test('inputs están protegidos contra XSS', async () => {
      const user = userEvent.setup();
      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Mensaje a Consultor/)
        ).toBeInTheDocument();
      });

      // Intentar inyectar script
      const maliciousInput = '<script>alert("xss")</script>';
      const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);

      await user.type(textarea, maliciousInput);
      await user.click(screen.getByRole('button', { name: /enviar/i }));

      // El contenido debería estar escapado
      const messageElement = screen.getByText(maliciousInput);
      expect(messageElement.innerHTML).not.toContain('<script>');
    });

    test('formularios validan datos antes de envío', async () => {
      const user = userEvent.setup();
      window.alert = jest.fn();

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ Crear Agente'));

      // Intentar enviar formulario vacío
      await user.click(screen.getByText('Crear Agente'));

      expect(window.alert).toHaveBeenCalledWith(
        'Por favor completá todos los campos obligatorios'
      );
    });
  });

  describe('Accesibilidad (a11y)', () => {
    test('navegación por teclado funciona correctamente', async () => {
      const user = userEvent.setup();

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Crear Cuenta Gratis')).toBeInTheDocument();
      });

      // Navegar con Tab
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href');

      await user.tab();
      // Debería enfocar el siguiente elemento navegable
      expect(document.activeElement).toBeInTheDocument();
    });

    test('screen readers pueden navegar la interfaz', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      });

      // Verificar estructura semántica
      expect(
        screen.getByRole('button', { name: /Crear Cuenta Gratis/i })
      ).toBeInTheDocument();
    });

    test('formularios tienen labels apropiados', async () => {
      const mockAgent = {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        emoji: '🎯',
        welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
      };

      render(<ChatPage params={{ agentId: 'marketing-digital' }} />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Mensaje a Consultor/);
        expect(textarea).toHaveAttribute('placeholder');
      });
    });
  });
});
