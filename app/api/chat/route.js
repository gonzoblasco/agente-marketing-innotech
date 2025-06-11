import { NextResponse } from 'next/server';
import { getAgent } from '../../data/agents';

export async function POST(request) {
  try {
    const { messages, agentId } = await request.json();

    // Obtener la configuración del agente específico
    const agent = getAgent(agentId || 'marketing-digital');

    console.log(`🤖 Usando agente: ${agent.name} (${agent.id})`);

    // Construir el historial con el nombre del agente
    const conversationHistory = messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'Cliente' : agent.name}: ${msg.content}`
      )
      .join('\n\n');

    // Usar el prompt específico del agente
    const prompt = `${agent.systemPrompt}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

Respondé como el ${agent.name} que sos:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error Claude API (${agent.name}):`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log(`✅ Respuesta generada por ${agent.name}`);

    return NextResponse.json({
      message: data.content[0].text,
    });
  } catch (error) {
    console.error('💥 Error en API:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
