import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Configuración de la integración original de Open House
    const clientId = '0c82cd53-e059-48b7-9478-e3fd71f51f1f';
    const redirectUri = 'https://open-house-chi.vercel.app/api/auth/kommo/callback';
    
    // URL de autorización de Kommo (CORREGIDA)
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
