// __tests__/components/AgentGallery.test.js
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentGallery from '../../app/components/AgentGallery';

// Los mocks ya están configurados en jest.setup.js
const {
  getAgentsByCategory,
  getUniqueCategories,
} = require('../../app/lib/supabase');

// Mock de los datos de agentes
const mockAgents = [
  {
    id: 'marketing-digital',
    name: 'Consultor de Marketing Digital',
    category: 'Marketing',
    emoji: '🎯',
    description: 'Experto en marketing digital para PyMEs argentinas',
    is_active: true,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    id: 'mentor-productividad',
    name: 'Mentor de Productividad',
    category: 'Productividad',
    emoji: '⚡',
    description: 'Especialista en productividad para emprendedores',
    is_active: true,
    color: 'green',
    gradient: 'from-green-500 to-green-700',
  },
];

const mockCategories = ['Marketing', 'Productividad'];

// Wrapper para act
const renderWithAct = async (component) => {
  let result;
  await act(async () => {
    result = render(component);
  });
  return result;
};

describe('AgentGallery', () => {
  beforeEach(() => {
    // Reset mocks antes de cada test
    jest.clearAllMocks();
    getAgentsByCategory.mockResolvedValue(mockAgents);
    getUniqueCategories.mockResolvedValue(mockCategories);
  });

  describe('Renderizado inicial', () => {
    test('muestra el título principal', async () => {
      await renderWithAct(<AgentGallery />);

      expect(
        screen.getByText('Netflix de Agentes Conversacionales')
      ).toBeInTheDocument();
    });

    test('muestra estado de carga inicialmente', async () => {
      // Hacer que getAgentsByCategory tome tiempo
      getAgentsByCategory.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockAgents), 100))
      );

      await renderWithAct(<AgentGallery />);

      expect(
        screen.getByText(/Cargando agentes especializados/)
      ).toBeInTheDocument();
    });

    test('carga agentes y categorías correctamente', async () => {
      await renderWithAct(<AgentGallery />);

      // Esperar a que carguen los datos
      await waitFor(() => {
        expect(
          screen.getByText('2 agentes especializados en 2 categorías')
        ).toBeInTheDocument();
      });

      // Verificar que se llamen las funciones correctas
      expect(getAgentsByCategory).toHaveBeenCalledWith(null);
    });
  });

  describe('Estado de usuario', () => {
    test('muestra mensaje de bienvenida para usuario logueado', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/¡Hola Test!/)).toBeInTheDocument();
        expect(
          screen.getByText(/acceso completo a todos los agentes/)
        ).toBeInTheDocument();
      });
    });

    test('muestra botón de login para usuario no logueado', async () => {
      // Override del mock para simular usuario no logueado
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({
        user: null,
        isSignedIn: false,
        isLoaded: true,
      });

      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByText(/Iniciá sesión para acceder/)
        ).toBeInTheDocument();
        expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
      });
    });
  });

  describe('Filtros de categorías', () => {
    test('muestra todas las categorías incluida "Todas"', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText('🔍 Todas')).toBeInTheDocument();
        // Usar getAllByText para elementos duplicados
        expect(screen.getAllByText(/Marketing/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Productividad/)[0]).toBeInTheDocument();
      });
    });

    test('cambia categoría seleccionada al hacer click', async () => {
      const user = userEvent.setup();
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getAllByText(/Marketing/)[0]).toBeInTheDocument();
      });

      // Click en categoría Marketing - usar el botón específico
      const marketingButton = screen.getByRole('button', {
        name: /🎯 Marketing/,
      });
      await act(async () => {
        await user.click(marketingButton);
      });

      // Verificar que se llame con la categoría correcta
      expect(getAgentsByCategory).toHaveBeenCalledWith('Marketing');
    });

    test('muestra contadores de agentes por categoría', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        // Verificar contadores
        expect(screen.getByText('(2)')).toBeInTheDocument(); // Total
        expect(screen.getByText('(1)')).toBeInTheDocument(); // Marketing
      });
    });
  });

  describe('Grid de agentes', () => {
    test('renderiza todos los agentes cargados', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
        expect(screen.getByText('Mentor de Productividad')).toBeInTheDocument();
      });
    });

    test('cada agente muestra información correcta', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        // Verificar emoji
        expect(screen.getByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('⚡')).toBeInTheDocument();

        // Verificar descripciones
        expect(
          screen.getByText(/Experto en marketing digital/)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Especialista en productividad/)
        ).toBeInTheDocument();
      });
    });

    test('links de agentes apuntan a URLs correctas', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        const marketingLink = screen.getByRole('link', {
          name: /Consultor de Marketing Digital/,
        });
        expect(marketingLink).toHaveAttribute(
          'href',
          '/chat/marketing-digital'
        );
      });
    });
  });

  describe('Manejo de errores', () => {
    test('muestra mensaje de error cuando falla la carga', async () => {
      // Simular error en la carga
      getAgentsByCategory.mockRejectedValue(
        new Error('Database connection failed')
      );

      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Reintentar/ })
        ).toBeInTheDocument();
      });
    });

    test('botón reintentar vuelve a cargar datos', async () => {
      const user = userEvent.setup();

      // Simular error inicial
      getAgentsByCategory.mockRejectedValueOnce(new Error('Network error'));

      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
      });

      // Resetear mock para que funcione en el retry
      getAgentsByCategory.mockResolvedValue(mockAgents);

      // Click en reintentar
      const retryButton = screen.getByRole('button', { name: /Reintentar/ });
      await act(async () => {
        await user.click(retryButton);
      });

      // Verificar que se vuelva a cargar
      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Estado vacío', () => {
    test('muestra mensaje cuando no hay agentes', async () => {
      getAgentsByCategory.mockResolvedValue([]);

      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByText(/No hay agentes disponibles/)
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Recargar/ })
        ).toBeInTheDocument();
      });
    });

    test('muestra mensaje específico para categoría vacía', async () => {
      await renderWithAct(<AgentGallery />);

      // Esperar carga inicial
      await waitFor(() => {
        expect(screen.getByText('🔍 Todas')).toBeInTheDocument();
      });

      // Simular que no hay agentes para una categoría específica
      getAgentsByCategory.mockResolvedValue([]);

      // Simular click en categoría específica
      const user = userEvent.setup();
      const marketingButton = screen.getByRole('button', {
        name: /🎯 Marketing/,
      });

      await act(async () => {
        await user.click(marketingButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/No hay agentes en la categoría "Marketing"/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Responsiveness', () => {
    test('aplica clases CSS correctas para grid responsive', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        const gridContainer = document.querySelector('.grid');
        expect(gridContainer).toHaveClass(
          'grid-cols-1',
          'md:grid-cols-2',
          'lg:grid-cols-3'
        );
      });
    });
  });

  describe('Accesibilidad', () => {
    test('tiene estructura semántica correcta', async () => {
      await renderWithAct(<AgentGallery />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('botones tienen labels descriptivos', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /🔍 Todas/ })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /🎯 Marketing/ })
        ).toBeInTheDocument();
      });
    });

    test('links tienen textos accesibles', async () => {
      await renderWithAct(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Consultor de Marketing Digital/ })
        ).toBeInTheDocument();
      });
    });
  });
});
