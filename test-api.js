const fs = require('fs');

// Leer manualmente el archivo .env.local
function loadEnv() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      if (line.includes('CLAUDE_API_KEY=')) {
        return line.split('=')[1].trim();
      }
    }
  } catch (error) {
    console.error('No se pudo leer .env.local:', error.message);
  }
  return null;
}

async function testClaudeAPI() {
  try {
    const apiKey = loadEnv();
    
    console.log('Testing Claude API...');
    console.log('API Key encontrada:', !!apiKey);
    console.log('API Key primeros chars:', apiKey?.substring(0, 15) + '...');
    
    if (!apiKey) {
      console.error('❌ No se encontró CLAUDE_API_KEY en .env.local');
      return;
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Hola, responde solo "Test exitoso"'
          }
        ]
      })
    });

    console.log('Status code:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS:', data.content[0].text);
    } else {
      const error = await response.text();
      console.log('❌ ERROR RESPONSE:', error);
    }
  } catch (error) {
    console.error('💥 EXCEPTION:', error.message);
  }
}

testClaudeAPI();