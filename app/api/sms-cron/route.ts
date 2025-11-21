import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// =============================================================================
// CRON JOB: SISTEMA DE SMS AUTOMÁTICOS PARA LEADS DE KOMMO
// =============================================================================
// Horario: 10:00 AM hora de México (16:00 UTC)
// Envía SMS automatizados a leads según el tiempo sin actividad:
// - 24 horas: Primer recordatorio de contacto
// - 48 horas: Segundo recordatorio (invitación a recorrido)
// - 5 días: Tercer recordatorio (oferta especial)
// Última actualización: 21 noviembre 2025
// =============================================================================

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
        
        if (smsSuccess) {
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
          console.log(`   ✅ SMS 24h enviado exitosamente (sin tag)`);
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
        
        if (smsSuccess) {
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_48h_sent: true,
              sms_48h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ SMS 48h enviado exitosamente (sin tag)`);
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
        
        if (smsSuccess) {
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_72h_sent: true,  // Campo reutilizado para 5 días
              sms_72h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          result.success++;
          console.log(`   ✅ SMS 5 días enviado exitosamente (sin tag)`);
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

// Mensajes SMS (acortados para 1 segmento y reducir costos)
function getMensaje24h(): string {
  return `👋 Hola! Somos admisiones Winston. ¿Tienes dudas? WhatsApp: Churchill 833 437 8743 | Educativo 833 347 4507 🏫`;
}

function getMensaje48h(): string {
  return `😊 Hola! ¿Te gustaría agendar un recorrido? WhatsApp: Churchill 833 437 8743 | Educativo 833 347 4507 📅`;
}

function getMensaje5d(): string {
  return `⏰ Última oportunidad! Promoción especial esta semana. WhatsApp: Winston Churchill 833 437 8743 | Educativo 833 347 4507 🎁`;
}
