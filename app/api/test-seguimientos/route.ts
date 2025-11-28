import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

// Mensajes SMS de seguimiento
function getMensaje24h(): string {
  return `RECORDATORIO

¡Hola! Te recordamos que estamos disponibles para apoyarte con el proceso de admisión al Instituto Winston Churchill.

Escríbenos por WhatsApp y con gusto te brindamos toda la información necesaria:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`;
}

function getMensaje72h(): string {
  return `¿AGENDAMOS UN RECORRIDO?

¡Nos encantaría que conociera nuestro Instituto Winston Churchill!

¿Le gustaría agendar un recorrido por nuestras instalaciones?

Envía un mensaje y te ayudamos a reservar tu visita:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`;
}

function getMensaje5d(): string {
  return `DESCUENTO ESPECIAL AL INICIAR TU PROCESO DE ADMISIÓN HOY

¡Aproveche nuestro descuento especial al iniciar su proceso de admisión hoy!

Escríbenos y da el primer paso para formar parte del Instituto Winston Churchill:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Enviando SMS de prueba de seguimientos...');
    
    const destinatarios = [
      { telefono: '8333246904', nombre: 'Mario Escobedo' },
      { telefono: '8331491483', nombre: 'Sistemas' },
      { telefono: '8331078297', nombre: 'Test User' }
    ];
    
    const results = [];
    
    for (const dest of destinatarios) {
      console.log(`\n📱 Enviando seguimientos SMS a ${dest.telefono}...`);
      
      const smsResults = {
        telefono: dest.telefono,
        nombre: dest.nombre,
        sms24h: false,
        sms72h: false,
        sms5d: false
      };
      
      // 1. SMS de 24 horas
      console.log(`📤 Enviando SMS 24h a ${dest.telefono}...`);
      const result24h = await sendSMS(dest.telefono, getMensaje24h());
      smsResults.sms24h = result24h.success;
      console.log(`${result24h.success ? '✅' : '❌'} SMS 24h: ${result24h.success ? 'Enviado' : 'Falló'}`);
      
      // Esperar 2 segundos entre SMS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. SMS de 72 horas
      console.log(`📤 Enviando SMS 72h a ${dest.telefono}...`);
      const result72h = await sendSMS(dest.telefono, getMensaje72h());
      smsResults.sms72h = result72h.success;
      console.log(`${result72h.success ? '✅' : '❌'} SMS 72h: ${result72h.success ? 'Enviado' : 'Falló'}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. SMS de 5 días
      console.log(`📤 Enviando SMS 5 días a ${dest.telefono}...`);
      const result5d = await sendSMS(dest.telefono, getMensaje5d());
      smsResults.sms5d = result5d.success;
      console.log(`${result5d.success ? '✅' : '❌'} SMS 5 días: ${result5d.success ? 'Enviado' : 'Falló'}`);
      
      results.push(smsResults);
      
      // Esperar 3 minutos antes del siguiente destinatario (excepto el último)
      const esUltimo = destinatarios.indexOf(dest) === destinatarios.length - 1;
      if (!esUltimo) {
        console.log(`⏳ Esperando 3 minutos antes del siguiente destinatario...`);
        await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutos = 180000ms
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'SMS de seguimiento enviados',
      enviados: results.length,
      detalles: results
    });
    
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al enviar SMS',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

