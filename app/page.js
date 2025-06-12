import AgentGallery from './components/AgentGallery';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export const metadata = {
  title: 'InnoTech Solutions - Netflix de Agentes Conversacionales',
  description:
    'Accedé a un catálogo de agentes de IA especializados para resolver problemas específicos de emprendedores y PyMEs latinos.',
  keywords:
    'agentes conversacionales, IA, emprendedores, PyMEs, Argentina, consultoría, marketing digital',
};

export default function Home() {
  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Header con autenticación */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-800'>
            🚀 InnoTech Solutions
          </h1>

          <div className='flex items-center space-x-4'>
            <SignedOut>
              <SignInButton mode='modal'>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                  Iniciar Sesión
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl='/' />
            </SignedIn>
          </div>
        </div>
      </div>

      <AgentGallery />
    </main>
  );
}
