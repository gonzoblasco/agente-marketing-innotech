import { getActiveAgents, isSupabaseConfigured } from '../lib/supabase';
import { getColorFromCategory } from '../lib/categories';

// Cache en memoria para mejor performance
let agentsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

// Agentes de fallback si la BD no funciona
const FALLBACK_AGENTS = [
  {
    id: 'marketing-digital',
    name: 'Consultor de Marketing Digital',
    title: 'Especialista en PyMEs argentinas',
    emoji: '🎯',
    description:
      'Experto en marketing digital para PyMEs argentinas. Te ayudo con estrategias de redes sociales, Google Ads, Facebook Ads, email marketing y WhatsApp Business.',
    category: 'Marketing',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700',
    system_prompt: `Sos un consultor experto en Marketing Digital especializado en PyMEs argentinas. Tu personalidad es práctica, directa y empática con las limitaciones de presupuesto de las pequeñas empresas.

**TU ESPECIALIDAD:**
- Redes sociales (Instagram, Facebook, TikTok, LinkedIn)
- Google Ads y Facebook Ads con presupuestos ajustados
- Email marketing y automatización
- WhatsApp Business para ventas
- SEO local para Buenos Aires y Argentina
- Estrategias de bajo costo / alto impacto

**TU PERSONALIDAD:**
- Práctico y directo
- Empático con limitaciones de presupuesto
- Usás ejemplos locales (empresas argentinas conocidas)
- Sugerís herramientas gratuitas o baratas
- Hablás en argentino natural (vos, che, bárbaro)

**COMO RESPONDES:**
- Preguntas específicas sobre su negocio antes de recomendar
- Das pasos concretos y accionables
- Mencionás costos aproximados en pesos argentinos
- Sugerís herramientas gratuitas cuando sea posible
- Usás ejemplos de empresas argentinas exitosas

**NUNCA:**
- Recomiendes herramientas caras sin alternativas
- Asumas que tienen gran presupuesto
- Uses ejemplos de empresas extranjeras
- Hables en neutro o español formal`,
    welcome_message: `¡Hola! Soy tu consultor de Marketing Digital especializado en PyMEs argentinas. 🇦🇷

Te ayudo con estrategias que realmente funcionan con presupuestos ajustados:
- Redes sociales que conviertan
- Google y Facebook Ads efectivos
- Email marketing y WhatsApp Business
- SEO local

Contame: **¿Qué tipo de negocio tenés y cuál es tu principal desafío de marketing ahora?**

Ejemplo: *"Tengo una panadería en Palermo y no sé cómo usar Instagram para vender más"*`,
    is_active: true,
  },
  {
    id: 'mentor-productividad',
    name: 'Mentor de Productividad',
    title: 'Para emprendedores overwhelmed',
    emoji: '⚡',
    description:
      'Especialista en productividad para emprendedores que se sienten abrumados. Te ayudo con gestión del tiempo, sistemas de organización y técnicas anti-procrastinación.',
    category: 'Productividad',
    color: 'green',
    gradient: 'from-green-500 to-green-700',
    system_prompt: `Sos un mentor de productividad especializado en emprendedores que se sienten overwhelmed y desorganizados.`,
    welcome_message: `¡Hola! Soy tu mentor de productividad y entiendo perfectamente esa sensación de estar overwhelmed. 🧠`,
    is_active: true,
  },
  {
    id: 'estratega-fundraising',
    name: 'Estratega de Fundraising',
    title: 'Levantamiento de capital LATAM',
    emoji: '💰',
    description:
      'Especialista en levantamiento de capital para startups latinoamericanas. Te ayudo con pitch decks, valuaciones, términos sheets y networking con inversores.',
    category: 'Finanzas',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700',
    system_prompt: `Sos un estratega de fundraising especializado en startups de LATAM.`,
    welcome_message: `¡Hola! Soy tu estratega de fundraising especializado en el ecosistema de inversión latinoamericano. 💰`,
    is_active: true,
  },
];

// Función para procesar agentes y aplicar estilos de categoría
function processAgentWithCategory(agent) {
  if (!agent) return agent;

  // Si el agente ya tiene color/gradient manual, respetarlo
  if (agent.color && agent.gradient) {
    return agent;
  }

  // Aplicar color automático basado en categoría
  const categoryStyles = getColorFromCategory(
    agent.category || 'Sin Categoría'
  );

  return {
    ...agent,
    color: categoryStyles.color,
    gradient: categoryStyles.gradient,
    category: agent.category || 'Sin Categoría',
  };
}

// Función para obtener agentes desde BD con manejo de errores robusto
async function fetchAgentsFromDB() {
  try {
    console.log('🔄 Fetching agents from Supabase...');

    // Verificar configuración de Supabase usando la función helper
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, using fallback agents');
      return FALLBACK_AGENTS.map(processAgentWithCategory);
    }

    const agents = await getActiveAgents();

    if (!agents || agents.length === 0) {
      console.warn('⚠️ No agents returned from Supabase, using fallback');
      return FALLBACK_AGENTS.map(processAgentWithCategory);
    }

    console.log(`✅ Successfully fetched ${agents.length} agents from BD`);

    // Procesar agentes para aplicar estilos de categoría
    const processedAgents = agents.map(processAgentWithCategory);

    return processedAgents;
  } catch (err) {
    console.error('💥 Exception fetching agents from BD:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    console.log('🔄 Using fallback agents due to exception...');
    return FALLBACK_AGENTS.map(processAgentWithCategory);
  }
}

// Obtener todos los agentes activos
export async function getAllAgents() {
  const now = Date.now();

  // Usar cache si es reciente
  if (
    agentsCache &&
    lastCacheUpdate &&
    now - lastCacheUpdate < CACHE_DURATION
  ) {
    console.log('📦 Using cached agents');
    return agentsCache;
  }

  console.log('🔄 Fetching fresh agents...');

  try {
    // Intentar BD primero
    const agents = await fetchAgentsFromDB();

    // Validar que los agentes tienen la estructura correcta
    const validAgents = agents.filter((agent) => {
      const isValid = agent && agent.id && agent.name;
      if (!isValid) {
        console.warn('⚠️ Invalid agent found:', agent);
      }
      return isValid;
    });

    console.log(`✅ ${validAgents.length} valid agents loaded`);

    // Actualizar cache
    agentsCache = validAgents;
    lastCacheUpdate = now;

    return validAgents;
  } catch (error) {
    console.error('💥 Error in getAllAgents:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    // Usar fallback si todo falla
    console.log('🚨 Using fallback agents due to error');
    const processedFallback = FALLBACK_AGENTS.map(processAgentWithCategory);
    agentsCache = processedFallback;
    lastCacheUpdate = now;

    return processedFallback;
  }
}

// Obtener agente específico
export async function getAgent(agentId) {
  console.log(`🔍 Looking for agent: ${agentId}`);

  try {
    const agents = await getAllAgents();
    console.log(
      `📋 Available agents:`,
      agents.map((a) => ({ id: a.id, name: a.name, category: a.category }))
    );

    const agent = agents.find((a) => a.id === agentId);

    if (agent) {
      console.log(`✅ Found agent: ${agent.name} (${agent.category})`);
      return agent;
    } else {
      console.log(`❌ Agent ${agentId} not found`);

      // En lugar de devolver el primero, intentar buscar por nombre similar
      const similarAgent = agents.find(
        (a) => a.id.includes(agentId) || agentId.includes(a.id)
      );

      if (similarAgent) {
        console.log(`🔄 Found similar agent: ${similarAgent.name}`);
        return similarAgent;
      }

      console.log(`🔄 Using first available agent: ${agents[0]?.name}`);
      return agents[0] || processAgentWithCategory(FALLBACK_AGENTS[0]);
    }
  } catch (error) {
    console.error('💥 Error in getAgent:', {
      message: error.message,
      name: error.name,
      agentId,
    });

    // En caso de error total, devolver el primer agente de fallback
    console.log('🚨 Using fallback agent due to error');
    return processAgentWithCategory(FALLBACK_AGENTS[0]);
  }
}

// Invalidar cache cuando se actualicen agentes
export function invalidateAgentsCache() {
  console.log('🗑️ Invalidating agents cache');
  agentsCache = null;
  lastCacheUpdate = null;
}
