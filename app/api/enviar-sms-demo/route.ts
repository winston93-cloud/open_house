import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// ENDPOINT DEMO: Enviar los 3 SMS de seguimiento a números específicos
// =============================================================================

const TELEFONOS_DEMO = [
  '+528333246904',  // Mario
  '+525536590893',  // Jefe (iPhone)
  '+528331491483',  // Jefe (otro número)
  '+528334182855'   // 4to número
];

export async function GET(request: NextRequest) {
  console.log('\n🚀 ===== INICIO DE ENVÍO DEMO SMS =====');
  
  const resultados = {
    total_enviados: 0,
    total_errores: 0,
    detalles: [] as any[]
  };

  // Los 3 mensajes de seguimiento
  const mensajes = [
    {
      tipo: '24 horas',
      texto: `RECORDATORIO

¡Hola! Te recordamos que estamos disponibles para apoyarte con el proceso de admisión al Instituto Winston Churchill.

Escríbenos por WhatsApp y con gusto te brindamos toda la información necesaria:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`
    },
    {
      tipo: '72 horas',
      texto: `¿AGENDAMOS UN RECORRIDO?

¡Nos encantaría que conociera nuestro Instituto Winston Churchill!

¿Le gustaría agendar un recorrido por nuestras instalaciones?

Envía un mensaje y te ayudamos a reservar tu visita:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`
    },
    {
      tipo: '5 días',
      texto: `DESCUENTO ESPECIAL AL INICIAR TU PROCESO DE ADMISIÓN HOY

¡Aproveche nuestro descuento especial al iniciar su proceso de admisión hoy!

Escríbenos y da el primer paso para formar parte del Instituto Winston Churchill:

• Winston Churchill: https://wa.me/528334378743
• Educativo Winston: https://wa.me/528333474507`
    }
  ];

  // Enviar cada mensaje a cada teléfono
  for (const telefono of TELEFONOS_DEMO) {
    for (const mensaje of mensajes) {
      try {
        console.log(`\n📱 Enviando SMS "${mensaje.tipo}" a ${telefono}...`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: telefono, 
            message: mensaje.texto 
          })
        });

        if (response.ok) {
          console.log(`✅ SMS "${mensaje.tipo}" enviado exitosamente a ${telefono}`);
          resultados.total_enviados++;
          resultados.detalles.push({
            telefono,
            tipo: mensaje.tipo,
            status: 'exitoso',
            timestamp: new Date().toISOString()
          });
        } else {
          const errorText = await response.text();
          console.error(`❌ Error enviando SMS "${mensaje.tipo}" a ${telefono}: ${errorText}`);
          resultados.total_errores++;
          resultados.detalles.push({
            telefono,
            tipo: mensaje.tipo,
            status: 'error',
            error: errorText,
            timestamp: new Date().toISOString()
          });
        }

        // Esperar 2 segundos entre mensajes para no saturar
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error procesando SMS "${mensaje.tipo}" para ${telefono}:`, error);
        resultados.total_errores++;
        resultados.detalles.push({
          telefono,
          tipo: mensaje.tipo,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  console.log('\n🏁 ===== ENVÍO DEMO COMPLETADO =====');
  console.log(`📊 Total enviados: ${resultados.total_enviados}`);
  console.log(`❌ Total errores: ${resultados.total_errores}`);

  return NextResponse.json({
    success: true,
    mensaje: '¡SMS de demostración enviados!',
    ...resultados
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}

