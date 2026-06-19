import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../lib/insforge-admin';
import * as nodemailer from 'nodemailer';
import { getEmailTemplate24h, getEmailTemplate72h, getEmailTemplate5d } from '../../../lib/email-templates';

const db = getInsforgeAdmin().database;

// =============================================================================
// CRON JOB: SISTEMA DE SMS Y EMAILS AUTOMÁTICOS PARA LEADS DE KOMMO
// =============================================================================
// Horario: 12:50 PM hora de México (18:50 UTC)
// Envía SMS y Emails automatizados a leads según el tiempo sin actividad:
// - 24 horas: Primer recordatorio de contacto
// - 72 horas: Segundo recordatorio (invitación a recorrido)
// - 5 días: Tercer recordatorio (oferta especial/descuento)
// Última actualización: 25 noviembre 2025
// =============================================================================

// ⛔ DESACTIVACIÓN TEMPORAL - Cambiar a true para reactivar
const ENVIOS_ACTIVOS = false;

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Función principal que ejecuta el cron job
async function executeCronJob() {
  const startTime = new Date();
  const logId = `SMS_CRON_${startTime.getTime()}`;
  
  console.log(`\n🚀 [${logId}] ===== INICIO DE CRON JOB SMS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  console.log(`🌍 [${logId}] Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`⏰ [${logId}] Horario configurado: 12:50 PM México`);
  
  // ⛔ VERIFICAR SI LOS ENVÍOS ESTÁN ACTIVOS
  if (!ENVIOS_ACTIVOS) {
    console.log(`\n⛔ [${logId}] ENVÍOS DESACTIVADOS TEMPORALMENTE`);
    console.log(`🔧 [${logId}] Se están realizando correcciones en SMS y correos`);
    return NextResponse.json({
      success: true,
      message: 'Envíos desactivados temporalmente',
      logId,
      timestamp: new Date().toISOString(),
      envios_activos: false
    });
  }
  
  const results = {
    sms24h: { processed: 0, success: 0, errors: 0 },
    sms72h: { processed: 0, success: 0, errors: 0 },
    sms5d: { processed: 0, success: 0, errors: 0 }
  };
  
  try {
    // ========== SMS 24H ==========
    console.log(`\n📱 [${logId}] === REVISIÓN SMS 24H ===`);
    const result24h = await checkAndSendSMS24h(logId);
    results.sms24h = result24h;
    
    // ========== SMS 72H ==========
    console.log(`\n📱 [${logId}] === REVISIÓN SMS 72H ===`);
    const result72h = await checkAndSendSMS72h(logId);
    results.sms72h = result72h;
    
    // ========== SMS 5 DÍAS ==========
    console.log(`\n📱 [${logId}] === REVISIÓN SMS 5 DÍAS ===`);
    const result5d = await checkAndSendSMS5d(logId);
    results.sms5d = result5d;
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n🏁 [${logId}] ===== CRON JOB COMPLETADO =====`);
    console.log(`⏱️ [${logId}] Duración: ${duration}ms`);
    console.log(`📊 [${logId}] Resultados:`);
    console.log(`   - SMS 24h: ${results.sms24h.success}/${results.sms24h.processed} exitosos`);
    console.log(`   - SMS 72h: ${results.sms72h.success}/${results.sms72h.processed} exitosos`);
    console.log(`   - SMS 5 días: ${results.sms5d.success}/${results.sms5d.processed} exitosos`);
    
    return NextResponse.json({
      success: true,
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error(`\n💥 [${logId}] ===== ERROR EN CRON JOB =====`);
    console.error(`❌ [${logId}] Error:`, error);
    
    return NextResponse.json({
      success: false,
      logId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      results
    }, { status: 500 });
  }
}

// Endpoint GET (para navegador)
export async function GET(request: NextRequest) {
  return executeCronJob();
}

// Endpoint POST (para Vercel Cron)
export async function POST(request: NextRequest) {
  return executeCronJob();
}

// =============================================================================
// FUNCIÓN: Revisar y enviar SMS a leads con >24h sin comunicación
// =============================================================================
async function checkAndSendSMS24h(logId: string) {
  const result = { processed: 0, success: 0, errors: 0 };
  
  try {
    // Usar UTC para evitar problemas de timezone
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    
    console.log(`📅 [${logId}] Buscando leads con >24h y <48h sin actividad...`);
    console.log(`📅 [${logId}] Rango: ${fortyEightHoursAgo.toISOString()} a ${twentyFourHoursAgo.toISOString()}`);
    
    const { data: pendingLeads, error } = await db
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', twentyFourHoursAgo.toISOString())
      .gte('last_contact_time', fortyEightHoursAgo.toISOString())
      .eq('sms_24h_sent', false)
      .eq('lead_status', 'active');
    
    if (error) {
      console.error(`❌ [${logId}] Error consultando leads 24h:`, error);
      return result;
    }
    
    if (!pendingLeads || pendingLeads.length === 0) {
      console.log(`✅ [${logId}] No hay leads pendientes de SMS 24h`);
      return result;
    }
    
    console.log(`📱 [${logId}] Encontrados ${pendingLeads.length} leads para SMS 24h`);
    result.processed = pendingLeads.length;
    
    for (const lead of pendingLeads) {
      try {
        console.log(`\n📋 [${logId}] Procesando: ${lead.nombre} (${lead.kommo_lead_id})`);
        
        if (!lead.telefono || lead.telefono.trim() === '') {
          console.log(`   ⚠️ Sin teléfono, omitiendo...`);
          continue;
        }
        
        // Enviar SMS
        const smsSuccess = await sendSMS(lead.telefono, getMensaje24h(), logId);
        
        // Enviar Email
        const emailSuccess = await sendEmail(
          lead.email,
          lead.nombre,
          getEmailTemplate24h(lead.nombre, lead.plantel),
          '👋 Admisiones Winston - Estamos aquí para ayudarte',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          // Actualizar BD
          await db
            .from('kommo_lead_tracking')
            .update({
              sms_24h_sent: true,
              sms_24h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 24h enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
          
          // Esperar 3 minutos antes del siguiente envío para evitar bloqueos de operador
          const currentIndex = pendingLeads.indexOf(lead);
          if (currentIndex < pendingLeads.length - 1) {
            console.log(`   ⏳ Esperando 3 minutos antes del siguiente envío...`);
            await new Promise(resolve => setTimeout(resolve, 180000));
          }
        } else {
          result.errors++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando lead:`, error);
        result.errors++;
      }
    }
    
    console.log(`✅ [${logId}] SMS 24h completado: ${result.success}/${result.processed}`);
    return result;
    
  } catch (error) {
    console.error(`❌ [${logId}] Error en checkAndSendSMS24h:`, error);
    return result;
  }
}

// =============================================================================
// FUNCIÓN: Revisar y enviar SMS a leads con >72h sin comunicación
// =============================================================================
async function checkAndSendSMS72h(logId: string) {
  const result = { processed: 0, success: 0, errors: 0 };
  
  try {
    // Usar UTC para evitar problemas de timezone
    const now = new Date();
    const seventyTwoHoursAgo = new Date(now.getTime() - (72 * 60 * 60 * 1000));
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
    
    console.log(`📅 [${logId}] Buscando leads con >72h y <5 días sin actividad...`);
    console.log(`📅 [${logId}] Rango: ${fiveDaysAgo.toISOString()} a ${seventyTwoHoursAgo.toISOString()}`);
    
    const { data: pendingLeads, error } = await db
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', seventyTwoHoursAgo.toISOString())
      .gte('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_24h_sent', true)  // Ya debe tener el SMS de 24h enviado
      .eq('sms_48h_sent', false)
      .eq('lead_status', 'active');
    
    if (error) {
      console.error(`❌ [${logId}] Error consultando leads 72h:`, error);
      return result;
    }
    
    if (!pendingLeads || pendingLeads.length === 0) {
      console.log(`✅ [${logId}] No hay leads pendientes de SMS 72h`);
      return result;
    }
    
    console.log(`📱 [${logId}] Encontrados ${pendingLeads.length} leads para SMS 72h`);
    result.processed = pendingLeads.length;
    
    for (const lead of pendingLeads) {
      try {
        console.log(`\n📋 [${logId}] Procesando: ${lead.nombre} (${lead.kommo_lead_id})`);
        
        if (!lead.telefono || lead.telefono.trim() === '') {
          console.log(`   ⚠️ Sin teléfono, omitiendo...`);
          continue;
        }
        
        const smsSuccess = await sendSMS(lead.telefono, getMensaje72h(), logId);
        
        // Enviar Email
        const emailSuccess = await sendEmail(
          lead.email,
          lead.nombre,
          getEmailTemplate72h(lead.nombre, lead.plantel),
          '📅 Agenda tu recorrido - Winston Churchill',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          await db
            .from('kommo_lead_tracking')
            .update({
              sms_48h_sent: true,
              sms_48h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 72h enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
          
          // Esperar 3 minutos antes del siguiente envío para evitar bloqueos de operador
          const currentIndex = pendingLeads.indexOf(lead);
          if (currentIndex < pendingLeads.length - 1) {
            console.log(`   ⏳ Esperando 3 minutos antes del siguiente envío...`);
            await new Promise(resolve => setTimeout(resolve, 180000));
          }
        } else {
          result.errors++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando lead:`, error);
        result.errors++;
      }
    }
    
    console.log(`✅ [${logId}] SMS 72h completado: ${result.success}/${result.processed}`);
    return result;
    
  } catch (error) {
    console.error(`❌ [${logId}] Error en checkAndSendSMS72h:`, error);
    return result;
  }
}

// =============================================================================
// FUNCIÓN: Revisar y enviar SMS a leads con >5 días sin comunicación
// =============================================================================
async function checkAndSendSMS5d(logId: string) {
  const result = { processed: 0, success: 0, errors: 0 };
  
  try {
    // Usar UTC para evitar problemas de timezone
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
    
    console.log(`📅 [${logId}] Buscando leads con >5 días sin actividad...`);
    
    const { data: pendingLeads, error } = await db
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_48h_sent', true)  // Ya debe tener el SMS de 72h enviado
      .eq('sms_72h_sent', false)  // Campo reutilizado para 5 días
      .eq('lead_status', 'active');
    
    if (error) {
      console.error(`❌ [${logId}] Error consultando leads 5 días:`, error);
      return result;
    }
    
    if (!pendingLeads || pendingLeads.length === 0) {
      console.log(`✅ [${logId}] No hay leads pendientes de SMS 5 días`);
      return result;
    }
    
    console.log(`📱 [${logId}] Encontrados ${pendingLeads.length} leads para SMS 5 días`);
    result.processed = pendingLeads.length;
    
    for (const lead of pendingLeads) {
      try {
        console.log(`\n📋 [${logId}] Procesando: ${lead.nombre} (${lead.kommo_lead_id})`);
        
        if (!lead.telefono || lead.telefono.trim() === '') {
          console.log(`   ⚠️ Sin teléfono, omitiendo...`);
          continue;
        }
        
        const smsSuccess = await sendSMS(lead.telefono, getMensaje5d(), logId);
        
        // Enviar Email
        const emailSuccess = await sendEmail(
          lead.email,
          lead.nombre,
          getEmailTemplate5d(lead.nombre, lead.plantel),
          '🎁 ¡Última oportunidad! Promoción especial - Winston',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          await db
            .from('kommo_lead_tracking')
            .update({
              sms_72h_sent: true,  // Campo reutilizado para 5 días
              sms_72h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 5 días enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
          
          // Esperar 3 minutos antes del siguiente envío para evitar bloqueos de operador
          const currentIndex = pendingLeads.indexOf(lead);
          if (currentIndex < pendingLeads.length - 1) {
            console.log(`   ⏳ Esperando 3 minutos antes del siguiente envío...`);
            await new Promise(resolve => setTimeout(resolve, 180000));
          }
        } else {
          result.errors++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando lead:`, error);
        result.errors++;
      }
    }
    
    console.log(`✅ [${logId}] SMS 5 días completado: ${result.success}/${result.processed}`);
    return result;
    
  } catch (error) {
    console.error(`❌ [${logId}] Error en checkAndSendSMS5d:`, error);
    return result;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

async function sendSMS(telefono: string, mensaje: string, logId: string): Promise<boolean> {
  try {
    // Formatear teléfono
    let phone = telefono.toString().trim();
    if (!phone.startsWith('+52') && !phone.startsWith('52')) {
      phone = '+52' + phone;
    } else if (phone.startsWith('52') && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    
    console.log(`   📤 Enviando SMS a ${phone}...`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message: mensaje })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Error SMS API: ${errorText}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error enviando SMS:`, error);
    return false;
  }
}

async function addTagToKommo(leadId: number, tagName: string, logId: string): Promise<boolean> {
  try {
    const { getKommoAccessToken } = await import('../../../lib/kommo');
    const accessToken = await getKommoAccessToken('open-house');
    
    const response = await fetch(
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _embedded: {
            tags: [{ name: tagName }]
          }
        })
      }
    );
    
    if (!response.ok) {
      console.error(`   ⚠️ Error agregando tag: ${response.status}`);
      return false;
    }
    
    console.log(`   🏷️ Tag "${tagName}" agregado`);
    return true;
    
  } catch (error) {
    console.error(`   ⚠️ Error con tag:`, error);
    return false;
  }
}

// =============================================================================
// TEMPLATES DE EMAIL - Importados desde lib/email-templates.ts
// =============================================================================
// Las funciones getEmailTemplate24h, getEmailTemplate72h, getEmailTemplate5d
// ahora están centralizadas en lib/email-templates.ts para reutilización


// =============================================================================
// FUNCIÓN: Enviar email
// =============================================================================

async function sendEmail(email: string, nombre: string, template: string, subject: string, logId: string): Promise<boolean> {
  try {
    if (!email || email.trim() === '') {
      console.log(`   ⚠️ Sin email, omitiendo...`);
      return false;
    }
    
    console.log(`   📧 Enviando email a ${email}...`);
    
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: email,
      subject: subject,
      html: template
    });
    
    console.log(`   ✅ Email enviado exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error enviando email:`, error);
    return false;
  }
}

// =============================================================================
// Mensajes SMS
// =============================================================================

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
