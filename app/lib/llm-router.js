// app/lib/llm-router.js
// Sistema inteligente de enrutamiento de modelos LLM para InnoTech Solutions
// Basado en el análisis comparativo de modelos LLM 2025

/**
 * CONFIGURACIÓN DE MODELOS LLM DISPONIBLES
 * Actualizados con precios reales de junio 2025
 */
export const LLM_MODELS = {
  // 🧠 DEEPSEEK - Para conversaciones habituales (súper económico)
  DEEPSEEK_CHAT: {
    id: 'deepseek-chat',
    provider: 'deepseek',
    name: 'DeepSeek Chat V3',
    description:
      'Modelo económico para conversaciones habituales y tareas generales',
    pricing: {
      input: 0.27, // $0.27 per 1M tokens
      output: 1.1, // $1.10 per 1M tokens
      cache: 0.07, // $0.07 per 1M tokens (75% descuento)
    },
    capabilities: {
      reasoning: 'alto',
      coding: 'alto',
      multimodal: false,
      contextWindow: 64000,
      maxOutput: 8000,
      languages: ['es', 'en', 'pt'],
    },
    strengths: ['Muy económico', 'Buena calidad general', 'Rápido'],
    useCases: [
      'Conversaciones generales',
      'Consultas básicas',
      'Tareas cotidianas',
    ],
  },

  DEEPSEEK_REASONER: {
    id: 'deepseek-reasoner',
    provider: 'deepseek',
    name: 'DeepSeek R1 Reasoner',
    description:
      'Modelo de razonamiento especializado para problemas complejos',
    pricing: {
      input: 0.55, // $0.55 per 1M tokens
      output: 2.19, // $2.19 per 1M tokens
      cache: 0.14, // $0.14 per 1M tokens
    },
    capabilities: {
      reasoning: 'excepcional',
      coding: 'excepcional',
      multimodal: false,
      contextWindow: 64000,
      maxOutput: 8000,
      languages: ['es', 'en', 'pt'],
    },
    strengths: [
      'Razonamiento superior',
      'Excelente coding',
      'Chain-of-thought',
    ],
    useCases: [
      'Problemas complejos',
      'Debugging avanzado',
      'Análisis profundo',
    ],
  },

  // 🔮 CLAUDE 4 SONNET - Para razonamiento complejo (calidad premium)
  CLAUDE_SONNET: {
    id: 'claude-4-sonnet',
    provider: 'anthropic',
    name: 'Claude 4 Sonnet',
    description: 'Modelo premium para razonamiento complejo y tareas críticas',
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
      'Análisis críticos',
      'Refactoring complejo',
      'Decisiones importantes',
    ],
  },

  // 🌟 GEMINI 2.5 PRO - Para multimodal avanzado (futuro Elite)
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
 * CRITERIOS DE ENRUTAMIENTO INTELIGENTE
 */
export const ROUTING_CRITERIA = {
  // Palabras clave que indican complejidad alta
  COMPLEX_REASONING_KEYWORDS: [
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
  ],

  // Palabras clave que indican necesidad multimodal
  MULTIMODAL_KEYWORDS: [
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
  ],

  // Indicadores de conversación simple
  SIMPLE_CONVERSATION_KEYWORDS: [
    'hola',
    'consulta rápida',
    'pregunta simple',
    'qué es',
    'cómo está',
    'gracias',
    'ayuda básica',
    'información general',
  ],
};

/**
 * CLASE PRINCIPAL DEL ROUTER
 */
export class LLMRouter {
  constructor() {
    this.models = LLM_MODELS;
    this.criteria = ROUTING_CRITERIA;
  }

  /**
   * Determina el mejor modelo para una solicitud específica
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

    console.log('🤖 LLM Router Analysis:', analysis);

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

    // Palabras clave de complejidad alta (+20 puntos cada una)
    this.criteria.COMPLEX_REASONING_KEYWORDS.forEach((keyword) => {
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
    return this.criteria.MULTIMODAL_KEYWORDS.some((keyword) =>
      messageText.includes(keyword)
    );
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
   * Selecciona el modelo más adecuado basado en el análisis
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
      '🎯 Model Selection - Complexity:',
      complexityScore,
      'Multimodal:',
      needsMultimodal,
      'Plan:',
      userPlan
    );

    // 🚫 PLAN LITE: Solo DeepSeek (económico)
    if (userPlan === 'lite') {
      return complexityScore > 70
        ? this.models.DEEPSEEK_REASONER
        : this.models.DEEPSEEK_CHAT;
    }

    // 🌟 PLAN ELITE: Acceso a Gemini multimodal
    if (userPlan === 'elite' && needsMultimodal) {
      return this.models.GEMINI_PRO;
    }

    // 🔮 RAZONAMIENTO COMPLEJO: Claude para máxima calidad
    if (
      complexityScore > 80 ||
      agentType === 'legal' ||
      agentType === 'financiero'
    ) {
      return this.models.CLAUDE_SONNET;
    }

    // 📊 COMPLEJIDAD MEDIA: DeepSeek Reasoner (buen balance)
    if (complexityScore > 50) {
      return this.models.DEEPSEEK_REASONER;
    }

    // 💬 DEFAULT: DeepSeek Chat (económico y eficiente)
    return this.models.DEEPSEEK_CHAT;
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

  /**
   * Obtiene estadísticas de uso y costos
   */
  getUsageStats(modelUsage = {}) {
    const stats = {
      totalRequests: 0,
      totalCost: 0,
      modelBreakdown: {},
      recommendations: [],
    };

    Object.entries(modelUsage).forEach(([modelId, usage]) => {
      const model = this.models[modelId];
      if (model) {
        const cost = this.calculateCost(
          model,
          usage.inputTokens,
          usage.outputTokens
        );

        stats.totalRequests += usage.requests;
        stats.totalCost += cost.totalCost;
        stats.modelBreakdown[modelId] = {
          requests: usage.requests,
          cost: cost.totalCost,
          model: model.name,
        };
      }
    });

    // Generar recomendaciones
    if (stats.totalCost > 10) {
      // Si gasta más de $10
      stats.recommendations.push(
        'Considera usar más DeepSeek para reducir costos'
      );
    }

    return stats;
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
 * CONFIGURACIONES POR PLAN
 */
export const PLAN_CONFIGURATIONS = {
  lite: {
    allowedModels: ['deepseek-chat', 'deepseek-reasoner'],
    maxMonthlySpend: 5, // $5 USD máximo
    defaultModel: 'deepseek-chat',
  },
  pro: {
    allowedModels: ['deepseek-chat', 'deepseek-reasoner', 'claude-4-sonnet'],
    maxMonthlySpend: 50, // $50 USD máximo
    defaultModel: 'deepseek-chat',
  },
  elite: {
    allowedModels: [
      'deepseek-chat',
      'deepseek-reasoner',
      'claude-4-sonnet',
      'gemini-2.5-pro',
    ],
    maxMonthlySpend: 200, // $200 USD máximo
    defaultModel: 'deepseek-reasoner',
  },
};

/**
 * EJEMPLO DE USO:
 *
 * import { selectBestModel } from './llm-router';
 *
 * const model = selectBestModel({
 *   message: "Necesito analizar este código y refactorizarlo",
 *   userPlan: 'pro',
 *   agentId: 'consultor-tech'
 * });
 *
 * console.log('Modelo seleccionado:', model.name);
 * console.log('Costo estimado:', model.pricing);
 */
