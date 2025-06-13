const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Leer variables de entorno
function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    const env = {};

    for (const line of lines) {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        env[key.trim()] = value.trim();
      }
    }

    return env;
  } catch (error) {
    console.error('❌ No se pudo leer .env.local:', error.message);
    return {};
  }
}

async function verifySetup() {
  console.log('🔍 Verificando configuración de InnoTech Solutions...\n');

  const env = loadEnv();

  // 1. Verificar variables de entorno
  console.log('1. Variables de entorno:');
  const requiredVars = [
    'CLAUDE_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  let envOk = true;
  for (const varName of requiredVars) {
    if (env[varName]) {
      console.log(`   ✅ ${varName}: ${env[varName].substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: FALTANTE`);
      envOk = false;
    }
  }

  if (!envOk) {
    console.log(
      '\n❌ Faltan variables de entorno críticas. Revisar .env.local\n'
    );
    return;
  }

  // 2. Verificar conexión a Supabase
  console.log('\n2. Conexión a Supabase:');
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test básico de conexión
    const { data, error } = await supabase
      .from('agents')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ Error conectando a Supabase: ${error.message}`);

      if (error.message.includes('relation "agents" does not exist')) {
        console.log(
          '   💡 Solución: Ejecutar los scripts SQL para crear las tablas'
        );
      }
    } else {
      console.log(`   ✅ Conexión exitosa a Supabase`);
      console.log(`   ℹ️  Tabla agents encontrada con ${data || 0} registros`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // 3. Verificar tabla agents
  console.log('\n3. Verificando tabla agents:');
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: agents, error } = await supabase
      .from('agents')
      .select('id, name, is_active')
      .limit(10);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);

      if (error.message.includes('relation "agents" does not exist')) {
        console.log(
          '   💡 La tabla "agents" no existe. Ejecutá el script SQL para crearla.'
        );
      }
    } else {
      console.log(
        `   ✅ Tabla agents encontrada con ${agents.length} agentes:`
      );
      agents.forEach((agent) => {
        console.log(
          `      - ${agent.id}: ${agent.name} (${
            agent.is_active ? 'activo' : 'inactivo'
          })`
        );
      });
    }
  } catch (error) {
    console.log(`   ❌ Error verificando agents: ${error.message}`);
  }

  // 4. Verificar tabla users
  console.log('\n4. Verificando tabla users:');
  try {
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.message.includes('relation "users" does not exist')) {
        console.log(
          '   💡 La tabla "users" no existe. Ejecutá el script SQL para crearla.'
        );
      }
    } else {
      console.log(`   ✅ Tabla users encontrada con ${data || 0} usuarios`);
    }
  } catch (error) {
    console.log(`   ❌ Error verificando users: ${error.message}`);
  }

  // 5. Verificar API de Claude
  console.log('\n5. Verificando API de Claude:');
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Test' }],
      }),
    });

    if (response.ok) {
      console.log('   ✅ API de Claude funcionando correctamente');
    } else {
      const error = await response.text();
      console.log(`   ❌ Error API Claude (${response.status}): ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error conectando a Claude: ${error.message}`);
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMEN DE VERIFICACIÓN');
  console.log('='.repeat(50));
  console.log('Si todos los puntos están en ✅, tu setup está completo.');
  console.log('Si hay ❌, seguí las instrucciones para solucionarlo.');
  console.log('\n🚀 Una vez todo esté ✅, ejecutá: npm run dev');
}

// Ejecutar verificación
verifySetup().catch(console.error);
