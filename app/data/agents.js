import { supabase } from '../lib/supabase';

// Cache en memoria para mejor performance
let agentsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para obtener agentes desde BD con cache
async function fetchAgentsFromDB() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents from DB:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching agents:', err);
    return [];
  }
}

// Obtener agente específico
export async function getAgent(agentId) {
  console.log(`🔍 Looking for agent: ${agentId}`);

  try {
    const agents = await getAllAgents();
    console.log(
      `📋 Available agents:`,
      agents.map((a) => ({ id: a.id, name: a.name }))
    );

    const agent = agents.find((a) => a.id === agentId);

    if (agent) {
      console.log(`✅ Found agent:`, agent.name);
      return agent;
    } else {
      console.log(`❌ Agent ${agentId} not found, returning first agent`);
      return agents[0] || null;
    }
  } catch (error) {
    console.error('Error in getAgent:', error);
    return null;
  }
}

// Obtener todos los agentes activos con mejor debugging
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

  console.log('🔄 Fetching agents from database...');

  // Fetch desde BD
  const agents = await fetchAgentsFromDB();

  console.log(`📊 Fetched ${agents.length} agents from DB`);

  // Actualizar cache
  agentsCache = agents;
  lastCacheUpdate = now;

  return agents;
}

// Invalidar cache cuando se actualicen agentes
export function invalidateAgentsCache() {
  agentsCache = null;
  lastCacheUpdate = null;
}
