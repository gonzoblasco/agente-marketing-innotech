// app/api/payments/create/route.js
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createPaymentPreference, PLANS } from '../../../lib/mercadopago';
import { upsertUser } from '../../../lib/supabase';

export async function POST(request) {
  try {
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

    // ⭐ FIX: Verificar si MercadoPago está configurado
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
      // Si MercadoPago no está configurado, devolver error amigable
      if (mpError.message.includes('MercadoPago no está configurado')) {
        return NextResponse.json(
          {
            error: 'Pagos temporalmente deshabilitados',
            message:
              'El sistema de pagos está en mantenimiento. Intentá más tarde.',
            debug:
              process.env.NODE_ENV === 'development'
                ? mpError.message
                : undefined,
          },
          { status: 503 } // Service Unavailable
        );
      }

      // Re-lanzar otros errores
      throw mpError;
    }
  } catch (error) {
    console.error('❌ Error creando pago:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        error: 'Error creando pago',
        details: error.message,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
