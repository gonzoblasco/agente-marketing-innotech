// app/api/payments/create/route.js
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createPaymentPreference, PLANS } from '../../../lib/mercadopago';
import { upsertUser } from '../../../lib/supabase';

export async function POST(request) {
  try {
    // DEBUG: Verificar variables de entorno
    console.log('🔧 Debug MP Variables:', {
      hasAccessToken: !!process.env.MP_ACCESS_TOKEN_SANDBOX,
      hasPublicKey: !!process.env.MP_PUBLIC_KEY_SANDBOX,
      nodeEnv: process.env.NODE_ENV,
      accessTokenPrefix: process.env.MP_ACCESS_TOKEN_SANDBOX?.substring(0, 10),
    });

    // Verificar autenticación
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    // Validar plan
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    console.log(`💳 Creando pago para usuario ${user.id}, plan ${planId}`);

    // Asegurar que el usuario existe en nuestra BD
    await upsertUser(user);

    // ⭐ CAMBIO TEMPORAL: Mostrar error específico
    try {
      // Crear preferencia de MercadoPago
      const preference = await createPaymentPreference(
        planId,
        user.id,
        user.emailAddresses[0]?.emailAddress
      );

      console.log('✅ Preferencia MP creada:', preference.id);

      return NextResponse.json({
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        plan: PLANS[planId],
      });
    } catch (mpError) {
      // ⭐ LOG DETALLADO DEL ERROR
      console.error('❌ Error específico de MercadoPago:', {
        message: mpError.message,
        stack: mpError.stack,
        name: mpError.name,
      });

      return NextResponse.json(
        {
          error: 'Error de configuración de MercadoPago',
          details: mpError.message,
          debug: {
            hasAccessToken: !!process.env.MP_ACCESS_TOKEN_SANDBOX,
            hasPublicKey: !!process.env.MP_PUBLIC_KEY_SANDBOX,
            nodeEnv: process.env.NODE_ENV,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
