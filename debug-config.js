// debug-config.js
// Script para verificar configuración del proyecto

console.log('🔍 DIAGNÓSTICO DE CONFIGURACIÓN - InnoTech Solutions\n');

// Función helper para mostrar status
function showStatus(name, value, isRequired = true) {
  const status = value ? '✅' : isRequired ? '❌' : '⚠️';
  const preview = value ? `${value.substring(0, 20)}...` : 'NO CONFIGURADO';
  const priority = isRequired ? '[REQUERIDO]' : '[OPCIONAL]';

  console.log(`${status} ${name} ${priority}`);
  console.log(`   Valor: ${preview}\n`);

  return !!value;
}

// Verificar variables de entorno
console.log('🔧 VARIABLES DE ENTORNO:\n');

const claudeApi = process.env.CLAUDE_API_KEY;
const clerkPub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecret = process.env.CLERK_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mpSandbox = process.env.MP_ACCESS_TOKEN_SANDBOX;
const mpPubKey = process.env.MP_PUBLIC_KEY_SANDBOX;

// Variables críticas
const claudeOk = showStatus('CLAUDE_API_KEY', claudeApi, true);
const clerkPubOk = showStatus(
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  clerkPub,
  true
);
const clerkSecretOk = showStatus('CLERK_SECRET_KEY', clerkSecret, true);

// Variables para funcionalidad completa
const supabaseUrlOk = showStatus('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl, true);
const supabaseKeyOk = showStatus(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  supabaseKey,
  true
);

// Variables opcionales
const mpOk = showStatus('MP_ACCESS_TOKEN_SANDBOX', mpSandbox, false);
const mpPubOk = showStatus('MP_PUBLIC_KEY_SANDBOX', mpPubKey, false);

// Resumen
console.log('📊 RESUMEN DE ESTADO:\n');

const basicFunctionality = claudeOk && clerkPubOk && clerkSecretOk;
const fullFunctionality = basicFunctionality && supabaseUrlOk && supabaseKeyOk;
const paymentsReady = mpOk && mpPubOk;

if (basicFunctionality) {
  console.log('✅ FUNCIONALIDAD BÁSICA: OK');
  console.log('   - Login/logout funcionará');
  console.log('   - Chat básico funcionará');
  console.log('   - Sin persistencia de conversaciones\n');
} else {
  console.log('❌ FUNCIONALIDAD BÁSICA: FALTAN CONFIGURACIONES CRÍTICAS');
  console.log('   - La app no funcionará correctamente\n');
}

if (fullFunctionality) {
  console.log('✅ FUNCIONALIDAD COMPLETA: OK');
  console.log('   - Persistencia de conversaciones');
  console.log('   - Dashboard de usuario');
  console.log('   - Gestión de límites de mensajes\n');
} else if (basicFunctionality) {
  console.log('⚠️ FUNCIONALIDAD COMPLETA: FALTA SUPABASE');
  console.log('   - App funcionará pero sin persistencia');
  console.log('   - Usar agentes fallback\n');
}

if (paymentsReady) {
  console.log('✅ PAGOS: OK');
  console.log('   - MercadoPago configurado');
  console.log('   - Sistema de suscripciones funcionará\n');
} else {
  console.log('⚠️ PAGOS: NO CONFIGURADO');
  console.log('   - Solo funcionará plan gratuito');
  console.log('   - Configurar MP para monetización\n');
}

// Próximos pasos
console.log('🚀 PRÓXIMOS PASOS:\n');

if (!basicFunctionality) {
  console.log('1. 🔑 CONFIGURAR VARIABLES CRÍTICAS:');
  if (!claudeOk)
    console.log('   - Obtener CLAUDE_API_KEY desde https://claude.ai/api');
  if (!clerkPubOk || !clerkSecretOk)
    console.log('   - Configurar Clerk desde https://dashboard.clerk.com');
  console.log('');
}

if (basicFunctionality && !fullFunctionality) {
  console.log('2. 🗄️ CONFIGURAR SUPABASE:');
  console.log('   - Crear proyecto en https://app.supabase.io');
  console.log('   - Copiar URL y anon key');
  console.log('   - Crear tablas necesarias\n');
}

if (fullFunctionality && !paymentsReady) {
  console.log('3. 💳 CONFIGURAR PAGOS (OPCIONAL):');
  console.log('   - Crear cuenta en MercadoPago Developers');
  console.log('   - Obtener credenciales de sandbox');
  console.log('   - Configurar webhook para notificaciones\n');
}

// Test de conectividad
console.log('🌐 TESTS DE CONECTIVIDAD:\n');

async function testConnections() {
  // Test Claude API
  if (claudeOk) {
    console.log('🧠 Testing Claude API...');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApi,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }],
        }),
      });

      if (response.ok) {
        console.log('   ✅ Claude API: Conectado correctamente\n');
      } else {
        console.log(`   ❌ Claude API: Error ${response.status}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Claude API: Error de conexión\n`);
    }
  }

  // Test Supabase
  if (supabaseUrlOk && supabaseKeyOk) {
    console.log('🗄️ Testing Supabase...');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('agents')
        .select('count')
        .limit(1);

      if (!error) {
        console.log('   ✅ Supabase: Conectado correctamente\n');
      } else {
        console.log(`   ❌ Supabase: ${error.message}\n`);
      }
    } catch (error) {
      console.log(`   ❌ Supabase: Error de conexión\n`);
    }
  }
}

// Ejecutar tests solo si no es build time
if (typeof window !== 'undefined' || process.env.NODE_ENV === 'development') {
  // testConnections().catch(console.error);
  console.log(
    '💡 Para ejecutar tests de conectividad, ejecuta este script en el servidor.'
  );
}

console.log('🎯 CONFIGURACIÓN MÍNIMA RECOMENDADA PARA EMPEZAR:');
console.log('1. CLAUDE_API_KEY (para chat básico)');
console.log('2. CLERK keys (para autenticación)');
console.log('3. SUPABASE keys (para persistencia)');
console.log('\n🚀 Con esto tendrás una app completamente funcional!');

export default function debugConfig() {
  return {
    basic: basicFunctionality,
    full: fullFunctionality,
    payments: paymentsReady,
    missing: {
      claude: !claudeOk,
      clerk: !clerkPubOk || !clerkSecretOk,
      supabase: !supabaseUrlOk || !supabaseKeyOk,
      mercadopago: !mpOk || !mpPubOk,
    },
  };
}
