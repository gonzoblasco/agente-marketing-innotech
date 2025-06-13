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
}));

// Mock de Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'test-user-id', firstName: 'Test', lastName: 'User' },
    isSignedIn: true,
    isLoaded: true,
  }),
  SignInButton: ({ children }) => children,
  SignedIn: ({ children }) => children,
  SignedOut: ({ children }) => children,
  UserButton: () => 'User Menu',
}));

// Mock de Supabase
jest.mock('./app/lib/supabase', () => ({
  getAgentsByCategory: jest.fn(() =>
    Promise.resolve([
      {
        id: 'test-agent',
        name: 'Test Agent',
        category: 'Marketing',
      },
    ])
  ),
  getUniqueCategories: jest.fn(() => Promise.resolve(['Marketing'])),
  getUserStats: jest.fn(() =>
    Promise.resolve({ plan: 'lite', messages_used: 5, messages_limit: 100 })
  ),
}));

afterEach(() => jest.clearAllMocks());
