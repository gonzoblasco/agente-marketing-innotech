// app/api/chat/route.js
// API de chat actualizada con sistema de enrutamiento inteligente de LLMs

import { NextResponse } from 'next/server';
import { getAgent } from '../../data/agents';
import { currentUser } from '@clerk/nextjs/server';
import {
  upsertUser,
  getOrCreateConversation,
  getConversationMessages,
  saveMessage,
  incrementUserMessageCount,
  getUserStats,
} from '../../lib/supabase';
import { selectBestModel } from '../../lib/llm-router';
import { callLLM } from '../../lib/llm-clients';

export async function POST(request) {
  try {
    // Obtener usuario autenticado
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { messages, agentId, forceModel } = await request.json();

    // Obtener configuración del agente desde BD
    const agent = await getAgent(agentId || 'marketing-digital');

    if (!agent) {
      return NextResponse.json(
        { error: 'Agente no encontrado o inactivo' },
        { status: 404 }
      );
    }

    console.log(
      `🤖 Usuario ${user.id} usando agente: ${agent.name} (${agent.id})`
    );

    // Asegurar que el usuario existe en nuestra BD
    await upsertUser(user);

    // Obtener estadísticas del usuario (incluyendo plan)
    const userStats = await getUserStats(user.id);

    // Verificar límite de mensajes
    const canSendMessage = await incrementUserMessageCount(user.id);
    if (!canSendMessage) {
      return NextResponse.json(
        {
          error:
            'Límite de mensajes alcanzado. Actualiza tu plan para continuar.',
          remainingMessages: 0,
        },
        { status: 429 }
      );
    }

    // Obtener o crear conversación
    const conversation = await getOrCreateConversation(user.id, agent.id);

    if (!conversation) {
      return NextResponse.json(
        { error: 'Error al crear conversación' },
        { status: 500 }
      );
    }

    // Obtener historial de conversación para contexto
    const conversationHistory = await getConversationMessages(conversation.id);

    // Obtener el último mensaje del usuario
    const lastMessage = messages[messages.length - 1];

    // Guardar mensaje del usuario
    await saveMessage(conversation.id, 'user', lastMessage.content);

    // 🚀 SELECCIÓN INTELIGENTE DE MODELO LLM
    const selectedModel = selectBestModel({
      message: lastMessage.content,
      conversationHistory: conversationHistory,
      userPlan: userStats.plan || 'lite',
      agentId: agent.id,
    });

    console.log(`🎯 Modelo seleccionado: ${selectedModel.name}`);
    console.log(
      `💰 Precio estimado: $${selectedModel.pricing.input}/$${selectedModel.pricing.output} por 1M tokens`
    );

    // Verificar si el usuario tiene acceso al modelo seleccionado
    const allowedModels = getAllowedModelsForPlan(userStats.plan);
    if (!allowedModels.includes(selectedModel.id)) {
      console.log(
        `⚠️ Modelo ${selectedModel.name} no disponible para plan ${userStats.plan}, usando fallback`
      );

      // Fallback a DeepSeek Chat para usuarios Lite
      const { LLM_MODELS } = await import('../../lib/llm-router');
      selectedModel = LLM_MODELS.DEEPSEEK_CHAT;
    }

    // Preparar mensajes para el modelo
    const modelMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // 🤖 LLAMADA AL MODELO SELECCIONADO
      const modelResponse = await callLLM({
        modelConfig: selectedModel,
        messages: modelMessages,
        systemPrompt: agent.system_prompt,
        maxTokens: getMaxTokensForPlan(userStats.plan),
        temperature: 0.7,
      });

      const assistantMessage = modelResponse.message;

      // Guardar respuesta del asistente con metadata del modelo usado
      await saveMessage(conversation.id, 'assistant', assistantMessage, {
        model_used: selectedModel.id,
        model_name: selectedModel.name,
        tokens_used: modelResponse.usage,
        response_time: modelResponse.duration,
      });

      // Calcular mensajes restantes
      const updatedStats = await getUserStats(user.id);
      const remainingMessages =
        updatedStats.messages_limit - updatedStats.messages_used;

      console.log(
        `✅ Respuesta generada por ${selectedModel.name} en ${modelResponse.duration}ms`
      );

      return NextResponse.json({
        message: assistantMessage,
        model_used: {
          id: selectedModel.id,
          name: selectedModel.name,
          provider: selectedModel.provider,
        },
        usage: modelResponse.usage,
        remaining_messages: remainingMessages,
        response_time: modelResponse.duration,
      });
    } catch (modelError) {
      console.error(`❌ Error con modelo ${selectedModel.name}:`, modelError);

      // 🔄 FALLBACK STRATEGY: Intentar con DeepSeek Chat como backup
      try {
        console.log('🔄 Intentando fallback con DeepSeek Chat...');

        const { LLM_MODELS } = await import('../../lib/llm-router');
        const fallbackModel = LLM_MODELS.DEEPSEEK_CHAT;

        const fallbackResponse = await callLLM({
          modelConfig: fallbackModel,
          messages: modelMessages,
          systemPrompt: agent.system_prompt,
          maxTokens: 2000, // Reducido para fallback
          temperature: 0.7,
        });

        const assistantMessage = fallbackResponse.message;

        // Guardar respuesta con nota de fallback
        await saveMessage(conversation.id, 'assistant', assistantMessage, {
          model_used: fallbackModel.id,
          model_name: fallbackModel.name + ' (fallback)',
          tokens_used: fallbackResponse.usage,
          response_time: fallbackResponse.duration,
          fallback: true,
          original_model_error: selectedModel.name,
        });

        const updatedStats = await getUserStats(user.id);
        const remainingMessages =
          updatedStats.messages_limit - updatedStats.messages_used;

        console.log(`✅ Fallback exitoso con ${fallbackModel.name}`);

        return NextResponse.json({
          message: assistantMessage,
          model_used: {
            id: fallbackModel.id,
            name: fallbackModel.name,
            provider: fallbackModel.provider,
            fallback: true,
          },
          usage: fallbackResponse.usage,
          remaining_messages: remainingMessages,
          response_time: fallbackResponse.duration,
          warning: 'Se usó un modelo alternativo debido a un error técnico',
        });
      } catch (fallbackError) {
        console.error('❌ Fallback también falló:', fallbackError);
        throw new Error('Todos los modelos LLM fallaron. Intenta nuevamente.');
      }
    }
  } catch (error) {
    console.error('💥 Error general en API:', error);

    // Guardar mensaje de error para debugging
    try {
      await saveMessage(
        conversation.id,
        'assistant',
        'Disculpá, hubo un error técnico. Por favor, intentá nuevamente en unos momentos.',
        {
          error: true,
          error_message: error.message,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (saveError) {
      console.error('Error guardando mensaje de error:', saveError);
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'Hubo un problema técnico. Por favor, intentá nuevamente.',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * FUNCIONES HELPER
 */

function getAllowedModelsForPlan(plan) {
  const { PLAN_CONFIGURATIONS } = require('../../lib/llm-router');
  return PLAN_CONFIGURATIONS[plan]?.allowedModels || ['deepseek-chat'];
}

function getMaxTokensForPlan(plan) {
  const limits = {
    lite: 2000, // Límite más bajo para plan gratuito
    pro: 4000, // Límite estándar
    elite: 8000, // Límite más alto para plan premium
  };

  return limits[plan] || limits.lite;
}
