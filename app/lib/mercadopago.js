// app/lib/mercadopago.js
import { MercadoPagoConfig, Preference } from 'mercadopago';

console.log('🔧 MercadoPago Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  HAS_SANDBOX_TOKEN: !!process.env.MP_ACCESS_TOKEN_SANDBOX,
  HAS_PROD_TOKEN: !!process.env.MP_ACCESS_TOKEN_PROD,
  HAS_SANDBOX_KEY: !!process.env.MP_PUBLIC_KEY_SANDBOX,
  HAS_PROD_KEY: !!process.env.MP_PUBLIC_KEY_PROD,
  SANDBOX_TOKEN_PREFIX: process.env.MP_ACCESS_TOKEN_SANDBOX?.substring(0, 10),
  PROD_TOKEN_PREFIX: process.env.MP_ACCESS_TOKEN_PROD?.substring(0, 10),
});

const accessToken =
  process.env.NODE_ENV === 'production'
    ? process.env.MP_ACCESS_TOKEN_PROD
    : process.env.MP_ACCESS_TOKEN_SANDBOX;

console.log('🎯 Selected Token:', {
  isProduction: process.env.NODE_ENV === 'production',
  hasToken: !!accessToken,
  tokenPrefix: accessToken?.substring(0, 10),
});

console.log('🔧 MP Debug:', {
  nodeEnv: process.env.NODE_ENV,
  hasAccessToken: !!accessToken,
  accessTokenPrefix: accessToken?.substring(0, 10) + '...',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

// ⭐ FIX: No lanzar error durante el build
let client = null;
let preference = null;

if (accessToken) {
  try {
    // Configuración de MercadoPago
    client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });

    preference = new Preference(client);
  } catch (error) {
    console.warn('⚠️ MercadoPago no configurado:', error.message);
  }
} else {
  console.warn(
    '⚠️ MercadoPago Access Token no encontrado - funcionalidad de pagos deshabilitada'
  );
}

// Exportar preference (puede ser null)
export { preference };

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
    // ⭐ FIX: Validar que MercadoPago esté configurado
    if (!preference) {
      throw new Error(
        'MercadoPago no está configurado. Verificar variables de entorno.'
      );
    }

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

    // Estructura sin auto_return para testing
    const preferenceData = {
      items: [
        {
          id: `plan_${planId}_${userId}`,
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
      external_reference: `${userId}_${planId}_${Date.now()}`,
    };

    console.log('🔧 Preference data:', JSON.stringify(preferenceData, null, 2));

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
