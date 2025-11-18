import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasTWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
    hasTWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
    hasTWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER,
    
    // Mostrar primeros 4 caracteres para verificar
    TWILIO_ACCOUNT_SID_preview: process.env.TWILIO_ACCOUNT_SID?.substring(0, 4) || 'NO_EXISTE',
    TWILIO_AUTH_TOKEN_preview: process.env.TWILIO_AUTH_TOKEN?.substring(0, 4) || 'NO_EXISTE',
    TWILIO_PHONE_NUMBER_preview: process.env.TWILIO_PHONE_NUMBER?.substring(0, 4) || 'NO_EXISTE',
    
    // Lista de todas las variables que empiecen con TWILIO
    allTwilioVars: Object.keys(process.env).filter(k => k.startsWith('TWILIO'))
  });
}

