import { getAgent } from '../../data/agents';
import ChatInterface from '../../components/ChatInterface';
import AgentHeader from '../../components/AgentHeader';
import { notFound } from 'next/navigation';

export default async function ChatPage({ params }) {
  // ⭐ CAMBIO CRÍTICO: En Next.js 15, params es una Promesa
  const resolvedParams = await params;
  const { agentId } = resolvedParams;

  console.log('🔍 ChatPage - agentId:', agentId);

  // Obtener agente desde BD o fallback
  const agent = await getAgent(agentId);

  console.log('🤖 ChatPage - agent loaded:', agent?.name || 'No agent');

  // Si no se encuentra el agente, mostrar 404
  if (!agent) {
    console.error('❌ ChatPage - Agent not found:', agentId);
    notFound();
  }

  return (
    <main className='h-screen flex flex-col bg-gray-50'>
      {/* Header con breadcrumb y avatar */}
      <div className='flex-shrink-0 px-4 py-4'>
        <div className='max-w-7xl mx-auto'>
          <AgentHeader agent={agent} />
        </div>
      </div>

      {/* Chat interface que ocupa el resto del espacio */}
      <div className='flex-1 px-4 pb-4 min-h-0'>
        <div className='max-w-7xl mx-auto h-full'>
          <div className='bg-white rounded-lg shadow-sm border h-full overflow-hidden'>
            <ChatInterface agent={agent} />
          </div>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { agentId } = resolvedParams;

  const agent = await getAgent(agentId);

  if (!agent) {
    return {
      title: 'Agente no encontrado',
      description: 'El agente solicitado no existe.',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${agent.name} - ${agent.title || 'Chat Especializado'}`,
    description: `Conversá con nuestro ${agent.name}, especialista en ${
      agent.category || 'consultoría'
    }. ${
      agent.description ||
      'Agente especializado para emprendedores y PyMEs argentinas.'
    }`,
    openGraph: {
      title: `${agent.name} - Agente Especializado`,
      description: `${
        agent.description || 'Consultoría especializada'
      } Diseñado para emprendedores y PyMEs argentinas.`,
      images: [`/og-agent-${agent.id}.png`],
    },
    keywords: [
      `agente ${(agent.category || 'consultoría').toLowerCase()}`,
      `consultor IA`,
      `${agent.name.toLowerCase()}`,
      'PyMEs Argentina',
      'emprendedores',
    ],
  };
}
