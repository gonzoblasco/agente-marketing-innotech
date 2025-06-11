import { getAgent } from '../../data/agents';
import ChatInterface from '../../components/ChatInterface';
import AgentHeader from '../../components/AgentHeader';
import { notFound } from 'next/navigation';

export default async function ChatPage({ params }) {
  // ⭐ CAMBIO: Await params antes de usarlos
  const { agentId } = await params;
  const agent = getAgent(agentId);

  // Si el agente no existe, mostrar 404
  if (!agent && agentId !== 'marketing-digital') {
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
  const { agentId } = await params;
  const agent = getAgent(agentId);

  return {
    title: agent.name, // ← Solo el nombre del agente
    description: agent.description,
  };
}
