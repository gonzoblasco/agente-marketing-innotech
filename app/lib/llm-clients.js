// app/lib/llm-clients.js
// Clientes API para múltiples proveedores de LLM

/**
 * CLIENTE PARA DEEPSEEK API
 */
export class DeepSeekClient {
  constructor() {
    this.baseURL = 'https://api.deepseek.com/v1';
    this.apiKey = process.env.DEEPSEEK_API_KEY;
  }

  async chat({
    model = 'deepseek-chat',
    messages,
    systemPrompt,
    maxTokens = 4000,
    temperature = 0.7
  }) {
    const prompt = this.buildPrompt(systemPrompt, messages);

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: model === 'deepseek-reasoner' ? 'deepseek-reasoner' : 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
        stream: false
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API Error: ${response.status} - ${error.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      message: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  }

  buildPrompt(systemPrompt, messages) {
    const conversation = messages
      .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
      .join('\n\n');

    return `${systemPrompt}\n\nCONVERSACIÓN:\n${conversation}\n\nRespuesta:`;
  }
}

/**
 * CLIENTE PARA CLAUDE 4 API (Anthropic)
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
    temperature = 0.7
  }) {
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
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API Error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      message: data.content[0].text,
      usage: data.usage,
      model: data.model
    };
  }
}

/**
 * CLIENTE PARA GEMINI 2.5 PRO API (Google)
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
    temperature = 0.7
  }) {
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
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API Error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Gemini API: No candidates returned');
    }

    return {
      message: data.candidates[0].content.parts[0].text,
      usage: data.usageMetadata,
      model: 'gemini-2.5-pro'
    };
  }

  formatMessages(systemPrompt, messages) {
    const contents = [];

    // Agregar system prompt como primer mensaje del usuario
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Entendido. ¿En qué puedo ayudarte?' }]
      });
    }

    // Convertir mensajes al formato de Gemini
    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    return contents;
  }
}

/**
 * FACTORY DE CLIENTES LLM
 */
export class LLMClientFactory {
  constructor() {
    this.clients = {
      deepseek: new DeepSeekClient(),
      anthropic: new ClaudeClient(),
      google: new GeminiClient()
    };
  }

  getClient(provider) {
    const client = this.clients[provider];
    if (!client) {
      throw new Error(`Unknown LLM provider: ${provider}`);
    }
    return client;
  }

  async callModel({
    modelConfig,
    messages,
    systemPrompt,
    maxTokens = 4000,
    temperature = 0.7
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
        temperature
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ ${modelConfig.name} responded in ${duration}ms`);
      console.log(`📊 Usage:`, result.usage);

      return {
        ...result,
        duration,
        modelConfig
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
  temperature
}) {
  return llmClients.callModel({
    modelConfig,
    messages,
    systemPrompt,
    maxTokens,
    temperature
  });
}