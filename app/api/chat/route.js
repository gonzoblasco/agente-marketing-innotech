import { NextResponse } from 'next/server';
import { getAgent } from '../../data/agents';
import { currentUser } from '@clerk/nextjs/server';
import {
  upsertUser,
  getOrCreateConversation,
  getConversationMessages,
  saveMessage,
  incrementUserMessageCount,
  getUserStats,
} from '../../lib/supabase';

export async function POST(request) {
  try {
    // Obtener usuario autenticado
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { messages, agentId } = await request.json();

    // Obtener configuración del agente desde BD
    const agent = await getAgent(agentId || 'marketing-digital');

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente no encontrado o inactivo' },
        { status: 404 }
      );
    }

    console.log(
      `🤖 Usuario ${user.id} usando agente: ${agent.name} (${agent.id})`
    );

    // Asegurar que el usuario existe en nuestra BD
    await upsertUser(user);

    // Verificar límite de mensajes
    const canSendMessage = await incrementUserMessageCount(user.id);
    if (!canSendMessage) {
      return NextResponse.json(
        {
          error:
            'Límite de mensajes alcanzado. Actualiza tu plan para continuar.',
        },
        { status: 429 }
      );
    }

    // Obtener o crear conversación
    const conversation = await getOrCreateConversation(user.id, agent.id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Error al crear conversación' },
        { status: 500 }
      );
    }

    // Obtener el último mensaje del usuario
    const lastMessage = messages[messages.length - 1];

    // Guardar mensaje del usuario
    await saveMessage(conversation.id, 'user', lastMessage.content);

    // Construir historial para Claude usando el system_prompt de BD
    const conversationHistory = messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'Cliente' : agent.name}: ${msg.content}`
      )
      .join('\n\n');

    const prompt = `${agent.system_prompt}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

Respondé como el ${agent.name} que sos:`;

    // Llamar a Claude
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
    const assistantMessage = data.content[0].text;

    // Guardar respuesta del asistente
    await saveMessage(conversation.id, 'assistant', assistantMessage);

    console.log(`✅ Respuesta generada y guardada por ${agent.name}`);

    return NextResponse.json({
      message: assistantMessage,
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
