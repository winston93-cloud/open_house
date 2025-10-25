import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const KOMMO_CONFIG = {
      subdomain: 'winstonchurchill',
      accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2OWZhMDA2OWIwOTNjMGFhNmZmMjQ2MTJkZjQ3MjI3Y2ViNTM3MGUyODAxODg1MzBmZDM1MDE1MDU0NDA2ZGE2OTdlNDIxMDJhODZkZDI0In0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiJkNjlmYTAwNjliMDkzYzBhYTZmZjI0NjEyZGY0NzIyN2NlYjUzNzBlMjgwMTg4NTMwZmQzNTAxNTA1NDQwNmRhNjk3ZTQyMTAyYTg2ZGQyNCIsImlhdCI6MTc2MTA1NTQzOCwibmJmIjoxNzYxMDU1NDM4LCJleHAiOjE3NjcxMzkyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlNmQxYmViMy0yMGNlLTQ0YWQtODQ0MC1lYTlhZDhlYjhhYWUiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.ccmhIk5mzRS0KyWhoagHROXdXX0fJHXTMKa43JNh9d-S0-snBpMae6WJz2IvX2k1j1tk0oKYIqjus2UviPRsHunuFO1SDmO6h1T1m3bTeNEXcNytreytSYlXgYws4rYxLYUGF5k9DMeFyoN92lXc_r6H97GDa5hvpmG1MCi8cVTMiumRkHtzmzgvqD9OAmUxLAzE3UQy846kwCn6ctJ_nSGSIfr_IKR4fRK1DBPkDVUhpTK5Mr1Hl6LAYj3dMotcjOl13ZfS7G3XsDfLFVW29zJm_SsYg_kTwYBuVxO2lyyFKG6ePZdxrVFGlcH_ppGwpulGOSj6Ua-AH8NQ-kIlBA'
    };

    // Probar conexión básica con Kommo
    const testUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/account`;
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${KOMMO_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Error de conexión con Kommo',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Conexión con Kommo exitosa',
      data: {
        account_id: data.id,
        name: data.name,
        subdomain: data.subdomain
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Error de prueba', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
