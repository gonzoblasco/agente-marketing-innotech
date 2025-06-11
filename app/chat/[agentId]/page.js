import { getAgent } from '../../data/agents';
import ChatInterface from '../../components/ChatInterface';
import AgentHeader from '../../components/AgentHeader';
import { notFound } from 'next/navigation';

export default function ChatPage({ params }) {
  const { agentId } = params;
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

// Generar metadata dinámico para SEO
export function generateMetadata({ params }) {
  const { agentId } = params;
  const agent = getAgent(agentId);

  return {
    title: `${agent.name} - InnoTech Solutions`,
    description: agent.description,
  };
}
