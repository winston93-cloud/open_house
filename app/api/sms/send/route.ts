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

    // Formatear número - SMS Mobile API necesita el número SIN +52, solo 10 dígitos
    let formattedPhone = phone.toString().trim();
    
    // Remover cualquier formato: +52, 52, espacios, guiones
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, ''); // Quitar espacios, guiones, paréntesis
    
    if (formattedPhone.startsWith('+52')) {
      formattedPhone = formattedPhone.substring(3); // Quitar +52
    } else if (formattedPhone.startsWith('52') && formattedPhone.length > 10) {
      formattedPhone = formattedPhone.substring(2); // Quitar 52
    }

    console.log('📤 Enviando SMS via Mobile API a:', formattedPhone);

    // Enviar SMS usando SMS Mobile API
    const smsResponse = await fetch(SMS_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: SMS_GATEWAY_TOKEN,
        recipients: formattedPhone,
        message: message,
      }),
    });

    const responseData = await smsResponse.json();

    console.log('📥 Respuesta de SMS Mobile API:', responseData);

    // SMS Mobile API devuelve { result: { error, sent, guid } }
    if (responseData.result && responseData.result.error) {
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
      guid: responseData.result?.guid,
    });

    return NextResponse.json({
      success: true,
      messageId: responseData.result?.guid,
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


