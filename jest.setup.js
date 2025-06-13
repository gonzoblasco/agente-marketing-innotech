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
  useSearchParams: () => ({
    get: jest.fn((key) => {
      if (key === 'payment_id') return 'test-payment-123';
      if (key === 'status') return 'approved';
      return null;
    }),
  }),
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

// ⭐ CREAR MOCKS FUNCIONALES CORRECTOS
const createMockFunction = (name, defaultReturn = undefined) => {
  const fn = jest.fn(() => defaultReturn);
  fn.mockClear = jest.fn(() => fn);
  fn.mockReset = jest.fn(() => fn);
  fn.mockRestore = jest.fn(() => fn);
  fn.mockReturnValue = jest.fn((value) => {
    fn.mockImplementation(() => value);
    return fn;
  });
  fn.mockResolvedValue = jest.fn((value) => {
    fn.mockImplementation(() => Promise.resolve(value));
    return fn;
  });
  fn.mockRejectedValue = jest.fn((value) => {
    fn.mockImplementation(() => Promise.reject(value));
    return fn;
  });
  return fn;
};

// Mock del cliente de Supabase con métodos encadenados
const createSupabaseChain = () => ({
  select: jest.fn(() => createSupabaseChain()),
  eq: jest.fn(() => createSupabaseChain()),
  gt: jest.fn(() => Promise.resolve({ count: 10, error: null })),
  order: jest.fn(() => createSupabaseChain()),
  limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
  maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
  insert: jest.fn(() => createSupabaseChain()),
  update: jest.fn(() => createSupabaseChain()),
  upsert: jest.fn(() => createSupabaseChain()),
  delete: jest.fn(() => createSupabaseChain()),
});

const mockSupabaseClient = {
  from: jest.fn(() => createSupabaseChain()),
};

// ⭐ MOCK COMPLETO DE SUPABASE FUNCTIONS
const mockSupabaseFunctions = {
  supabase: mockSupabaseClient,
  getAgentsByCategory: createMockFunction(
    'getAgentsByCategory',
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
  getUniqueCategories: createMockFunction(
    'getUniqueCategories',
    Promise.resolve(['Marketing', 'Productividad'])
  ),
  getUserStats: createMockFunction(
    'getUserStats',
    Promise.resolve({
      plan: 'lite',
      messages_used: 5,
      messages_limit: 100,
    })
  ),
  upsertUser: createMockFunction(
    'upsertUser',
    Promise.resolve({ id: 'test-user-id' })
  ),
  getOrCreateConversation: createMockFunction(
    'getOrCreateConversation',
    Promise.resolve({
      id: 'conv-123',
      user_id: 'test-user-id',
      agent_id: 'marketing-digital',
    })
  ),
  getConversationMessages: createMockFunction(
    'getConversationMessages',
    Promise.resolve([])
  ),
  saveMessage: createMockFunction(
    'saveMessage',
    Promise.resolve({ id: 'msg-123' })
  ),
  incrementUserMessageCount: createMockFunction(
    'incrementUserMessageCount',
    Promise.resolve(true)
  ),
  deleteConversationMessages: createMockFunction(
    'deleteConversationMessages',
    Promise.resolve(true)
  ),
  getAllUsers: createMockFunction(
    'getAllUsers',
    Promise.resolve([
      {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        plan: 'lite',
        messages_used: 5,
        messages_limit: 100,
        role: 'user',
        created_at: '2023-12-31T00:00:00Z',
      },
      {
        id: 'user-2',
        email: 'pro@example.com',
        first_name: 'Pro',
        last_name: 'User',
        plan: 'pro',
        messages_used: 50,
        messages_limit: 1000,
        role: 'user',
        created_at: '2024-01-01T00:00:00Z',
      },
    ])
  ),
  updateUser: createMockFunction(
    'updateUser',
    Promise.resolve({ id: 'user-1' })
  ),
  getAllAgents: createMockFunction(
    'getAllAgents',
    Promise.resolve([
      {
        id: 'marketing-digital',
        name: 'Consultor de Marketing Digital',
        title: 'Especialista en PyMEs argentinas',
        emoji: '🎯',
        description: 'Experto en marketing digital',
        category: 'Marketing',
        is_active: true,
        gradient: 'from-blue-500 to-blue-700',
        created_at: '2023-12-31T00:00:00Z',
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
        created_at: '2024-01-01T00:00:00Z',
      },
    ])
  ),
  createAgent: createMockFunction(
    'createAgent',
    Promise.resolve({ id: 'new-agent' })
  ),
  updateAgent: createMockFunction(
    'updateAgent',
    Promise.resolve({ id: 'updated-agent' })
  ),
  deleteAgent: createMockFunction('deleteAgent', Promise.resolve(true)),
  toggleAgentStatus: createMockFunction(
    'toggleAgentStatus',
    Promise.resolve({ id: 'agent-id', is_active: true })
  ),
  isUserAdmin: createMockFunction('isUserAdmin', Promise.resolve(true)),
};

// Mock de Supabase
jest.mock('./app/lib/supabase', () => mockSupabaseFunctions);

// Mock de datos/agentes
jest.mock('./app/data/agents', () => ({
  getAllAgents: createMockFunction(
    'getAllAgents',
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
  getAgent: createMockFunction(
    'getAgent',
    Promise.resolve({
      id: 'marketing-digital',
      name: 'Consultor de Marketing Digital',
      emoji: '🎯',
      welcome_message: '¡Hola! Soy tu consultor de marketing digital.',
    })
  ),
  invalidateAgentsCache: jest.fn(),
}));

// Mock de React Router DOM para integration tests
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/test' }),
}));

// Configuración global
beforeEach(() => {
  // Resetear todos los mocks antes de cada test
  jest.clearAllMocks();

  // ⭐ RESETEAR MOCKS PERSONALIZADOS
  Object.values(mockSupabaseFunctions).forEach((mockFn) => {
    if (typeof mockFn === 'function' && mockFn.mockClear) {
      mockFn.mockClear();
    }
  });

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

// ⭐ EXPORTAR MOCKS PARA USO EN TESTS
export { mockSupabaseFunctions };
