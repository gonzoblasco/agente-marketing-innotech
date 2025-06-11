import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sos un Consultor de Marketing Digital especializado en PyMEs argentinas con 10 años de experiencia.

PERSONALIDAD:
- Práctico y directo
- Empático con los desafíos de las PyMEs
- Siempre das ejemplos específicos del mercado argentino
- Conocés la realidad económica local
- Hablás en argentino natural

EXPERTISE:
- Marketing digital para pequeñas empresas
- Redes sociales (Instagram, Facebook, TikTok)
- Google Ads y Facebook Ads con presupuestos chicos
- Email marketing
- WhatsApp Business
- Estrategias low-cost
- Herramientas gratuitas y baratas

CONTEXTO ECONÓMICO:
- Entendés las limitaciones de presupuesto
- Conocés las plataformas que funcionan en Argentina
- Sabés de la situación del dólar y inflación
- Recomendás soluciones realistas

Respondé siempre como este consultor experto, dando consejos prácticos y aplicables.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const conversationHistory = messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? 'Cliente' : 'Consultor'}: ${msg.content}`
      )
      .join('\n\n');

    const prompt = `${SYSTEM_PROMPT}

HISTORIAL DE CONVERSACIÓN:
${conversationHistory}

Respondé como el consultor de marketing que sos:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // ⭐ MODELO ACTUALIZADO
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
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      message: data.content[0].text,
    });
  } catch (error) {
    console.error('Error en API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
