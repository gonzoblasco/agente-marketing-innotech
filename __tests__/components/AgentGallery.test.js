// __tests__/components/AgentGallery.test.js
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgentGallery from '../../app/components/AgentGallery';
import {
  getAgentsByCategory,
  getUniqueCategories,
} from '../../app/lib/supabase';

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

describe('AgentGallery', () => {
  beforeEach(() => {
    // Reset mocks antes de cada test
    getAgentsByCategory.mockResolvedValue(mockAgents);
    getUniqueCategories.mockResolvedValue(mockCategories);
  });

  describe('Renderizado inicial', () => {
    test('muestra el título principal', async () => {
      render(<AgentGallery />);

      expect(
        screen.getByText('Netflix de Agentes Conversacionales')
      ).toBeInTheDocument();
      expect(screen.getByText(/Elegí tu experto ideal/)).toBeInTheDocument();
    });

    test('muestra estado de carga inicialmente', () => {
      render(<AgentGallery />);

      expect(
        screen.getByText(/Cargando agentes especializados/)
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    });

    test('carga agentes y categorías correctamente', async () => {
      render(<AgentGallery />);

      // Esperar a que carguen los datos
      await waitFor(() => {
        expect(
          screen.getByText('2 agentes especializados en 2 categorías')
        ).toBeInTheDocument();
      });

      // Verificar que se llamen las funciones correctas
      expect(getUniqueCategories).toHaveBeenCalledTimes(1);
      expect(getAgentsByCategory).toHaveBeenCalledWith(null);
    });
  });

  describe('Estado de usuario', () => {
    test('muestra mensaje de bienvenida para usuario logueado', async () => {
      render(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/¡Hola Test!/)).toBeInTheDocument();
        expect(
          screen.getByText(/acceso completo a todos los agentes/)
        ).toBeInTheDocument();
      });
    });

    test('muestra botón de login para usuario no logueado', async () => {
      // Override del mock para simular usuario no logueado
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        user: null,
        isSignedIn: false,
        isLoaded: true,
      });

      render(<AgentGallery />);

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
      render(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText('🔍 Todas')).toBeInTheDocument();
        expect(screen.getByText('🎯 Marketing')).toBeInTheDocument();
        expect(screen.getByText('⚡ Productividad')).toBeInTheDocument();
      });
    });

    test('cambia categoría seleccionada al hacer click', async () => {
      const user = userEvent.setup();
      render(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText('🎯 Marketing')).toBeInTheDocument();
      });

      // Click en categoría Marketing
      await user.click(screen.getByText('🎯 Marketing'));

      // Verificar que se llame con la categoría correcta
      expect(getAgentsByCategory).toHaveBeenCalledWith('Marketing');
    });

    test('muestra contadores de agentes por categoría', async () => {
      render(<AgentGallery />);

      await waitFor(() => {
        // Los contadores aparecen después de cargar agentes
        expect(screen.getByText(/Marketing/)).toBeInTheDocument();
        expect(screen.getByText(/Productividad/)).toBeInTheDocument();
      });
    });
  });

  describe('Grid de agentes', () => {
    test('renderiza todos los agentes cargados', async () => {
      render(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
        expect(screen.getByText('Mentor de Productividad')).toBeInTheDocument();
      });
    });

    test('cada agente muestra información correcta', async () => {
      render(<AgentGallery />);

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
      render(<AgentGallery />);

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

      render(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
        expect(
          screen.getByText(/Database connection failed/)
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /Reintentar/ })
        ).toBeInTheDocument();
      });
    });

    test('botón reintentar vuelve a cargar datos', async () => {
      const user = userEvent.setup();

      // Simular error inicial
      getAgentsByCategory.mockRejectedValueOnce(new Error('Network error'));

      render(<AgentGallery />);

      await waitFor(() => {
        expect(screen.getByText(/Error al cargar datos/)).toBeInTheDocument();
      });

      // Resetear mock para que funcione en el retry
      getAgentsByCategory.mockResolvedValue(mockAgents);

      // Click en reintentar
      await user.click(screen.getByRole('button', { name: /Reintentar/ }));

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

      render(<AgentGallery />);

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
      getAgentsByCategory.mockResolvedValue([]);

      render(<AgentGallery />);

      // Esperar carga inicial
      await waitFor(() => {
        expect(screen.getByText('🔍 Todas')).toBeInTheDocument();
      });

      // Simular click en categoría específica que no tiene agentes
      const user = userEvent.setup();
      await user.click(screen.getByText('🎯 Marketing'));

      await waitFor(() => {
        expect(
          screen.getByText(/No hay agentes en la categoría "Marketing"/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Responsiveness', () => {
    test('aplica clases CSS correctas para grid responsive', async () => {
      render(<AgentGallery />);

      await waitFor(() => {
        const gridContainer =
          screen.getByTestId('agents-grid') || document.querySelector('.grid');
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
      render(<AgentGallery />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('botones tienen labels descriptivos', async () => {
      render(<AgentGallery />);

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
      render(<AgentGallery />);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /Consultor de Marketing Digital/ })
        ).toBeInTheDocument();
      });
    });
  });
});
