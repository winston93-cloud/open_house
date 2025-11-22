import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import * as nodemailer from 'nodemailer';

// =============================================================================
// CRON JOB: SISTEMA DE SMS Y EMAILS AUTOMÁTICOS PARA LEADS DE KOMMO
// =============================================================================
// Horario: 12:50 PM hora de México (18:50 UTC)
// Envía SMS y Emails automatizados a leads según el tiempo sin actividad:
// - 24 horas: Primer recordatorio de contacto
// - 48 horas: Segundo recordatorio (invitación a recorrido)
// - 5 días: Tercer recordatorio (oferta especial)
// Última actualización: 22 noviembre 2025
// =============================================================================

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
  
  const results = {
    sms24h: { processed: 0, success: 0, errors: 0 },
    sms48h: { processed: 0, success: 0, errors: 0 },
    sms5d: { processed: 0, success: 0, errors: 0 }
  };
  
  try {
    // ========== SMS 24H ==========
    console.log(`\n📱 [${logId}] === REVISIÓN SMS 24H ===`);
    const result24h = await checkAndSendSMS24h(logId);
    results.sms24h = result24h;
    
    // ========== SMS 48H ==========
    console.log(`\n📱 [${logId}] === REVISIÓN SMS 48H ===`);
    const result48h = await checkAndSendSMS48h(logId);
    results.sms48h = result48h;
    
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
    console.log(`   - SMS 48h: ${results.sms48h.success}/${results.sms48h.processed} exitosos`);
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
    
    const { data: pendingLeads, error } = await supabase
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
          getEmailTemplate24h(lead.nombre),
          '👋 Admisiones Winston - Estamos aquí para ayudarte',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          // Actualizar BD
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_24h_sent: true,
              sms_24h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 24h enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
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
// FUNCIÓN: Revisar y enviar SMS a leads con >48h sin comunicación
// =============================================================================
async function checkAndSendSMS48h(logId: string) {
  const result = { processed: 0, success: 0, errors: 0 };
  
  try {
    // Usar UTC para evitar problemas de timezone
    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));
    
    console.log(`📅 [${logId}] Buscando leads con >48h y <5 días sin actividad...`);
    console.log(`📅 [${logId}] Rango: ${fiveDaysAgo.toISOString()} a ${fortyEightHoursAgo.toISOString()}`);
    
    const { data: pendingLeads, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', fortyEightHoursAgo.toISOString())
      .gte('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_24h_sent', true)  // Ya debe tener el SMS de 24h enviado
      .eq('sms_48h_sent', false)
      .eq('lead_status', 'active');
    
    if (error) {
      console.error(`❌ [${logId}] Error consultando leads 48h:`, error);
      return result;
    }
    
    if (!pendingLeads || pendingLeads.length === 0) {
      console.log(`✅ [${logId}] No hay leads pendientes de SMS 48h`);
      return result;
    }
    
    console.log(`📱 [${logId}] Encontrados ${pendingLeads.length} leads para SMS 48h`);
    result.processed = pendingLeads.length;
    
    for (const lead of pendingLeads) {
      try {
        console.log(`\n📋 [${logId}] Procesando: ${lead.nombre} (${lead.kommo_lead_id})`);
        
        if (!lead.telefono || lead.telefono.trim() === '') {
          console.log(`   ⚠️ Sin teléfono, omitiendo...`);
          continue;
        }
        
        const smsSuccess = await sendSMS(lead.telefono, getMensaje48h(), logId);
        
        // Enviar Email
        const emailSuccess = await sendEmail(
          lead.email,
          lead.nombre,
          getEmailTemplate48h(lead.nombre),
          '📅 Agenda tu recorrido - Winston Churchill',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_48h_sent: true,
              sms_48h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 48h enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
        } else {
          result.errors++;
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando lead:`, error);
        result.errors++;
      }
    }
    
    console.log(`✅ [${logId}] SMS 48h completado: ${result.success}/${result.processed}`);
    return result;
    
  } catch (error) {
    console.error(`❌ [${logId}] Error en checkAndSendSMS48h:`, error);
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
    
    const { data: pendingLeads, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_48h_sent', true)  // Ya debe tener el SMS de 48h enviado
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
          getEmailTemplate5d(lead.nombre),
          '🎁 ¡Última oportunidad! Promoción especial - Winston',
          logId
        );
        
        if (smsSuccess || emailSuccess) {
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_72h_sent: true,  // Campo reutilizado para 5 días
              sms_72h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ Notificación 5 días enviada (SMS: ${smsSuccess ? '✓' : '✗'}, Email: ${emailSuccess ? '✓' : '✗'})`);
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
// TEMPLATES DE EMAIL
// =============================================================================

function getEmailTemplate24h(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admisiones Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">👋 ¡Hola ${nombre}!</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Somos admisiones Winston</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                    Notamos que te interesa nuestro instituto educativo. ¿Tienes alguna duda sobre el proceso de admisión?
                  </p>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                    Estamos aquí para ayudarte con información sobre:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 15px; background-color: #f8f9ff; border-radius: 8px; margin-bottom: 10px;">
                        <p style="margin: 0; color: #667eea; font-weight: 600;">✅ Proceso de inscripción</p>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
                        <p style="margin: 0; color: #667eea; font-weight: 600;">✅ Requisitos académicos</p>
                      </td>
                    </tr>
                    <tr><td style="height: 10px;"></td></tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f8f9ff; border-radius: 8px;">
                        <p style="margin: 0; color: #667eea; font-weight: 600;">✅ Costos y becas disponibles</p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; text-align: center;">
                    <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">📱 Contáctanos por WhatsApp</p>
                    <p style="color: rgba(255,255,255,0.9); margin: 0 0 5px 0; font-size: 15px;">
                      <strong>Winston Churchill:</strong> 833 437 8743
                    </p>
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">
                      <strong>Educativo Winston:</strong> 833 347 4507
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9ff; padding: 30px; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Instituto Winston Churchill | Admisiones
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                    🏫 Formando líderes del mañana
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getEmailTemplate48h(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agenda tu recorrido - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">😊 ${nombre}</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">¿Te gustaría conocer nuestro campus?</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                    ¡Nos encantaría mostrarte nuestras instalaciones! 🏫
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                    <p style="color: #8b4513; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; text-align: center;">
                      📅 Agenda tu recorrido personalizado
                    </p>
                    <p style="color: #8b4513; font-size: 15px; margin: 0; text-align: center; line-height: 1.6;">
                      Conoce nuestras aulas, laboratorios, áreas deportivas y todo lo que Winston tiene para ofrecer a tu familia
                    </p>
                  </div>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                    Durante el recorrido podrás:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c; margin-bottom: 10px;">
                        <p style="margin: 0; color: #333; font-size: 15px;">🎯 Conocer nuestro modelo educativo</p>
                      </td>
                    </tr>
                    <tr><td style="height: 8px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c;">
                        <p style="margin: 0; color: #333; font-size: 15px;">👥 Hablar con nuestro equipo académico</p>
                      </td>
                    </tr>
                    <tr><td style="height: 8px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c;">
                        <p style="margin: 0; color: #333; font-size: 15px;">💡 Resolver todas tus dudas</p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; text-align: center;">
                    <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">📱 Agenda ahora por WhatsApp</p>
                    <p style="color: rgba(255,255,255,0.95); margin: 0 0 5px 0; font-size: 15px;">
                      <strong>Winston Churchill:</strong> 833 437 8743
                    </p>
                    <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 15px;">
                      <strong>Educativo Winston:</strong> 833 347 4507
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fff5f5; padding: 30px; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Instituto Winston Churchill | Admisiones
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                    📅 Tu futuro comienza aquí
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getEmailTemplate5d(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Promoción especial - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #8b4513; margin: 0; font-size: 32px; font-weight: 700;">⏰ ${nombre}</h1>
                  <p style="color: #8b4513; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">¡Última oportunidad!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="background: linear-gradient(135deg, #fff5ba 0%, #ffeaa7 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; border: 3px dashed #fdcb6e;">
                    <p style="color: #d63031; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">
                      🎁 PROMOCIÓN ESPECIAL
                    </p>
                    <p style="color: #8b4513; font-size: 16px; margin: 0; font-weight: 600;">
                      Esta semana únicamente
                    </p>
                  </div>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                    Hola ${nombre}, no queremos que pierdas esta oportunidad especial que tenemos preparada para ti y tu familia.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; text-align: center;">
                        <p style="color: #8b4513; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                          Beneficios exclusivos al inscribirte esta semana:
                        </p>
                        <p style="color: #8b4513; font-size: 15px; margin: 0; line-height: 1.8;">
                          ✨ Descuento especial en inscripción<br>
                          ✨ Asesoría personalizada sin costo<br>
                          ✨ Kit de bienvenida para tu hijo/a
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #d63031; font-size: 16px; font-weight: 600; text-align: center; margin: 0 0 25px 0;">
                    ⏰ ¡No dejes pasar esta oportunidad!
                  </p>
                  
                  <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; text-align: center;">
                    <p style="color: #8b4513; font-size: 18px; font-weight: 700; margin: 0 0 15px 0;">📱 Contacta ahora por WhatsApp</p>
                    <p style="color: #8b4513; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">
                      Winston Churchill: 833 437 8743
                    </p>
                    <p style="color: #8b4513; margin: 0; font-size: 15px; font-weight: 600;">
                      Educativo Winston: 833 347 4507
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fff5f5; padding: 30px; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Instituto Winston Churchill | Admisiones
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                    🎁 Educación de excelencia al alcance de tu familia
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

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
// Mensajes SMS (acortados para 1 segmento y reducir costos)
// =============================================================================

function getMensaje24h(): string {
  return `👋 Hola! Somos admisiones Winston. ¿Tienes dudas? WhatsApp: Churchill 833 437 8743 | Educativo 833 347 4507 🏫`;
}

function getMensaje48h(): string {
  return `😊 Hola! ¿Te gustaría agendar un recorrido? WhatsApp: Churchill 833 437 8743 | Educativo 833 347 4507 📅`;
}

function getMensaje5d(): string {
  return `⏰ Última oportunidad! Promoción especial esta semana. WhatsApp: Winston Churchill 833 437 8743 | Educativo 833 347 4507 🎁`;
}
