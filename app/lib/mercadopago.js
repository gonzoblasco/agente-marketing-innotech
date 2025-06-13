// app/lib/mercadopago.js
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Debug de credenciales
const accessToken =
  process.env.NODE_ENV === 'production'
    ? process.env.MP_ACCESS_TOKEN_PROD
    : process.env.MP_ACCESS_TOKEN_SANDBOX;

console.log('🔧 MP Debug:', {
  nodeEnv: process.env.NODE_ENV,
  hasAccessToken: !!accessToken,
  accessTokenPrefix: accessToken?.substring(0, 10) + '...',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!accessToken) {
  throw new Error(
    'MercadoPago Access Token no encontrado en variables de entorno'
  );
}

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  },
});

export const preference = new Preference(client);

// Planes disponibles
export const PLANS = {
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    price: 30000, // $30.000 ARS
    messages_limit: 1000,
    description: 'Acceso completo + 1000 mensajes/mes',
  },
  elite: {
    id: 'elite',
    name: 'Plan Elite',
    price: 60000, // $60.000 ARS
    messages_limit: 2000,
    description: 'Plan Elite + 2000 mensajes/mes + soporte prioritario',
  },
};

// Función para crear preferencia de pago
export async function createPaymentPreference(planId, userId, userEmail) {
  try {
    const plan = PLANS[planId];

    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    // Debug URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log('🔧 Base URL:', baseUrl);
    console.log('🔧 User email:', userEmail);

    if (!userEmail) {
      throw new Error('Email de usuario requerido');
    }

    const preferenceData = {
      items: [
        {
          id: `${planId}_${userId}`,
          title: plan.name,
          description: plan.description,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`,
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      external_reference: `${userId}_${planId}_${Date.now()}`,
      metadata: {
        user_id: userId,
        plan_id: planId,
        upgrade_type: 'plan_upgrade',
      },
    };

    console.log('🔄 Creando preferencia MP:', {
      plan: plan.name,
      price: plan.price,
      user: userId,
    });

    const result = await preference.create({ body: preferenceData });

    console.log('✅ Preferencia creada:', result.id);

    return result;
  } catch (error) {
    console.error('❌ Error creando preferencia MP:', error);
    throw error;
  }
}
