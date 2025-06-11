import AgentGallery from './components/AgentGallery';

// ⭐ AGREGAR METADATA
export const metadata = {
  title: 'InnoTech Solutions - Agentes Conversacionales',
  description:
    'Accedé a un catálogo de agentes de IA especializados para resolver problemas específicos de emprendedores y PyMEs latinos.',
  keywords:
    'agentes conversacionales, IA, emprendedores, PyMEs, Argentina, consultoría, marketing digital',
};

export default function Home() {
  return (
    <main className='min-h-screen bg-gray-50'>
      <AgentGallery />
    </main>
  );
}
