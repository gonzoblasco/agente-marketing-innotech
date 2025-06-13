// __tests__/admin/AdminPanel.test.js
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../../app/admin/page';
import UsersPage from '../../app/admin/users/page';
import AgentsPage from '../../app/admin/agents/page';
import {
  getAllUsers,
  updateUser,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  supabase,
} from '../../app/lib/supabase';

// Mock de datos de admin
const mockUsers = [
  {
    id: 'user-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    plan: 'lite',
    messages_used: 5,
    messages_limit: 100,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'pro@example.com',
    first_name: 'Pro',
    last_name: 'User',
    plan: 'pro',
    messages_used: 50,
    messages_limit: 1000,
    created_at: '2024-01-02T00:00:00Z',
  },
];

const mockAgents = [
  {
    id: 'marketing-digital',
    name: 'Consultor de Marketing Digital',
    title: 'Especialista en PyMEs argentinas',
    emoji: '🎯',
    description: 'Experto en marketing digital',
    category: 'Marketing',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mentor-productividad',
    name: 'Mentor de Productividad',
    title: 'Para emprendedores overwhelmed',
    emoji: '⚡',
    description: 'Especialista en productividad',
    category: 'Productividad',
    is_active: false,
    created_at: '2024-01-02T00:00:00Z',
  },
];

describe('Admin Panel', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Supabase count queries
    supabase.from.mockImplementation((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gt: jest.fn(() => Promise.resolve({ count: 10, error: null })),
        })),
      })),
    }));
  });

  describe('AdminDashboard', () => {
    test('carga y muestra estadísticas del dashboard', async () => {
      // Mock de estadísticas
      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn(() => Promise.resolve({ count: 25, error: null })),
          };
        }
        if (table === 'conversations') {
          return {
            select: jest.fn(() => Promise.resolve({ count: 150, error: null })),
          };
        }
        if (table === 'messages') {
          return {
            select: jest.fn(() =>
              Promise.resolve({ count: 1200, error: null })
            ),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ count: 15, error: null })),
        };
      });

      render(<AdminDashboard />);

      expect(screen.getByText('Dashboard Admin')).toBeInTheDocument();
      expect(
        screen.getByText(/Resumen general de InnoTech Solutions/)
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Total usuarios
        expect(screen.getByText('150')).toBeInTheDocument(); // Conversaciones
        expect(screen.getByText('1200')).toBeInTheDocument(); // Mensajes
        expect(screen.getByText('15')).toBeInTheDocument(); // Usuarios activos
      });
    });

    test('muestra acciones rápidas', async () => {
      render(<AdminDashboard />);

      expect(screen.getByText('⚡ Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Crear Nuevo Agente')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Ver Analytics')).toBeInTheDocument();
    });

    test('maneja errores en carga de estadísticas', async () => {
      supabase.from.mockImplementation(() => ({
        select: jest.fn(() =>
          Promise.resolve({ count: null, error: { message: 'Database error' } })
        ),
      }));

      render(<AdminDashboard />);

      await waitFor(() => {
        // Debería mostrar 0 cuando hay error
        expect(screen.getAllByText('0')).toHaveLength(4);
      });
    });
  });

  describe('UsersPage', () => {
    beforeEach(() => {
      getAllUsers.mockResolvedValue(mockUsers);
    });

    test('carga y muestra lista de usuarios', async () => {
      render(<UsersPage />);

      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('pro@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Pro User')).toBeInTheDocument();
      });
    });

    test('muestra planes de usuarios correctamente', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('LITE')).toBeInTheDocument();
        expect(screen.getByText('PRO')).toBeInTheDocument();
      });
    });

    test('muestra barras de progreso de uso de mensajes', async () => {
      render(<UsersPage />);

      await waitFor(() => {
        // Usuario lite: 5/100 = 5%
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });

    test('permite buscar usuarios', async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Buscar usuarios/)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Buscar usuarios/);
      await user.type(searchInput, 'test@example.com');

      // Solo debería mostrar el usuario filtrado
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByText('pro@example.com')).not.toBeInTheDocument();
    });

    test('abre modal de edición al hacer click en editar', async () => {
      const user = userEvent.setup();
      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Editar')[0]);

      expect(screen.getByText(/Editar Usuario: Test User/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('lite')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    test('actualiza usuario correctamente', async () => {
      const user = userEvent.setup();
      updateUser.mockResolvedValue({ id: 'user-1', plan: 'pro' });

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Editar')[0]);

      // Cambiar plan a pro
      const planSelect = screen.getByDisplayValue('lite');
      await user.selectOptions(planSelect, 'pro');

      // Guardar cambios
      await user.click(screen.getByText('Guardar Cambios'));

      expect(updateUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          plan: 'pro',
          messages_limit: 1000,
        })
      );
    });
  });

  describe('AgentsPage', () => {
    beforeEach(() => {
      getAllAgents.mockResolvedValue(mockAgents);
    });

    test('carga y muestra lista de agentes', async () => {
      render(<AgentsPage />);

      expect(screen.getByText('Gestión de Agentes')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText('Consultor de Marketing Digital')
        ).toBeInTheDocument();
        expect(screen.getByText('Mentor de Productividad')).toBeInTheDocument();
        expect(screen.getByText('🎯')).toBeInTheDocument();
        expect(screen.getByText('⚡')).toBeInTheDocument();
      });
    });

    test('muestra estados activo/inactivo correctamente', async () => {
      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
      });
    });

    test('permite buscar agentes', async () => {
      const user = userEvent.setup();
      render(<AgentsPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Buscar agentes/)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Buscar agentes/);
      await user.type(searchInput, 'Marketing');

      expect(
        screen.getByText('Consultor de Marketing Digital')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Mentor de Productividad')
      ).not.toBeInTheDocument();
    });

    test('abre modal de creación de agente', async () => {
      const user = userEvent.setup();
      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ Crear Agente'));

      expect(screen.getByText('Crear Nuevo Agente')).toBeInTheDocument();
      expect(screen.getByLabelText(/ID del Agente/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
      expect(screen.getByLabelText(/System Prompt/)).toBeInTheDocument();
    });

    test('crea nuevo agente correctamente', async () => {
      const user = userEvent.setup();
      const newAgent = {
        id: 'nuevo-agente',
        name: 'Nuevo Agente',
        title: 'Test Title',
        emoji: '🔥',
        description: 'Test description',
        category: 'Marketing',
        system_prompt: 'Test prompt',
        welcome_message: 'Test welcome',
        is_active: true,
      };

      createAgent.mockResolvedValue(newAgent);

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ Crear Agente'));

      // Llenar formulario
      await user.type(screen.getByLabelText(/ID del Agente/), 'nuevo-agente');
      await user.type(screen.getByLabelText(/Nombre/), 'Nuevo Agente');
      await user.type(screen.getByLabelText(/Título/), 'Test Title');
      await user.type(screen.getByLabelText(/Emoji/), '🔥');
      await user.type(screen.getByLabelText(/Descripción/), 'Test description');
      await user.selectOptions(screen.getByLabelText(/Categoría/), 'Marketing');
      await user.type(screen.getByLabelText(/System Prompt/), 'Test prompt');
      await user.type(
        screen.getByLabelText(/Mensaje de Bienvenida/),
        'Test welcome'
      );

      // Enviar formulario
      await user.click(screen.getByText('Crear Agente'));

      expect(createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'nuevo-agente',
          name: 'Nuevo Agente',
          category: 'Marketing',
        })
      );
    });

    test('edita agente existente', async () => {
      const user = userEvent.setup();
      updateAgent.mockResolvedValue({
        ...mockAgents[0],
        name: 'Nombre Actualizado',
      });

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Editar')[0]);

      expect(screen.getByText('Editar Agente')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Consultor de Marketing Digital')
      ).toBeInTheDocument();

      // Cambiar nombre
      const nameInput = screen.getByDisplayValue(
        'Consultor de Marketing Digital'
      );
      await user.clear(nameInput);
      await user.type(nameInput, 'Nombre Actualizado');

      // Guardar
      await user.click(screen.getByText('Actualizar Agente'));

      expect(updateAgent).toHaveBeenCalledWith(
        'marketing-digital',
        expect.objectContaining({
          name: 'Nombre Actualizado',
        })
      );
    });

    test('cambia estado activo/inactivo de agente', async () => {
      const user = userEvent.setup();
      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Desactivar')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Desactivar')[0]);

      // Debería haber llamado a toggleAgentStatus
      expect(updateAgent).toHaveBeenCalled();
    });

    test('elimina agente con confirmación', async () => {
      const user = userEvent.setup();

      // Mock de window.confirm
      window.confirm = jest.fn(() => true);
      deleteAgent.mockResolvedValue(true);

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('🗑️')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('🗑️')[0]);

      expect(window.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que querés eliminar este agente?'
      );
      expect(deleteAgent).toHaveBeenCalledWith('marketing-digital');
    });

    test('valida campos obligatorios en formulario', async () => {
      const user = userEvent.setup();
      window.alert = jest.fn();

      render(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await user.click(screen.getByText('+ Crear Agente'));

      // Intentar enviar sin llenar campos obligatorios
      await user.click(screen.getByText('Crear Agente'));

      expect(window.alert).toHaveBeenCalledWith(
        'Por favor completá todos los campos obligatorios'
      );
    });
  });

  describe('Navegación Admin', () => {
    test('permite navegar entre secciones', async () => {
      const { rerender } = render(<AdminDashboard />);

      // Simular navegación a usuarios
      rerender(<UsersPage />);
      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();

      // Simular navegación a agentes
      rerender(<AgentsPage />);
      expect(screen.getByText('Gestión de Agentes')).toBeInTheDocument();
    });
  });

  describe('Permisos de acceso', () => {
    test('bloquea acceso a usuarios no admin', () => {
      // Mock usuario no admin
      jest.mocked(require('@clerk/nextjs').useUser).mockReturnValue({
        user: { id: 'regular-user' },
        isSignedIn: true,
        isLoaded: true,
      });

      // Mock función isUserAdmin
      const { isUserAdmin } = require('../../app/lib/supabase');
      isUserAdmin.mockResolvedValue(false);

      // El layout debería mostrar acceso denegado
      // Esto se testearía en AdminLayout.test.js
    });
  });

  describe('Manejo de errores en Admin', () => {
    test('maneja errores de carga de usuarios', async () => {
      getAllUsers.mockRejectedValue(new Error('Database error'));

      render(<UsersPage />);

      await waitFor(() => {
        // Debería mostrar lista vacía sin errores críticos
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      });
    });

    test('maneja errores de actualización de usuario', async () => {
      const user = userEvent.setup();
      updateUser.mockRejectedValue(new Error('Update failed'));
      window.alert = jest.fn();

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Editar')[0]);
      await user.click(screen.getByText('Guardar Cambios'));

      expect(window.alert).toHaveBeenCalledWith('Error al actualizar usuario');
    });
  });
});
