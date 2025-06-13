// test-webhook-simple.js
// Script para testear la lógica del webhook sin MercadoPago real

const mockPaymentData = {
  id: '12345678901',
  status: 'approved',
  external_reference: 'user_1234567890_pro_1703123456789', // Formato correcto
  transaction_amount: 30000,
  currency_id: 'ARS',
  payer: {
    email: 'test@example.com',
  },
};

const testWebhookLogic = () => {
  console.log('🧪 Testing webhook logic...');

  // Simular parsing del external_reference con nueva lógica
  const externalRef = mockPaymentData.external_reference;
  console.log('📋 External reference:', externalRef);

  // Nueva lógica más robusta
  const parts = externalRef.split('_');
  console.log('🔧 Parts after split:', parts);

  if (parts.length < 3) {
    console.log('❌ Formato inválido - muy pocas partes');
    return;
  }

  // Los últimos 2 elementos son planId y timestamp
  const planId = parts[parts.length - 2];
  const timestamp = parts[parts.length - 1];
  // Todo lo anterior es el userId
  const userId = parts.slice(0, -2).join('_');

  console.log('👤 User ID:', userId);
  console.log('💰 Plan ID:', planId);
  console.log('⏰ Timestamp:', timestamp);

  // Verificar configuración de planes
  const planLimits = {
    pro: { messages_limit: 1000, plan: 'pro' },
    elite: { messages_limit: 2000, plan: 'elite' },
  };

  const planConfig = planLimits[planId];
  console.log('⚙️ Plan config:', planConfig);

  if (!planConfig) {
    console.log('❌ Plan inválido:', planId);
    return;
  }

  // Simular updates que se harían
  const updates = {
    plan: planConfig.plan,
    messages_limit: planConfig.messages_limit,
    messages_used: 0,
    last_payment_id: mockPaymentData.id,
    last_payment_date: new Date().toISOString(),
  };

  console.log('✅ Updates que se aplicarían:', updates);
  console.log('🎉 Webhook logic test PASSED!');
};

testWebhookLogic();
