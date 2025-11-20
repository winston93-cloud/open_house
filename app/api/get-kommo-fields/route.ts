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

    // Obtener campos de contactos
    const contactsResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/contacts/custom_fields', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Obtener campos de leads
    const leadsResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/leads/custom_fields', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!contactsResponse.ok || !leadsResponse.ok) {
      return NextResponse.json(
        { error: 'Error al consultar campos' },
        { status: 500 }
      );
    }

    const contactsData = await contactsResponse.json();
    const leadsData = await leadsResponse.json();

    return NextResponse.json({
      contacts: contactsData,
      leads: leadsData
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

