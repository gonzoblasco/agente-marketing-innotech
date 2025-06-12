import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions para el manejo de datos

// Crear o actualizar usuario
export async function upsertUser(clerkUser) {
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
}

// Obtener o crear conversación
export async function getOrCreateConversation(userId, agentId) {
  // Buscar conversación existente
  let { data: conversation, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

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
}

// Obtener mensajes de conversación
export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data;
}

// Guardar mensaje
export async function saveMessage(conversationId, role, content) {
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
}

// Incrementar contador de mensajes del usuario
export async function incrementUserMessageCount(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('messages_used, messages_limit')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return false;
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
    return false;
  }

  return true;
}

// Obtener estadísticas del usuario
export async function getUserStats(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('plan, messages_used, messages_limit')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}
