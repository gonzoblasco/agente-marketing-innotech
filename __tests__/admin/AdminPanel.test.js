// __tests__/admin/AdminPanel.test.js
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboard from '../../app/admin/page';
import UsersPage from '../../app/admin/users/page';
import AgentsPage from '../../app/admin/agents/page';

// Los mocks ya están configurados en jest.setup.js
const mockSupabase = require('../../app/lib/supabase').supabase;
const mockAdminFunctions = require('../../app/lib/supabase');

// Wrapper para act
const renderWithAct = async (component) => {
  let result;
  await act(async () => {
    result = render(component);
  });
  return result;
};

describe('Admin Panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase count queries con estructura correcta
    mockSupabase.from.mockImplementation((table) => ({
      select: jest.fn(() => {
        if (table === 'users') {
          return Promise.resolve({ count: 25, error: null });
        }
        if (table === 'conversations') {
          return Promise.resolve({ count: 150, error: null });
        }
        if (table === 'messages') {
          return Promise.resolve({ count: 1200, error: null });
        }
        return Promise.resolve({ count: 15, error: null });
      }),
    }));

    // Configurar datos de ejemplo actualizados
    mockAdminFunctions.getAllUsers.mockResolvedValue([
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
    ]);

    mockAdminFunctions.getAllAgents.mockResolvedValue([
      {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        title: 'Especialista en PyMEs argentinas',
        emoji: '🎯',
        description: 'Experto en marketing digital',
        category: 'Marketing',
        is_active: true,
        gradient: 'from-blue-500 to-blue-700',
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
        gradient: 'from-green-500 to-green-700',
        created_at: '2024-01-02T00:00:00Z',
      },
    ]);
  });

  describe('AdminDashboard', () => {
    test('carga y muestra estadísticas del dashboard', async () => {
      await renderWithAct(<AdminDashboard />);

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
      await renderWithAct(<AdminDashboard />);

      expect(screen.getByText('⚡ Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Crear Nuevo Agente')).toBeInTheDocument();
      expect(screen.getByText('Gestionar Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Ver Analytics')).toBeInTheDocument();
    });

    test('maneja errores en carga de estadísticas', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn(() =>
          Promise.resolve({ count: null, error: { message: 'Database error' } })
        ),
      }));

      await renderWithAct(<AdminDashboard />);

      await waitFor(() => {
        // Debería mostrar 0 cuando hay error
        expect(screen.getAllByText('0')).toHaveLength(4);
      });
    });
  });

  describe('UsersPage', () => {
    test('carga y muestra lista de usuarios', async () => {
      await renderWithAct(<UsersPage />);

      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('pro@example.com')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Pro User')).toBeInTheDocument();
      });
    });

    test('muestra planes de usuarios correctamente', async () => {
      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText('LITE')).toBeInTheDocument();
        expect(screen.getByText('PRO')).toBeInTheDocument();
      });
    });

    test('muestra barras de progreso de uso de mensajes', async () => {
      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        // Verificar que hay elementos de progreso
        const progressElements = document.querySelectorAll(
          '.bg-green-500, .bg-yellow-500, .bg-red-500'
        );
        expect(progressElements.length).toBeGreaterThan(0);
      });
    });

    test('permite buscar usuarios', async () => {
      const user = userEvent.setup();
      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Buscar usuarios/)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Buscar usuarios/);
      await act(async () => {
        await user.type(searchInput, 'test@example.com');
      });

      // Solo debería mostrar el usuario filtrado
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.queryByText('pro@example.com')).not.toBeInTheDocument();
    });

    test('abre modal de edición al hacer click en editar', async () => {
      const user = userEvent.setup();
      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('Editar')[0]);
      });

      expect(screen.getByText(/Editar Usuario: Test User/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('lite')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    test('actualiza usuario correctamente', async () => {
      const user = userEvent.setup();
      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('Editar')[0]);
      });

      // Cambiar plan a pro
      const planSelect = screen.getByDisplayValue('lite');
      await act(async () => {
        await user.selectOptions(planSelect, 'pro');
      });

      // Guardar cambios
      await act(async () => {
        await user.click(screen.getByText('Guardar Cambios'));
      });

      expect(mockAdminFunctions.updateUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          plan: 'pro',
          messages_limit: 1000,
        })
      );
    });
  });

  describe('AgentsPage', () => {
    test('carga y muestra lista de agentes', async () => {
      await renderWithAct(<AgentsPage />);

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
      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Activo')).toBeInTheDocument();
        expect(screen.getByText('Inactivo')).toBeInTheDocument();
      });
    });

    test('permite buscar agentes', async () => {
      const user = userEvent.setup();
      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Buscar agentes/)
        ).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Buscar agentes/);
      await act(async () => {
        await user.type(searchInput, 'Marketing');
      });

      expect(
        screen.getByText('Consultor de Marketing Digital')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Mentor de Productividad')
      ).not.toBeInTheDocument();
    });

    test('abre modal de creación de agente', async () => {
      const user = userEvent.setup();
      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getByText('+ Crear Agente'));
      });

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

      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getByText('+ Crear Agente'));
      });

      // Llenar formulario
      await act(async () => {
        await user.type(screen.getByLabelText(/ID del Agente/), 'nuevo-agente');
        await user.type(screen.getByLabelText(/Nombre/), 'Nuevo Agente');
        await user.type(screen.getByLabelText(/Título/), 'Test Title');
        await user.type(screen.getByLabelText(/Emoji/), '🔥');
        await user.type(
          screen.getByLabelText(/Descripción/),
          'Test description'
        );
        await user.selectOptions(
          screen.getByLabelText(/Categoría/),
          'Marketing'
        );
        await user.type(screen.getByLabelText(/System Prompt/), 'Test prompt');
        await user.type(
          screen.getByLabelText(/Mensaje de Bienvenida/),
          'Test welcome'
        );
      });

      // Enviar formulario
      await act(async () => {
        await user.click(screen.getByText('Crear Agente'));
      });

      expect(mockAdminFunctions.createAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'nuevo-agente',
          name: 'Nuevo Agente',
          category: 'Marketing',
        })
      );
    });

    test('edita agente existente', async () => {
      const user = userEvent.setup();
      mockAdminFunctions.updateAgent.mockResolvedValue({
        ...mockAdminFunctions.getAllAgents()[0],
        name: 'Nombre Actualizado',
      });

      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('Editar')[0]);
      });

      expect(screen.getByText('Editar Agente')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Consultor de Marketing Digital')
      ).toBeInTheDocument();

      // Cambiar nombre
      const nameInput = screen.getByDisplayValue(
        'Consultor de Marketing Digital'
      );
      await act(async () => {
        await user.clear(nameInput);
        await user.type(nameInput, 'Nombre Actualizado');
      });

      // Guardar
      await act(async () => {
        await user.click(screen.getByText('Actualizar Agente'));
      });

      expect(mockAdminFunctions.updateAgent).toHaveBeenCalledWith(
        'marketing-digital',
        expect.objectContaining({
          name: 'Nombre Actualizado',
        })
      );
    });

    test('cambia estado activo/inactivo de agente', async () => {
      const user = userEvent.setup();
      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Desactivar')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('Desactivar')[0]);
      });

      // Debería haber llamado a updateAgent
      expect(mockAdminFunctions.updateAgent).toHaveBeenCalled();
    });

    test('elimina agente con confirmación', async () => {
      const user = userEvent.setup();

      // Mock de window.confirm
      global.confirm = jest.fn(() => true);

      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getAllByText('🗑️')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('🗑️')[0]);
      });

      expect(global.confirm).toHaveBeenCalledWith(
        '¿Estás seguro de que querés eliminar este agente?'
      );
      expect(mockAdminFunctions.deleteAgent).toHaveBeenCalledWith(
        'marketing-digital'
      );
    });

    test('valida campos obligatorios en formulario', async () => {
      const user = userEvent.setup();
      global.alert = jest.fn();

      await renderWithAct(<AgentsPage />);

      await waitFor(() => {
        expect(screen.getByText('+ Crear Agente')).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getByText('+ Crear Agente'));
      });

      // Intentar enviar sin llenar campos obligatorios
      await act(async () => {
        await user.click(screen.getByText('Crear Agente'));
      });

      expect(global.alert).toHaveBeenCalledWith(
        'Por favor completá todos los campos obligatorios'
      );
    });
  });

  describe('Navegación Admin', () => {
    test('permite navegar entre secciones', async () => {
      const { rerender } = await renderWithAct(<AdminDashboard />);

      // Simular navegación a usuarios
      await act(async () => {
        rerender(<UsersPage />);
      });
      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();

      // Simular navegación a agentes
      await act(async () => {
        rerender(<AgentsPage />);
      });
      expect(screen.getByText('Gestión de Agentes')).toBeInTheDocument();
    });
  });

  describe('Permisos de acceso', () => {
    test('bloquea acceso a usuarios no admin', () => {
      // Mock usuario no admin
      const { useUser } = require('@clerk/nextjs');
      useUser.mockReturnValue({
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
      mockAdminFunctions.getAllUsers.mockRejectedValue(
        new Error('Database error')
      );

      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        // Debería mostrar lista vacía sin errores críticos
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      });
    });

    test('maneja errores de actualización de usuario', async () => {
      const user = userEvent.setup();
      mockAdminFunctions.updateUser.mockRejectedValue(
        new Error('Update failed')
      );
      global.alert = jest.fn();

      await renderWithAct(<UsersPage />);

      await waitFor(() => {
        expect(screen.getAllByText('Editar')[0]).toBeInTheDocument();
      });

      await act(async () => {
        await user.click(screen.getAllByText('Editar')[0]);
        await user.click(screen.getByText('Guardar Cambios'));
      });

      expect(global.alert).toHaveBeenCalledWith('Error al actualizar usuario');
    });
  });
});
