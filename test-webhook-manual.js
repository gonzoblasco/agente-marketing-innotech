// test-webhook-manual.js
// Script para testear el webhook manualmente

const testWebhookManual = async () => {
  // Datos simulando una notificación real de MercadoPago
  const webhookPayload = {
    type: 'payment',
    action: 'payment.created',
    data: {
      id: '123456789', // ID de pago simulado
    },
  };

  try {
    console.log('🧪 Testing webhook con datos simulados...');

    // Llamar a tu webhook deployado
    const response = await fetch(
      'https://agente-marketing-innotech.vercel.app/api/webhooks/mercadopago',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      }
    );

    const result = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Body:', result);

    if (response.ok) {
      console.log('✅ Webhook responded successfully');
    } else {
      console.log('❌ Webhook error:', result);
    }
  } catch (error) {
    console.error('💥 Error testing webhook:', error);
  }
};

testWebhookManual();
