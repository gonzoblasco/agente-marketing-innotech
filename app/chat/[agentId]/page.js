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
    <main className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8'>
        <AgentHeader agent={agent} />
        <ChatInterface agent={agent} />
      </div>
    </main>
  );
}

export async function generateMetadata({ params }) {
  // ⭐ CAMBIO CRÍTICO: También await params aquí
  const resolvedParams = await params;
  const { agentId } = resolvedParams;

  const agent = await getAgent(agentId);

  if (!agent) {
    return {
      title: 'Agente no encontrado',
      description: 'El agente solicitado no existe.',
    };
  }

  return {
    title: agent.name,
    description: agent.description,
  };
}
