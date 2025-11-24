import { NextResponse } from 'next/server';

// =============================================================================
// ENDPOINT: Enviar SMS via SMS Mobile API (Android Gateway)
// =============================================================================

export async function POST(request: Request) {
  // Obtener variables de entorno
  const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
  const SMS_GATEWAY_TOKEN = process.env.SMS_GATEWAY_TOKEN;

  console.log('🔍 Verificando variables de SMS Mobile API:', {
    hasURL: !!SMS_GATEWAY_URL,
    hasToken: !!SMS_GATEWAY_TOKEN,
  });

  if (!SMS_GATEWAY_URL || !SMS_GATEWAY_TOKEN) {
    console.error('❌ SMS Mobile API no configurado. Variables faltantes:', {
      SMS_GATEWAY_URL: !!SMS_GATEWAY_URL,
      SMS_GATEWAY_TOKEN: !!SMS_GATEWAY_TOKEN,
    });
    return NextResponse.json(
      {
        error: 'SMS Mobile API no configurado',
        details: 'Verifica SMS_GATEWAY_URL y SMS_GATEWAY_TOKEN en Vercel',
        missing: {
          url: !SMS_GATEWAY_URL,
          token: !SMS_GATEWAY_TOKEN,
        }
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

    // Formatear número (SMS Mobile API acepta cualquier formato)
    let formattedPhone = phone.toString().trim();
    // Remover +52 si lo tiene
    if (formattedPhone.startsWith('+52')) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith('52')) {
      formattedPhone = formattedPhone.substring(2);
    }

    console.log('📤 Enviando SMS via Mobile API a:', formattedPhone);

    // Enviar SMS usando SMS Mobile API
    const smsResponse = await fetch(SMS_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SMS_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        number: formattedPhone,
        message: message,
        device_id: '0', // 0 = dispositivo por defecto
      }),
    });

    const responseData = await smsResponse.json();

    if (!smsResponse.ok || !responseData.success) {
      console.error('❌ Error de SMS Mobile API:', responseData);
      return NextResponse.json(
        {
          error: 'SMS Mobile API respondió con error',
          status: smsResponse.status,
          details: responseData,
        },
        { status: 502 }
      );
    }

    console.log('✅ SMS enviado exitosamente via Mobile API:', {
      to: formattedPhone,
      messageId: responseData.messageId,
    });

    return NextResponse.json({
      success: true,
      messageId: responseData.messageId,
      to: formattedPhone,
    });
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    return NextResponse.json(
      {
        error: 'No se pudo enviar el SMS',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}


