import '@testing-library/jest-dom';

// Variables de entorno para testing
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.CLERK_SECRET_KEY = 'sk_test_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';
process.env.CLAUDE_API_KEY = 'mock_claude_key';

// Mock de fetch
global.fetch = jest.fn();

// Mock de Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
  usePathname: () => '/test-path',
  notFound: jest.fn(),
}));

// Mock de Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isSignedIn: true,
    isLoaded: true,
  })),
  SignInButton: ({ children }) => (
    <div data-testid='sign-in-button'>{children}</div>
  ),
  SignedIn: ({ children }) => <div>{children}</div>,
  SignedOut: ({ children }) => null,
  UserButton: () => <div>User Menu</div>,
}));

// Mock de Clerk Server
jest.mock('@clerk/nextjs/server', () => ({
  currentUser: jest.fn(() =>
    Promise.resolve({
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    })
  ),
}));

// Mock del cliente de Supabase
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gt: jest.fn(() => Promise.resolve({ count: 10, error: null })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        ascending: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
  })),
};

// Mock de Supabase - ⭐ CAMBIO: usar ruta relativa correcta desde la raíz
jest.mock('./app/lib/supabase', () => ({
  supabase: mockSupabaseClient,
  getAgentsByCategory: jest.fn(() =>
    Promise.resolve([
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
    ])
  ),
  getUniqueCategories: jest.fn(() =>
    Promise.resolve(['Marketing', 'Productividad'])
  ),
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
  saveMessage: jest.fn(() => Promise.resolve({ id: 'msg-123' })),
  incrementUserMessageCount: jest.fn(() => Promise.resolve(true)),
  deleteConversationMessages: jest.fn(() => Promise.resolve(true)),
  getAllUsers: jest.fn(() =>
    Promise.resolve([
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
    ])
  ),
  updateUser: jest.fn(() => Promise.resolve({ id: 'user-1' })),
  getAllAgents: jest.fn(() =>
    Promise.resolve([
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
    ])
  ),
  createAgent: jest.fn(() => Promise.resolve({ id: 'new-agent' })),
  updateAgent: jest.fn(() => Promise.resolve({ id: 'updated-agent' })),
  deleteAgent: jest.fn(() => Promise.resolve(true)),
  toggleAgentStatus: jest.fn(() =>
    Promise.resolve({ id: 'agent-id', is_active: true })
  ),
  isUserAdmin: jest.fn(() => Promise.resolve(true)),
}));

// Mock de datos/agentes - ⭐ CAMBIO: usar ruta relativa correcta
jest.mock('./app/data/agents', () => ({
  getAllAgents: jest.fn(() =>
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
  getAgent: jest.fn(() =>
    Promise.resolve({
      id: 'marketing-digital',
      name: 'Consultor de Marketing Digital',
      emoji: '🎯',
      welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
    })
  ),
  invalidateAgentsCache: jest.fn(),
}));

// Mock de React Router DOM
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
}));

// Configuración global
beforeEach(() => {
  // Resetear todos los mocks antes de cada test
  jest.clearAllMocks();

  // Configurar fetch mock
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ message: 'Test response' }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// Mock de window.confirm y window.alert
global.confirm = jest.fn(() => true);
global.alert = jest.fn();
