// app/lib/llm-clients.js
// Clientes API para LLM - SIN DEEPSEEK (temporalmente)
// Solo Claude 4 y Gemini 2.5 Pro

/**
 * CLIENTE PARA CLAUDE 4 API (Anthropic) - MODELO PRINCIPAL
 */
export class ClaudeClient {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1';
    this.apiKey = process.env.CLAUDE_API_KEY;
  }

  async chat({
    model = 'claude-4-sonnet',
    messages,
    systemPrompt,
    maxTokens = 4000,
    temperature = 0.7,
  }) {
    console.log('🔮 Calling Claude API...');

    if (!this.apiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Modelo más reciente
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Claude API Error:', error);
      throw new Error(
        `Claude API Error: ${response.status} - ${
          error.error?.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();

    console.log('✅ Claude API Response:', {
      model: data.model,
      usage: data.usage,
      contentLength: data.content[0]?.text?.length || 0,
    });

    return {
      message: data.content[0].text,
      usage: {
        input_tokens: data.usage?.input_tokens || 0,
        output_tokens: data.usage?.output_tokens || 0,
        total_tokens:
          (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
    };
  }
}

/**
 * CLIENTE PARA GEMINI 2.5 PRO API (Google) - PARA PLAN ELITE
 */
export class GeminiClient {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async chat({
    model = 'gemini-2.5-pro',
    messages,
    systemPrompt,
    maxTokens = 4000,
    temperature = 0.7,
  }) {
    console.log('🌟 Calling Gemini API...');

    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const contents = this.formatMessages(systemPrompt, messages);

    const response = await fetch(
      `${this.baseURL}/models/gemini-2.5-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Gemini API Error:', error);
      throw new Error(
        `Gemini API Error: ${response.status} - ${
          error.error?.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Gemini API: No candidates returned');
    }

    console.log('✅ Gemini API Response:', {
      model: 'gemini-2.5-pro',
      usage: data.usageMetadata,
      contentLength: data.candidates[0].content.parts[0].text?.length || 0,
    });

    return {
      message: data.candidates[0].content.parts[0].text,
      usage: {
        input_tokens: data.usageMetadata?.promptTokenCount || 0,
        output_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0,
      },
      model: 'gemini-2.5-pro',
    };
  }

  formatMessages(systemPrompt, messages) {
    const contents = [];

    // Agregar system prompt como primer mensaje del usuario
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Entendido. ¿En qué puedo ayudarte?' }],
      });
    }

    // Convertir mensajes al formato de Gemini
    messages.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    return contents;
  }
}

/**
 * FACTORY DE CLIENTES LLM (SIN DEEPSEEK)
 */
export class LLMClientFactory {
  constructor() {
    this.clients = {
      anthropic: new ClaudeClient(),
      google: new GeminiClient(),
      // deepseek: new DeepSeekClient() // ❌ TEMPORALMENTE DESACTIVADO
    };
  }

  getClient(provider) {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(
        `Unknown LLM provider: ${provider}. Available: anthropic, google`
      );
    }
    return client;
  }

  async callModel({
    modelConfig,
    messages,
    systemPrompt,
    maxTokens = 4000,
    temperature = 0.7,
  }) {
    const client = this.getClient(modelConfig.provider);

    console.log(`🤖 Calling ${modelConfig.name} (${modelConfig.provider})`);

    try {
      const startTime = Date.now();

      const result = await client.chat({
        model: modelConfig.id,
        messages,
        systemPrompt,
        maxTokens,
        temperature,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ ${modelConfig.name} responded in ${duration}ms`);
      console.log(`📊 Usage:`, result.usage);

      return {
        ...result,
        duration,
        modelConfig,
      };
    } catch (error) {
      console.error(`❌ ${modelConfig.name} error:`, error);
      throw error;
    }
  }
}

/**
 * INSTANCIA SINGLETON
 */
export const llmClients = new LLMClientFactory();

/**
 * FUNCIÓN HELPER PARA USO DIRECTO
 */
export async function callLLM({
  modelConfig,
  messages,
  systemPrompt,
  maxTokens,
  temperature,
}) {
  return llmClients.callModel({
    modelConfig,
    messages,
    systemPrompt,
    maxTokens,
    temperature,
  });
}

/**
 * 💡 NOTAS SOBRE LA CONFIGURACIÓN SIN DEEPSEEK:
 *
 * ✅ CLAUDE COMO MODELO PRINCIPAL:
 * - Excelente calidad para todas las consultas
 * - Manejo robusto de errores
 * - Soporte para español nativo
 * - Cache disponible para reducir costos
 *
 * ✅ GEMINI PARA CASOS ESPECIALES (ELITE):
 * - Solo para usuarios Plan Elite
 * - Capacidades multimodales únicas
 * - Contexto masivo (1M tokens)
 * - Precios competitivos para casos específicos
 *
 * 🔄 MIGRACIÓN FUTURA A DEEPSEEK:
 * - Cuando tengas créditos en DeepSeek API
 * - Simplemente des-comentar el cliente DeepSeek
 * - Actualizar LLM_MODELS en llm-router.js
 * - Los costos bajarán dramáticamente (90%+ reducción)
 *
 * 💰 ESTIMACIÓN DE COSTOS SIN DEEPSEEK:
 * - Plan Lite: ~$15-25/mes por usuario activo
 * - Plan Pro: ~$40-75/mes por usuario activo
 * - Plan Elite: ~$75-150/mes por usuario activo
 * - CON DeepSeek: Estos costos bajarían 5-10x
 */
