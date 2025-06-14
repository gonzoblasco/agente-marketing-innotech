// app/lib/supabase.js - Versión con sintaxis corregida
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug de configuración
console.log('🔧 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPrefix: supabaseUrl?.substring(0, 20) + '...',
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
});

// Crear cliente Supabase o mock
let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration:', {
    NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
  });

  // Cliente mock para evitar crashes
  supabaseClient = {
    from: () => ({
      select: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Supabase not configured' },
        }),
      insert: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Supabase not configured' },
        }),
      update: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Supabase not configured' },
        }),
      delete: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Supabase not configured' },
        }),
      upsert: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Supabase not configured' },
        }),
      eq: function () {
        return this;
      },
      order: function () {
        return this;
      },
      limit: function () {
        return this;
      },
      maybeSingle: function () {
        return this;
      },
      single: function () {
        return this;
      },
    }),
  };
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Exportar el cliente
export const supabase = supabaseClient;

// Función helper para manejar errores de Supabase de manera consistente
export function handleSupabaseError(error, operation = 'operation') {
  console.error(`❌ Supabase ${operation} error:`, {
    message: error?.message || 'Unknown error',
    details: error?.details || 'No details',
    hint: error?.hint || 'No hint',
    code: error?.code || 'No code',
    fullError: error,
  });

  return {
    success: false,
    error: error?.message || `Error in ${operation}`,
    details: error,
  };
}

// Función para verificar si Supabase está configurado
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Crear o actualizar usuario
export async function upsertUser(clerkUser) {
  try {
    console.log('👤 Upserting user:', clerkUser.id);

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping user upsert');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'upsertUser');
      return null;
    }

    console.log('✅ User upserted successfully');
    return data;
  } catch (err) {
    console.error('💥 Exception in upsertUser:', err);
    return null;
  }
}

// Obtener o crear conversación
export async function getOrCreateConversation(userId, agentId) {
  try {
    console.log('💬 Getting/creating conversation:', { userId, agentId });

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, using mock conversation');
      return {
        id: `mock_${userId}_${agentId}`,
        user_id: userId,
        agent_id: agentId,
        title: `Chat con ${agentId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Buscar conversación existente
    let { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'getConversation');
      // Continuar intentando crear nueva conversación
    }

    // Si no existe, crear nueva
    if (!conversation) {
      console.log('📝 Creating new conversation');

      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          agent_id: agentId,
          title: `Chat con ${agentId}`,
        })
        .select()
        .single();

      if (createError) {
        handleSupabaseError(createError, 'createConversation');
        return null;
      }

      conversation = newConversation;
    }

    console.log('✅ Conversation ready:', conversation.id);
    return conversation;
  } catch (err) {
    console.error('💥 Exception in getOrCreateConversation:', err);
    return null;
  }
}

// Obtener mensajes de conversación
export async function getConversationMessages(conversationId) {
  try {
    console.log('📨 Getting messages for conversation:', conversationId);

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, returning empty messages');
      return [];
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getConversationMessages');
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} messages`);
    return data || [];
  } catch (err) {
    console.error('💥 Exception in getConversationMessages:', err);
    return [];
  }
}

// Guardar mensaje
export async function saveMessage(conversationId, role, content) {
  try {
    console.log('💾 Saving message:', {
      conversationId,
      role,
      contentLength: content?.length,
    });

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping message save');
      return null;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'saveMessage');
      return null;
    }

    console.log('✅ Message saved');
    return data;
  } catch (err) {
    console.error('💥 Exception in saveMessage:', err);
    return null;
  }
}

// Incrementar contador de mensajes del usuario
export async function incrementUserMessageCount(userId) {
  try {
    console.log('📊 Incrementing message count for user:', userId);

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, allowing message by default');
      return true;
    }

    const { data, error } = await supabase
      .from('users')
      .select('messages_used, messages_limit')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'getUserStats');
      return true; // Permitir por defecto si hay error
    }

    if (!data) {
      console.warn('⚠️ User not found, allowing message');
      return true;
    }

    if (data.messages_used >= data.messages_limit) {
      console.log('🚫 Message limit reached');
      return false; // Límite alcanzado
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        messages_used: data.messages_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      handleSupabaseError(updateError, 'updateMessageCount');
      return true; // Permitir por defecto si hay error
    }

    console.log('✅ Message count incremented');
    return true;
  } catch (err) {
    console.error('💥 Exception in incrementUserMessageCount:', err);
    return true;
  }
}

// Obtener estadísticas del usuario
export async function getUserStats(userId) {
  try {
    console.log('📈 Getting user stats:', userId);

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, returning default stats');
      return {
        plan: 'lite',
        messages_used: 0,
        messages_limit: 100,
      };
    }

    const { data, error } = await supabase
      .from('users')
      .select('plan, messages_used, messages_limit')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'getUserStats');
      return {
        plan: 'lite',
        messages_used: 0,
        messages_limit: 100,
      };
    }

    if (!data) {
      console.log('👤 User not found, returning defaults');
      return {
        plan: 'lite',
        messages_used: 0,
        messages_limit: 100,
      };
    }

    console.log('✅ User stats loaded');
    return data;
  } catch (err) {
    console.error('💥 Exception in getUserStats:', err);
    return {
      plan: 'lite',
      messages_used: 0,
      messages_limit: 100,
    };
  }
}

// Verificar si usuario es admin
export async function isUserAdmin(userId) {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (err) {
    return false;
  }
}

// Obtener todos los usuarios (solo admin)
export async function getAllUsers() {
  try {
    if (!isSupabaseConfigured()) {
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'getAllUsers');
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('💥 Exception in getAllUsers:', err);
    return [];
  }
}

// Actualizar usuario (solo admin)
export async function updateUser(userId, updates) {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateUser');
      return null;
    }

    return data;
  } catch (err) {
    console.error('💥 Exception in updateUser:', err);
    return null;
  }
}

// Obtener todos los agentes
export async function getAllAgents() {
  try {
    console.log('🤖 Getting all agents from Supabase...');

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured for getAllAgents');
      return [];
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'getAllAgents');
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} agents from Supabase`);
    return data || [];
  } catch (err) {
    console.error('💥 Exception in getAllAgents:', err);
    return [];
  }
}

// Obtener agentes activos
export async function getActiveAgents() {
  try {
    console.log('🔍 Getting active agents from Supabase...');

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured for getActiveAgents');
      return [];
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getActiveAgents');
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} active agents`);
    return data || [];
  } catch (err) {
    console.error('💥 Exception in getActiveAgents:', err);
    return [];
  }
}

// Crear agente
export async function createAgent(agentData) {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('agents')
      .insert({
        ...agentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createAgent');
      return null;
    }

    return data;
  } catch (err) {
    console.error('💥 Exception in createAgent:', err);
    return null;
  }
}

// Actualizar agente
export async function updateAgent(agentId, updates) {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateAgent');
      return null;
    }

    return data;
  } catch (err) {
    console.error('💥 Exception in updateAgent:', err);
    return null;
  }
}

// Eliminar agente
export async function deleteAgent(agentId) {
  try {
    if (!isSupabaseConfigured()) {
      return false;
    }

    const { error } = await supabase.from('agents').delete().eq('id', agentId);

    if (error) {
      handleSupabaseError(error, 'deleteAgent');
      return false;
    }

    return true;
  } catch (err) {
    console.error('💥 Exception in deleteAgent:', err);
    return false;
  }
}

// Cambiar estado activo del agente
export async function toggleAgentStatus(agentId, isActive) {
  try {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('agents')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'toggleAgentStatus');
      return null;
    }

    return data;
  } catch (err) {
    console.error('💥 Exception in toggleAgentStatus:', err);
    return null;
  }
}

// Eliminar todos los mensajes de una conversación
export async function deleteConversationMessages(conversationId) {
  try {
    console.log('🗑️ Eliminando mensajes de conversación:', conversationId);

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping delete messages');
      return true; // Simular éxito
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) {
      handleSupabaseError(error, 'deleteConversationMessages');
      return false;
    }

    console.log('✅ Mensajes eliminados exitosamente');
    return true;
  } catch (err) {
    console.error('💥 Exception in deleteConversationMessages:', err);
    return false;
  }
}

// Obtener agentes por categoría
export async function getAgentsByCategory(category = null) {
  try {
    console.log('🏷️ Getting agents by category:', category || 'all');

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured for getAgentsByCategory');
      return [];
    }

    let query = supabase.from('agents').select('*').eq('is_active', true);

    if (category && category !== 'Todas') {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getAgentsByCategory');
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} agents for category`);
    return data || [];
  } catch (err) {
    console.error('💥 Exception in getAgentsByCategory:', err);
    return [];
  }
}

// Obtener todas las categorías únicas
export async function getUniqueCategories() {
  try {
    if (!isSupabaseConfigured()) {
      return ['Sin Categoría'];
    }

    const { data, error } = await supabase
      .from('agents')
      .select('category')
      .eq('is_active', true);

    if (error) {
      handleSupabaseError(error, 'getUniqueCategories');
      return ['Sin Categoría'];
    }

    const categories = [
      ...new Set(data.map((agent) => agent.category || 'Sin Categoría')),
    ];
    return categories.sort();
  } catch (err) {
    console.error('💥 Exception in getUniqueCategories:', err);
    return ['Sin Categoría'];
  }
}
