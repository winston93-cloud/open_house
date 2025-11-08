import { NextResponse } from 'next/server';

const GATEWAY_URL = process.env.SMS_GATEWAY_URL;
const GATEWAY_TOKEN = process.env.SMS_GATEWAY_TOKEN;

export async function POST(request: Request) {
  if (!GATEWAY_URL || !GATEWAY_TOKEN) {
    return NextResponse.json(
      {
        error: 'SMS gateway no configurado',
        details: 'Verifica SMS_GATEWAY_URL y SMS_GATEWAY_TOKEN',
      },
      { status: 500 }
    );
  }

  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Número y mensaje son obligatorios' },
        { status: 400 }
      );
    }

    const payload = new URLSearchParams({
      apikey: GATEWAY_TOKEN,
      recipients: phone,
      message,
      sendsms: '1',
    });

    const gatewayResponse = await fetch(GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const rawBody = await gatewayResponse.text();

    if (!gatewayResponse.ok) {
      return NextResponse.json(
        {
          error: 'Gateway respondió con error',
          status: gatewayResponse.status,
          body: rawBody,
        },
        { status: 502 }
      );
    }

    let parsedBody: unknown = rawBody;

    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      // El gateway puede devolver texto plano; lo devolvemos tal cual
    }

    return NextResponse.json({
      success: true,
      gatewayResponse: parsedBody,
    });
  } catch (error) {
    console.error('Error enviando SMS:', error);
    return NextResponse.json(
      {
        error: 'No se pudo enviar el SMS',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}


