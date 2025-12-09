import { NextRequest, NextResponse } from 'next/server';

// Forzar ejecución dinámica (NO pre-renderizar en build)
export const dynamic = 'force-dynamic';

// Función especial para enviar SMS SIN agregar prefijo 52
async function sendSMSSinPrefijo(phone: string, message: string) {
  const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
  const SMS_GATEWAY_TOKEN = process.env.SMS_GATEWAY_TOKEN;

  if (!SMS_GATEWAY_URL || !SMS_GATEWAY_TOKEN) {
    console.error('❌ SMS Mobile API no configurado');
    return { success: false, error: 'SMS Mobile API no configurado' };
  }

  try {
    // Formatear número - Solo limpiar, NO agregar 52
    let formattedPhone = phone.toString().trim();
    
    // Remover espacios, guiones, paréntesis
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Remover el + si existe
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // NO agregar 52 - enviar tal cual

    console.log('📤 Enviando SMS via Mobile API a:', formattedPhone);

    // Construir URL con query parameters para SMS Mobile API (método GET)
    const smsUrl = `${SMS_GATEWAY_URL}?recipients=${encodeURIComponent(formattedPhone)}&message=${encodeURIComponent(message)}&apikey=${SMS_GATEWAY_TOKEN}`;
    
    console.log('🔗 URL construida:', smsUrl.replace(SMS_GATEWAY_TOKEN, '***TOKEN***'));

    // Enviar SMS usando SMS Mobile API (método GET)
    const smsResponse = await fetch(smsUrl, {
      method: 'GET',
    });

    const responseData = await smsResponse.json();

    console.log('📥 Respuesta de SMS Mobile API:', responseData);

    // SMS Mobile API devuelve { result: { error, sent, id } }
    if (responseData.result && responseData.result.error !== 0) {
      console.error('❌ Error de SMS Mobile API:', responseData);
      return { 
        success: false, 
        error: 'SMS Mobile API respondió con error',
        details: responseData 
      };
    }

    console.log('✅ SMS enviado exitosamente via Mobile API:', {
      to: formattedPhone,
      id: responseData.result?.id,
    });

    return { 
      success: true, 
      messageId: responseData.result?.id,
      to: formattedPhone 
    };
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Mensajes SMS de seguimiento (sin emojis para compatibilidad con gateway)
function getMensaje24h(): string {
  return `RECORDATORIO

Hola! Te recordamos que estamos disponibles para apoyarte con el proceso de admision al Instituto Winston Churchill.

Escribenos por WhatsApp y con gusto te brindamos toda la informacion necesaria:

Winston Churchill: https://wa.me/528334378743
Educativo Winston: https://wa.me/528333474507`;
}

function getMensaje72h(): string {
  return `AGENDAMOS UN RECORRIDO?

Nos encantaria que conociera nuestro Instituto Winston Churchill!

Le gustaria agendar un recorrido por nuestras instalaciones?

Envia un mensaje y te ayudamos a reservar tu visita:

Winston Churchill: https://wa.me/528334378743
Educativo Winston: https://wa.me/528333474507`;
}

function getMensaje5d(): string {
  return `DESCUENTO ESPECIAL AL INICIAR TU PROCESO DE ADMISION HOY

Aproveche nuestro descuento especial al iniciar su proceso de admision hoy!

Escribenos y da el primer paso para formar parte del Instituto Winston Churchill.

Winston Churchill: https://wa.me/528334378743
Educativo Winston: https://wa.me/528333474507`;
}

// GET y POST permitidos
export async function GET(request: NextRequest) {
  return POST(request);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [PRUEBA SMS] Iniciando envío de SMS de seguimiento...');
    
    const destinatarios = [
      { telefono: '8333246904', nombre: 'Mario Escobedo' },
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
      const result24h = await sendSMSSinPrefijo(dest.telefono, getMensaje24h());
      smsResults.sms24h = result24h.success || false;
      console.log(`${result24h.success ? '✅' : '❌'} [PRUEBA SMS] SMS 24h: ${result24h.success ? 'Enviado' : 'Falló'}`);
      
      // Esperar 2 segundos entre SMS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. SMS de 72 horas
      console.log(`📤 [PRUEBA SMS] Enviando SMS 72h a ${dest.telefono}...`);
      const result72h = await sendSMSSinPrefijo(dest.telefono, getMensaje72h());
      smsResults.sms72h = result72h.success || false;
      console.log(`${result72h.success ? '✅' : '❌'} [PRUEBA SMS] SMS 72h: ${result72h.success ? 'Enviado' : 'Falló'}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. SMS de 5 días
      console.log(`📤 [PRUEBA SMS] Enviando SMS 5 días a ${dest.telefono}...`);
      const result5d = await sendSMSSinPrefijo(dest.telefono, getMensaje5d());
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

