import { NextResponse } from 'next/server';
import { sendSMS } from '../../../../lib/sms';

// =============================================================================
// ENDPOINT: Enviar SMS via SMS Mobile API (Android Gateway)
// =============================================================================

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Número y mensaje son obligatorios' },
        { status: 400 }
      );
    }

    // Usar la función helper de SMS
    const result = await sendSMS(phone, message);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'No se pudo enviar el SMS',
          details: result.error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: result.to,
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
