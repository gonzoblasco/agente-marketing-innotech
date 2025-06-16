// app/lib/llm-router.js
// Sistema inteligente de enrutamiento SIN DEEPSEEK (temporalmente)
// Solo usando Claude 4 Sonnet y Gemini 2.5 Pro

/**
 * CONFIGURACIÓN DE MODELOS LLM DISPONIBLES (SIN DEEPSEEK)
 */
export const LLM_MODELS = {
  // 🔮 CLAUDE 4 SONNET - Modelo principal para todo
  CLAUDE_SONNET: {
    id: 'claude-4-sonnet',
    provider: 'anthropic',
    name: 'Claude 4 Sonnet',
    description: 'Modelo principal para conversaciones y tareas complejas',
    pricing: {
      input: 3.0, // $3.00 per 1M tokens
      output: 15.0, // $15.00 per 1M tokens
      cache: 0.3, // $0.30 per 1M tokens (90% descuento)
    },
    capabilities: {
      reasoning: 'excepcional',
      coding: 'excepcional',
      multimodal: true, // Texto + imágenes
      contextWindow: 200000,
      maxOutput: 64000,
      languages: ['es', 'en', 'pt', 'fr', 'de'],
    },
    strengths: [
      'Razonamiento deliberado',
      'Muy confiable',
      'Excelente seguimiento de instrucciones',
    ],
    useCases: [
      'Conversaciones generales',
      'Análisis complejos',
      'Consultas especializadas',
    ],
  },

  // 🌟 GEMINI 2.5 PRO - Para multimodal y casos específicos (solo Plan Elite)
  GEMINI_PRO: {
    id: 'gemini-2.5-pro',
    provider: 'google',
    name: 'Gemini 2.5 Pro',
    description:
      'Modelo multimodal avanzado para audio, video y contexto masivo',
    pricing: {
      input: 1.25, // $1.25 per 1M tokens (hasta 200K)
      inputLarge: 2.5, // $2.50 per 1M tokens (>200K)
      output: 10.0, // $10.00 per 1M tokens (hasta 200K)
      outputLarge: 15.0, // $15.00 per 1M tokens (>200K)
      cache: 0.3125, // $0.3125 per 1M tokens
    },
    capabilities: {
      reasoning: 'excepcional',
      coding: 'alto',
      multimodal: 'nativo', // Texto + imagen + audio + video
      contextWindow: 1000000, // 1M tokens!
      maxOutput: 8192,
      languages: ['es', 'en', 'pt', 'fr', 'de', '24+ languages'],
    },
    strengths: [
      'Contexto masivo',
      'Multimodal nativo',
      'Video/audio processing',
    ],
    useCases: ['Análisis de videos', 'Documentos extensos', 'Multimedia'],
    premium: true, // Solo para plan Elite
  },
};

/**
 * ROUTER SIMPLIFICADO SIN DEEPSEEK
 */
export class LLMRouter {
  constructor() {
    this.models = LLM_MODELS;
  }

  /**
   * Determina el mejor modelo (Claude o Gemini según el plan)
   */
  routeRequest({
    message,
    conversationHistory = [],
    userPlan = 'lite',
    agentType = 'general',
    forceModel = null,
  }) {
    // Si se fuerza un modelo específico
    if (forceModel && this.models[forceModel]) {
      return this.models[forceModel];
    }

    const analysis = this.analyzeRequest({
      message,
      conversationHistory,
      userPlan,
      agentType,
    });

    console.log('🤖 LLM Router Analysis (Sin DeepSeek):', analysis);

    return this.selectModel(analysis);
  }

  /**
   * Analiza la solicitud para determinar complejidad y requisitos
   */
  analyzeRequest({ message, conversationHistory, userPlan, agentType }) {
    const messageText = message.toLowerCase();
    const conversationLength = conversationHistory.length;

    return {
      // Análisis de complejidad
      complexityScore: this.calculateComplexity(
        messageText,
        conversationHistory
      ),

      // Análisis de modalidad
      needsMultimodal: this.detectMultimodalNeed(messageText),

      // Contexto de la conversación
      contextLength: this.estimateContextLength(conversationHistory),

      // Plan del usuario
      userPlan,

      // Tipo de agente
      agentType,

      // Longitud del mensaje
      messageLength: message.length,

      // Histórico de la conversación
      conversationLength,
    };
  }

  /**
   * Calcula un score de complejidad (0-100)
   */
  calculateComplexity(messageText, conversationHistory) {
    let score = 0;

    // Palabras clave de complejidad
    const complexKeywords = [
      'analizar',
      'evaluar',
      'comparar',
      'estrategia',
      'planificar',
      'refactorizar',
      'debuggear',
      'optimizar',
      'diseñar',
      'arquitectura',
      'problema complejo',
      'análisis profundo',
      'decisión importante',
      'revisar código',
      'explicar detalladamente',
    ];

    complexKeywords.forEach((keyword) => {
      if (messageText.includes(keyword)) {
        score += 20;
      }
    });

    // Longitud del mensaje (+1 punto cada 50 caracteres)
    score += Math.floor(messageText.length / 50);

    // Conversación larga indica complejidad creciente
    score += Math.min(conversationHistory.length * 2, 20);

    // Preguntas múltiples o estructuradas
    const questionMarks = (messageText.match(/\?/g) || []).length;
    if (questionMarks > 1) score += 15;

    // Solicitudes de código o análisis técnico
    if (
      messageText.includes('código') ||
      messageText.includes('función') ||
      messageText.includes('algoritmo') ||
      messageText.includes('api')
    ) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  /**
   * Detecta si se necesita capacidad multimodal
   */
  detectMultimodalNeed(messageText) {
    const multimodalKeywords = [
      'imagen',
      'foto',
      'video',
      'audio',
      'archivo',
      'documento',
      'analizar imagen',
      'ver foto',
      'revisar video',
      'escuchar',
      'multimedia',
      'visual',
      'gráfico',
    ];

    return multimodalKeywords.some((keyword) => messageText.includes(keyword));
  }

  /**
   * Estima la longitud del contexto en tokens (aproximado)
   */
  estimateContextLength(conversationHistory) {
    const totalChars = conversationHistory.reduce(
      (total, msg) => total + (msg.content?.length || 0),
      0
    );

    // Aproximación: 1 token ≈ 4 caracteres en español
    return Math.floor(totalChars / 4);
  }

  /**
   * Selecciona el modelo más adecuado (SOLO CLAUDE Y GEMINI)
   */
  selectModel(analysis) {
    const {
      complexityScore,
      needsMultimodal,
      userPlan,
      agentType,
      contextLength,
    } = analysis;

    console.log(
      '🎯 Model Selection (Sin DeepSeek) - Complexity:',
      complexityScore,
      'Multimodal:',
      needsMultimodal,
      'Plan:',
      userPlan
    );

    // 🌟 PLAN ELITE: Puede usar Gemini para multimodal
    if (userPlan === 'elite' && needsMultimodal) {
      console.log('🌟 Using Gemini Pro for Elite multimodal');
      return this.models.GEMINI_PRO;
    }

    // 🌟 PLAN ELITE: Usar Gemini para contexto muy largo (>100k tokens)
    if (userPlan === 'elite' && contextLength > 100000) {
      console.log('🌟 Using Gemini Pro for Elite long context');
      return this.models.GEMINI_PRO;
    }

    // 🔮 DEFAULT: Claude Sonnet para todo lo demás
    console.log('🔮 Using Claude Sonnet as default');
    return this.models.CLAUDE_SONNET;
  }

  /**
   * Calcula el costo estimado de una solicitud
   */
  calculateCost(model, inputTokens, outputTokens = 1000, useCache = false) {
    let inputCost, outputCost;

    if (model.id === 'gemini-2.5-pro') {
      // Gemini tiene precios escalonados
      inputCost =
        inputTokens > 200000
          ? (inputTokens / 1000000) * model.pricing.inputLarge
          : (inputTokens / 1000000) * model.pricing.input;

      outputCost =
        inputTokens > 200000
          ? (outputTokens / 1000000) * model.pricing.outputLarge
          : (outputTokens / 1000000) * model.pricing.output;
    } else {
      const inputPrice = useCache ? model.pricing.cache : model.pricing.input;
      inputCost = (inputTokens / 1000000) * inputPrice;
      outputCost = (outputTokens / 1000000) * model.pricing.output;
    }

    return {
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: inputCost + outputCost,
      model: model.name,
      tokens: { input: inputTokens, output: outputTokens },
    };
  }
}

/**
 * INSTANCIA SINGLETON DEL ROUTER
 */
export const llmRouter = new LLMRouter();

/**
 * FUNCIÓN HELPER PARA USO FÁCIL
 */
export function selectBestModel({
  message,
  conversationHistory = [],
  userPlan = 'lite',
  agentId = 'general',
}) {
  return llmRouter.routeRequest({
    message,
    conversationHistory,
    userPlan,
    agentType: agentId,
  });
}

/**
 * CONFIGURACIONES POR PLAN (SIN DEEPSEEK)
 */
export const PLAN_CONFIGURATIONS = {
  lite: {
    allowedModels: ['claude-4-sonnet'], // Solo Claude para Lite
    maxMonthlySpend: 25, // $25 USD máximo
    defaultModel: 'claude-4-sonnet',
    description: 'Claude Sonnet para todas las consultas',
  },
  pro: {
    allowedModels: ['claude-4-sonnet'], // Solo Claude para Pro también
    maxMonthlySpend: 75, // $75 USD máximo
    defaultModel: 'claude-4-sonnet',
    description: 'Claude Sonnet optimizado para uso profesional',
  },
  elite: {
    allowedModels: ['claude-4-sonnet', 'gemini-2.5-pro'], // Elite tiene ambos
    maxMonthlySpend: 200, // $200 USD máximo
    defaultModel: 'claude-4-sonnet',
    description: 'Claude + Gemini para casos multimodales',
  },
};

/**
 * 💡 ESTRATEGIA SIN DEEPSEEK:
 *
 * 1. ✅ PLAN LITE: Solo Claude Sonnet
 *    - Todas las consultas van a Claude
 *    - Límite de $25/mes para controlar costos
 *    - 100 mensajes/mes debería estar bien cubierto
 *
 * 2. ✅ PLAN PRO: Solo Claude Sonnet optimizado
 *    - Usar cache de Claude para reducir costos
 *    - Límite de $75/mes
 *    - 1000 mensajes/mes factible con optimización
 *
 * 3. ✅ PLAN ELITE: Claude + Gemini selectivo
 *    - Claude por defecto para todo
 *    - Gemini solo para multimodal o contexto masivo
 *    - Límite de $200/mes para casos premium
 *
 * 🔄 CUANDO DEEPSEEK ESTÉ DISPONIBLE:
 * - Simplemente agregar los modelos DeepSeek de vuelta
 * - Cambiar defaults para usar DeepSeek como primario
 * - Los planes Lite/Pro tendrán costos MUY reducidos
 */

console.log('🧠 LLM Router configurado SIN DeepSeek - Solo Claude y Gemini');
