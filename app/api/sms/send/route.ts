import { NextResponse } from 'next/server';

// =============================================================================
// CONFIGURACIÓN DE TWILIO
// =============================================================================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: Request) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return NextResponse.json(
      {
        error: 'Twilio no configurado',
        details: 'Verifica TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER',
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

    // Formatear número para Twilio (debe incluir código de país)
    let formattedPhone = phone.toString().trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+52' + formattedPhone; // México por defecto
    }

    // Enviar SMS usando Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const payload = new URLSearchParams({
      From: TWILIO_PHONE_NUMBER,
      To: formattedPhone,
      Body: message,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
      },
      body: payload.toString(),
    });

    const responseData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Error de Twilio:', responseData);
      return NextResponse.json(
        {
          error: 'Twilio respondió con error',
          status: twilioResponse.status,
          details: responseData,
        },
        { status: 502 }
      );
    }

    console.log('✅ SMS enviado exitosamente:', {
      to: formattedPhone,
      sid: responseData.sid,
      status: responseData.status
    });

    return NextResponse.json({
      success: true,
      messageSid: responseData.sid,
      status: responseData.status,
      to: formattedPhone,
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


