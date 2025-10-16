// Script de prueba para autenticación Kommo
const testAuth = async () => {
  const params = new URLSearchParams();
  params.append('client_id', '12c033df-d837-4802-aeb6-49e8b430d834');
  params.append('client_secret', 'ILczgs8mBj4yL10V98Our18weSywFGr3cYJ27cMD9AHsHenRV1J8N1tx0xkz5b4g');
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjcxMj...'); // Usa tu refresh token actual
  params.append('redirect_uri', 'https://open-house-chi.vercel.app');

  console.log('🔍 Probando autenticación Kommo...');
  console.log('📤 Parámetros:', params.toString());

  try {
    const response = await fetch('https://winstonchurchill.kommo.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });
    
    console.log('📥 Status:', response.status);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Response:', responseText);
    
    if (response.ok) {
      console.log('✅ ¡Autenticación exitosa!');
    } else {
      console.log('❌ Error en autenticación');
    }
    
  } catch (error) {
    console.error('💥 Error de red:', error);
  }
};

// Ejecutar el test
testAuth();
