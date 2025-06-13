import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Crear o actualizar usuario
export async function upsertUser(clerkUser) {
  try {
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
      console.error('Error upserting user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in upsertUser:', err);
    return null;
  }
}

// Obtener o crear conversación
export async function getOrCreateConversation(userId, agentId) {
  try {
    // Buscar conversación existente
    let { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_id', agentId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Si no existe, crear nueva
    if (error || !conversation) {
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
        console.error('Error creating conversation:', createError);
        return null;
      }

      conversation = newConversation;
    }

    return conversation;
  } catch (err) {
    console.error('Exception in getOrCreateConversation:', err);
    return null;
  }
}

// Obtener mensajes de conversación
export async function getConversationMessages(conversationId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getConversationMessages:', err);
    return [];
  }
}

// Guardar mensaje
export async function saveMessage(conversationId, role, content) {
  try {
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
      console.error('Error saving message:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in saveMessage:', err);
    return null;
  }
}

// Incrementar contador de mensajes del usuario
export async function incrementUserMessageCount(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('messages_used, messages_limit')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching user stats:', error);
      return true; // Permitir por defecto si hay error
    }

    if (data.messages_used >= data.messages_limit) {
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
      console.error('Error updating message count:', updateError);
      return true; // Permitir por defecto si hay error
    }

    return true;
  } catch (err) {
    console.error('Exception in incrementUserMessageCount:', err);
    return true;
  }
}

// Obtener estadísticas del usuario
export async function getUserStats(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('plan, messages_used, messages_limit')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        plan: 'lite',
        messages_used: 0,
        messages_limit: 100,
      };
    }

    if (!data) {
      return {
        plan: 'lite',
        messages_used: 0,
        messages_limit: 100,
      };
    }

    return data;
  } catch (err) {
    console.error('Exception in getUserStats:', err);
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getAllUsers:', err);
    return [];
  }
}

// Actualizar usuario (solo admin)
export async function updateUser(userId, updates) {
  try {
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
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in updateUser:', err);
    return null;
  }
}

// Obtener todos los agentes
export async function getAllAgents() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getAllAgents:', err);
    return [];
  }
}

// Obtener agentes activos
export async function getActiveAgents() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching active agents:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getActiveAgents:', err);
    return [];
  }
}

// Crear agente
export async function createAgent(agentData) {
  try {
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
      console.error('Error creating agent:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in createAgent:', err);
    return null;
  }
}

// Actualizar agente
export async function updateAgent(agentId, updates) {
  try {
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
      console.error('Error updating agent:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in updateAgent:', err);
    return null;
  }
}

// Eliminar agente
export async function deleteAgent(agentId) {
  try {
    const { error } = await supabase.from('agents').delete().eq('id', agentId);

    if (error) {
      console.error('Error deleting agent:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteAgent:', err);
    return false;
  }
}

// Cambiar estado activo del agente
export async function toggleAgentStatus(agentId, isActive) {
  try {
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
      console.error('Error toggling agent status:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception in toggleAgentStatus:', err);
    return null;
  }
}

// Eliminar todos los mensajes de una conversación
export async function deleteConversationMessages(conversationId) {
  try {
    console.log('🗑️ Eliminando mensajes de conversación:', conversationId);

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) {
      console.error('Error deleting messages:', error);
      return false;
    }

    console.log('✅ Mensajes eliminados exitosamente');
    return true;
  } catch (err) {
    console.error('Exception in deleteConversationMessages:', err);
    return false;
  }
}

// Obtener agentes por categoría
export async function getAgentsByCategory(category = null) {
  try {
    let query = supabase.from('agents').select('*').eq('is_active', true);

    if (category && category !== 'Todas') {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching agents by category:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception in getAgentsByCategory:', err);
    return [];
  }
}

// Obtener todas las categorías únicas
export async function getUniqueCategories() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('category')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return ['Sin Categoría'];
    }

    const categories = [
      ...new Set(data.map((agent) => agent.category || 'Sin Categoría')),
    ];
    return categories.sort();
  } catch (err) {
    console.error('Exception in getUniqueCategories:', err);
    return ['Sin Categoría'];
  }
}
