import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Probando refresh token actual...');
    
    const refreshToken = process.env.KOMMO_REFRESH_TOKEN;
    
    if (!refreshToken) {
      return NextResponse.json({
        error: 'No hay refresh token configurado',
        instructions: {
          step1: 'Ve a /api/auth/kommo para obtener un nuevo token',
          step2: 'Sigue el flujo de autorización completo'
        }
      }, { status: 400 });
    }
    
    // Configuración de la nueva integración
    const clientId = '12c033df-d837-4802-aeb6-49e8b430d834';
    const clientSecret = 'ILczgs8mBj4yL10V98Our18weSywFGr3cYJ27cMD9AHsHenRV1J8N1tx0xkz5b4g';
    const redirectUri = 'https://open-house-chi.vercel.app/api/auth/kommo/callback';
    
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    params.append('redirect_uri', redirectUri);
    
    console.log('📤 Probando con refresh token actual...');
    
    const response = await fetch('https://winstonchurchill.kommo.com/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Refresh token funciona correctamente',
        access_token: data.access_token,
        expires_in: data.expires_in
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Refresh token no funciona',
        status: response.status,
        details: errorText,
        instructions: {
          step1: 'Ve a /api/auth/kommo para obtener un nuevo token',
          step2: 'Sigue el flujo de autorización completo'
        }
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('❌ Error probando refresh token:', error);
    return NextResponse.json(
      { error: 'Error probando refresh token' },
      { status: 500 }
    );
  }
}
