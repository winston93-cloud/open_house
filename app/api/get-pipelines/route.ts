import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { getKommoAccessToken } = await import('../../../lib/kommo');
    const accessToken = await getKommoAccessToken('open-house');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No se pudo obtener token de Kommo' },
        { status: 500 }
      );
    }

    const response = await fetch('https://winstonchurchill.kommo.com/api/v4/leads/pipelines', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Error al consultar pipelines', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: 'Error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
