import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// =============================================================================
// WEBHOOK DE KOMMO - SISTEMA SMS 24H
// =============================================================================
//
// Este endpoint recibe webhooks de Kommo cuando hay cualquier actividad.
// Cada vez que se recibe un evento, revisamos TODOS los leads con >24h 
// sin comunicación y les enviamos SMS automáticamente.
//
// Es un sistema simple y efectivo: cualquier actividad en Kommo dispara
// la revisión de leads pendientes.
//
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook recibido de Kommo');

    // Paso 1: Intentar extraer lead_id del webhook para actualizar timestamp
    try {
      const text = await request.text();
      
      // 🛡️ PROTECCIÓN: Ignorar webhooks de tags SMS para evitar duplicados
      if (text.includes('SMS-24h-Enviado') || text.includes('SMS-48h-Enviado') || text.includes('SMS-72h-Enviado')) {
        console.log('⏭️ Webhook por tag SMS detectado, ignorando para evitar loop...');
        return NextResponse.json({ 
          success: true, 
          message: 'Webhook de tag SMS ignorado (prevención de duplicados)' 
        });
      }
      
      const leadId = extractLeadIdFromWebhook(text);
      
      if (leadId) {
        console.log(`📝 Actividad detectada en lead ${leadId}`);
        
        // Obtener hora actual en México (UTC-6)
        const ahoraMexico = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));
        
        // Actualizar last_contact_time y resetear todos los flags de SMS
        const { error } = await supabase
          .from('kommo_lead_tracking')
          .update({
            last_contact_time: ahoraMexico.toISOString(),
            updated_at: ahoraMexico.toISOString(),
            // Resetear flags de SMS (se reinicia el contador)
            sms_24h_sent: false,
            sms_24h_sent_at: null,
            sms_48h_sent: false,
            sms_48h_sent_at: null,
            sms_72h_sent: false,
            sms_72h_sent_at: null
          })
          .eq('kommo_lead_id', leadId);
        
        if (error) {
          console.error(`⚠️ Error actualizando timestamp para lead ${leadId}:`, error);
        } else {
          console.log(`✅ Timestamp actualizado para lead ${leadId} - contadores de SMS reseteados (24h, 48h, 72h)`);
        }
      }
    } catch (parseError) {
      // Si falla el parsing, continuar de todos modos
      console.log('⚠️ No se pudo parsear lead_id del webhook (continuando...)');
    }

    // Paso 2: Ejecutar revisión de leads con >24h sin comunicación
    console.log('🔍 Revisando leads con >24h sin comunicación...');
    await checkAndSendSMS24h();

    // Responder OK a Kommo
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado - timestamp actualizado y revisión 24h ejecutada' 
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de Kommo:', error);
    
    // Responder 200 para evitar que Kommo reintente
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 200 });
  }
}

// =============================================================================
// FUNCIÓN PRINCIPAL: Revisar y enviar SMS a leads con >24h sin comunicación
// =============================================================================

async function checkAndSendSMS24h() {
  try {
    console.log('⏰ Iniciando revisión de leads con >24h sin comunicación...');
    
    // Calcular timestamp de hace 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log(`📅 Buscando leads con last_contact_time < ${twentyFourHoursAgo.toISOString()}`);
    
    // Buscar leads que:
    // 1. Tienen >24h sin comunicación
    // 2. No se les ha enviado SMS todavía
    // 3. Están activos (no cerrados)
    const { data: pendingLeads, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', twentyFourHoursAgo.toISOString())
      .eq('sms_24h_sent', false)
      .eq('lead_status', 'active');
    
    if (error) {
      console.error('❌ Error consultando leads pendientes:', error);
      return;
    }
    
    if (!pendingLeads || pendingLeads.length === 0) {
      console.log('✅ No hay leads pendientes de SMS (todos están al día)');
      return;
    }
    
    console.log(`📱 Encontrados ${pendingLeads.length} leads pendientes de SMS`);
    
    // Procesar cada lead
    for (const lead of pendingLeads) {
      try {
        console.log(`\n📋 Procesando lead: ${lead.nombre} (ID: ${lead.kommo_lead_id})`);
        console.log(`   📞 Teléfono: ${lead.telefono}`);
        console.log(`   🏢 Plantel: ${lead.plantel}`);
        console.log(`   ⏱️ Último contacto: ${lead.last_contact_time}`);
        
        // Validar que tenga teléfono
        if (!lead.telefono || lead.telefono.trim() === '') {
          console.log(`   ⚠️ Lead sin teléfono, omitiendo...`);
          continue;
        }
        
        // Enviar SMS
        const smsResult = await sendSMS24hNotification(lead);
        
        if (smsResult.success) {
          console.log(`   ✅ SMS enviado exitosamente`);
          
          // Marcar como enviado en nuestra BD
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_24h_sent: true,
              sms_24h_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          // Añadir tag en Kommo para identificar visualmente
          await addTagToKommoLead(lead.kommo_lead_id, 'SMS-24h-Enviado');
          
          // Marcar que el tag fue añadido
          await supabase
            .from('kommo_lead_tracking')
            .update({
              sms_24h_tag_added: true,
              updated_at: new Date().toISOString()
            })
            .eq('kommo_lead_id', lead.kommo_lead_id);
          
          console.log(`   🏷️ Tag "SMS-24h-Enviado" añadido en Kommo`);
        } else {
          console.error(`   ❌ Error enviando SMS:`, smsResult.error);
        }
        
      } catch (error) {
        console.error(`   ❌ Error procesando lead ${lead.kommo_lead_id}:`, error);
        // Continuar con el siguiente lead aunque uno falle
      }
    }
    
    console.log(`\n✅ Revisión completada. Procesados ${pendingLeads.length} leads.`);
    
  } catch (error) {
    console.error('❌ Error en checkAndSendSMS24h:', error);
  }
}

// =============================================================================
// HELPERS
// =============================================================================

// Enviar SMS de notificación 24h
async function sendSMS24hNotification(lead: any): Promise<{ success: boolean; error?: any }> {
  try {
    const mensaje = `Hola! Queremos asegurarnos de que todo vaya bien con el proceso de tu hijo. Si tienes alguna duda o comentario, por favor mandanos un mensaje por WhatsApp y con gusto te ayudamos.`;
    
    // Asegurar que el teléfono tenga el código de país +52
    let telefono = lead.telefono.toString().trim();
    if (!telefono.startsWith('+52') && !telefono.startsWith('52')) {
      telefono = '+52' + telefono;
    } else if (telefono.startsWith('52') && !telefono.startsWith('+')) {
      telefono = '+' + telefono;
    }
    
    console.log(`   📤 Enviando SMS a ${telefono} (original: ${lead.telefono})...`);
    
    // Llamar al endpoint de envío de SMS
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: telefono,
        message: mensaje
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }
    
    const result = await response.json();
    return { success: true };
    
  } catch (error) {
    return { success: false, error };
  }
}

// Añadir tag a lead en Kommo
async function addTagToKommoLead(leadId: number, tagName: string) {
  try {
    const { getKommoAccessToken } = await import('../../../../lib/kommo');
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
      console.error(`❌ Error añadiendo tag a lead ${leadId}:`, response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error en addTagToKommoLead:`, error);
    return false;
  }
}

// Extraer lead_id del webhook de Kommo
function extractLeadIdFromWebhook(webhookBody: string): number | null {
  try {
    // Kommo envía webhooks en formato form-urlencoded con parámetros como:
    // leads[add][0][id]=123456
    // leads[update][0][id]=123456
    // leads[status][0][id]=123456
    
    const params = new URLSearchParams(webhookBody);
    
    // Buscar patrones comunes de lead_id en webhooks de Kommo
    const patterns = [
      /leads\[add\]\[0\]\[id\]/,
      /leads\[update\]\[0\]\[id\]/,
      /leads\[status\]\[0\]\[id\]/,
      /leads\[delete\]\[0\]\[id\]/
    ];
    
    for (const pattern of patterns) {
      let foundLeadId: number | null = null;
      
      params.forEach((value, key) => {
        if (foundLeadId === null && pattern.test(key)) {
          const leadId = parseInt(value);
          if (!isNaN(leadId)) {
            foundLeadId = leadId;
          }
        }
      });
      
      if (foundLeadId !== null) {
        return foundLeadId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parseando webhook:', error);
    return null;
  }
}
