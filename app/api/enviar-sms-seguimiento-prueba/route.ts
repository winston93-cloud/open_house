import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';

// Forzar ejecución dinámica (NO pre-renderizar en build)
export const dynamic = 'force-dynamic';

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

// Solo POST - NO GET para evitar ejecución automática
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [PRUEBA SMS] Iniciando envío de SMS de seguimiento...');
    
    const destinatarios = [
      { telefono: '8333246904', nombre: 'Mario Escobedo' },
      { telefono: '8331491483', nombre: 'Sistemas' },
      { telefono: '8331078297', nombre: 'Test User' }
    ];
    
    const results = [];
    
    for (const dest of destinatarios) {
      console.log(`\n📱 [PRUEBA SMS] Enviando seguimientos a ${dest.telefono}...`);
      
      const smsResults = {
        telefono: dest.telefono,
        nombre: dest.nombre,
        sms24h: false,
        sms72h: false,
        sms5d: false
      };
      
      // 1. SMS de 24 horas
      console.log(`📤 [PRUEBA SMS] Enviando SMS 24h a ${dest.telefono}...`);
      const result24h = await sendSMS(dest.telefono, getMensaje24h());
      smsResults.sms24h = result24h.success || false;
      console.log(`${result24h.success ? '✅' : '❌'} [PRUEBA SMS] SMS 24h: ${result24h.success ? 'Enviado' : 'Falló'}`);
      
      // Esperar 2 segundos entre SMS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. SMS de 72 horas
      console.log(`📤 [PRUEBA SMS] Enviando SMS 72h a ${dest.telefono}...`);
      const result72h = await sendSMS(dest.telefono, getMensaje72h());
      smsResults.sms72h = result72h.success || false;
      console.log(`${result72h.success ? '✅' : '❌'} [PRUEBA SMS] SMS 72h: ${result72h.success ? 'Enviado' : 'Falló'}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. SMS de 5 días
      console.log(`📤 [PRUEBA SMS] Enviando SMS 5 días a ${dest.telefono}...`);
      const result5d = await sendSMS(dest.telefono, getMensaje5d());
      smsResults.sms5d = result5d.success || false;
      console.log(`${result5d.success ? '✅' : '❌'} [PRUEBA SMS] SMS 5 días: ${result5d.success ? 'Enviado' : 'Falló'}`);
      
      results.push(smsResults);
      
      // Esperar 3 minutos antes del siguiente destinatario (excepto el último)
      const esUltimo = destinatarios.indexOf(dest) === destinatarios.length - 1;
      if (!esUltimo) {
        console.log(`⏳ [PRUEBA SMS] Esperando 3 minutos antes del siguiente destinatario...`);
        await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutos = 180000ms
      }
    }
    
    console.log(`\n✅ [PRUEBA SMS] Proceso completado`);
    
    return NextResponse.json({
      success: true,
      message: 'SMS de seguimiento enviados',
      enviados: results.length,
      detalles: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [PRUEBA SMS] Error enviando SMS:', error);
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

