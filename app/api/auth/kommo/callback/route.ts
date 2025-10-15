import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      console.error('❌ Error de autorización:', error);
      return NextResponse.json(
        { error: `Error de autorización: ${error}` },
        { status: 400 }
      );
    }
    
    if (!code) {
      console.error('❌ No se recibió código de autorización');
      return NextResponse.json(
        { error: 'No se recibió código de autorización' },
        { status: 400 }
      );
    }
    
    console.log('✅ Código de autorización recibido:', code);
    
    // Configuración de la nueva integración
    const clientId = '12c033df-d837-4802-aeb6-49e8b430d834';
    const clientSecret = 'ILczgs8mBj4yL10V98Our18weSywFGr3cYJ27cMD9AHsHenRV1J8N1tx0xkz5b4g';
    const redirectUri = 'https://open-house-chi.vercel.app/api/auth/kommo/callback';
    
    // Intercambiar code por tokens
    const tokenUrl = 'https://winstonchurchill.kommo.com/oauth2/access_token';
    
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    
    console.log('🔄 Intercambiando code por tokens...');
    console.log('📤 Parámetros:', params.toString());
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error obteniendo tokens:', errorText);
      return NextResponse.json(
        { error: `Error obteniendo tokens: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }
    
    const tokenData = await response.json();
    console.log('✅ Tokens obtenidos exitosamente');
    
    // Mostrar los tokens (en producción, estos deberían guardarse de forma segura)
    return NextResponse.json({
      success: true,
      message: 'Tokens obtenidos exitosamente',
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type
      },
      instructions: {
        step1: 'Copia el refresh_token',
        step2: 'Ve a Vercel Dashboard → Environment Variables',
        step3: 'Actualiza KOMMO_REFRESH_TOKEN con el nuevo valor',
        step4: 'Redeploy el proyecto'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en callback de autorización:', error);
    return NextResponse.json(
      { error: 'Error procesando autorización' },
      { status: 500 }
    );
  }
}
