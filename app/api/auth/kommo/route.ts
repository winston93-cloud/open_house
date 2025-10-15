import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Configuración de la nueva integración
    const clientId = '12c033df-d837-4802-aeb6-49e8b430d834';
    const redirectUri = 'https://open-house-chi.vercel.app/api/auth/kommo/callback';
    
    // URL de autorización de Kommo
    const authUrl = new URL('https://winstonchurchill.kommo.com/oauth2/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    
    console.log('🔗 Redirigiendo a autorización Kommo:', authUrl.toString());
    
    // Redirigir al usuario a Kommo para autorización
    return NextResponse.redirect(authUrl.toString());
    
  } catch (error) {
    console.error('❌ Error en autorización Kommo:', error);
    return NextResponse.json(
      { error: 'Error iniciando autorización' },
      { status: 500 }
    );
  }
}
