// app/api/webhooks/mercadopago/route.js
import { NextResponse } from 'next/server';
import { updateUser, supabase } from '../../../lib/supabase';

export async function POST(request) {
  try {
    console.log('🔔 Webhook MercadoPago recibido');

    // Obtener el body del webhook
    const body = await request.json();
    const { type, data, action } = body;

    console.log('📦 Webhook data:', { type, action, id: data?.id });

    // Solo procesar notificaciones de pago
    if (type !== 'payment') {
      console.log('⚠️ Webhook ignorado - no es tipo payment');
      return NextResponse.json({ status: 'ignored' });
    }

    // Obtener información detallada del pago desde MP
    const paymentId = data?.id;
    if (!paymentId) {
      console.log('❌ No payment ID en webhook');
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    // Consultar datos completos del pago a MercadoPago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN_SANDBOX}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.log('❌ Error obteniendo datos de pago de MP');
      return NextResponse.json({ error: 'MP API error' }, { status: 500 });
    }

    const payment = await paymentResponse.json();
    console.log('💰 Payment data:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      transaction_amount: payment.transaction_amount,
    });

    // Solo procesar pagos aprobados
    if (payment.status !== 'approved') {
      console.log(`⏳ Pago no aprobado aún: ${payment.status}`);
      return NextResponse.json({ status: 'pending' });
    }

    // Extraer información del external_reference
    // Formato: userId_planId_timestamp
    const externalRef = payment.external_reference;
    if (!externalRef) {
      console.log('❌ No external_reference en pago');
      return NextResponse.json(
        { error: 'No external reference' },
        { status: 400 }
      );
    }

    const [userId, planId] = externalRef.split('_');
    if (!userId || !planId) {
      console.log('❌ External reference mal formateado:', externalRef);
      return NextResponse.json(
        { error: 'Invalid external reference' },
        { status: 400 }
      );
    }

    console.log('🎯 Processing payment for:', { userId, planId });

    // Definir límites por plan
    const planLimits = {
      pro: { messages_limit: 1000, plan: 'pro' },
      elite: { messages_limit: 2000, plan: 'elite' },
    };

    const planConfig = planLimits[planId];
    if (!planConfig) {
      console.log('❌ Plan ID inválido:', planId);
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Actualizar usuario en base de datos
    const updates = {
      plan: planConfig.plan,
      messages_limit: planConfig.messages_limit,
      messages_used: 0, // Reset mensajes usados
      last_payment_id: payment.id,
      last_payment_date: new Date().toISOString(),
    };

    console.log('📝 Updating user:', userId, updates);

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      console.log('❌ Error actualizando usuario en BD');
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // Log de transacción para auditoría
    try {
      await supabase.from('payment_logs').insert({
        user_id: userId,
        payment_id: payment.id,
        plan_id: planId,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        status: payment.status,
        external_reference: externalRef,
        webhook_processed_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.log('⚠️ Error guardando log de pago:', logError);
      // No fallar si el log falla
    }

    console.log('✅ Usuario actualizado exitosamente:', {
      userId,
      newPlan: planConfig.plan,
      newLimit: planConfig.messages_limit,
    });

    // Responder éxito a MercadoPago
    return NextResponse.json({
      status: 'success',
      user_id: userId,
      plan: planConfig.plan,
      messages_limit: planConfig.messages_limit,
    });
  } catch (error) {
    console.error('💥 Error procesando webhook MP:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Webhook de MercadoPago solo acepta POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for webhooks.' },
    { status: 405 }
  );
}
