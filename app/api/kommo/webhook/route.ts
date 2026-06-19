import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../../lib/insforge-admin';

// =============================================================================
// WEBHOOK DE KOMMO - REGISTRO Y ACTUALIZACIÓN DE LEADS
// =============================================================================
//
// Este endpoint recibe webhooks de Kommo cuando hay cualquier actividad.
// Su función es SOLO:
// 1. Registrar nuevos leads en la tabla kommo_lead_tracking
// 2. Actualizar last_contact_time cuando hay actividad
// 3. Resetear contadores de SMS cuando hay actividad
//
// EL ENVÍO DE SMS se hace ÚNICAMENTE desde el cron job /api/sms-cron
// a las 8:00 AM cada día.
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
      
      const webhookData = parseWebhookData(text);
      
      const db = getInsforgeAdmin().database;

      if (webhookData.leadId) {
        console.log(`📝 Actividad detectada en lead ${webhookData.leadId}`);
        console.log(`🔖 Tipo de evento: ${webhookData.eventType}`);
        
        // Obtener hora actual en México (UTC-6)
        const ahoraMexico = new Date(new Date().getTime() - (6 * 60 * 60 * 1000));
        
        // Si es un lead NUEVO (evento 'add'), intentar crearlo en tracking
        if (webhookData.eventType === 'add') {
          console.log(`🆕 Lead nuevo detectado, verificando si existe en tracking...`);
          
          // Verificar si ya existe en tracking
          const { data: existingLead } = await db
            .from('kommo_lead_tracking')
            .select('kommo_lead_id')
            .eq('kommo_lead_id', webhookData.leadId)
            .single();
          
          if (!existingLead) {
            console.log(`➕ Lead no existe en tracking, creando registro...`);
            
            // Obtener datos del lead desde Kommo API
            const leadData = await fetchLeadDataFromKommo(webhookData.leadId);
            
            if (leadData) {
              // Insertar en tracking
              const { error: insertError } = await db
                .from('kommo_lead_tracking')
                .insert([{
                  kommo_lead_id: leadData.leadId,
                  kommo_contact_id: leadData.contactId,
                  nombre: leadData.nombre,
                  telefono: leadData.telefono,
                  email: leadData.email,
                  plantel: 'winston',
                  last_contact_time: ahoraMexico.toISOString(),
                  pipeline_id: leadData.pipelineId,
                  status_id: leadData.statusId,
                  responsible_user_id: leadData.responsibleUserId,
                  lead_status: 'active',
                }]);
              
              if (insertError) {
                console.error(`❌ Error creando lead en tracking:`, insertError);
              } else {
                console.log(`✅ Lead ${webhookData.leadId} registrado en tracking - recibirá los 3 SMS automáticamente`);
              }
            } else {
              console.log(`⚠️ No se pudieron obtener datos del lead desde Kommo`);
            }
          } else {
            console.log(`ℹ️ Lead ya existe en tracking`);
          }
        }
        
        // Actualizar last_contact_time y resetear todos los flags de SMS (para leads existentes)
        const { error } = await db
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
          .eq('kommo_lead_id', webhookData.leadId);
        
        if (error) {
          console.error(`⚠️ Error actualizando timestamp para lead ${webhookData.leadId}:`, error);
        } else {
          console.log(`✅ Timestamp actualizado para lead ${webhookData.leadId} - contadores de SMS reseteados (24h, 48h, 72h)`);
        }
      }
    } catch (parseError) {
      // Si falla el parsing, continuar de todos modos
      console.log('⚠️ No se pudo parsear lead_id del webhook (continuando...)');
    }

    // Responder OK a Kommo
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado - timestamp actualizado' 
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
// HELPERS
// =============================================================================

// Parsear webhook y detectar tipo de evento
function parseWebhookData(webhookBody: string): { leadId: number | null; eventType: string | null } {
  try {
    const params = new URLSearchParams(webhookBody);
    
    // Detectar tipo de evento y extraer lead_id
    const eventPatterns = [
      { pattern: /leads\[add\]\[0\]\[id\]/, type: 'add' },
      { pattern: /leads\[update\]\[0\]\[id\]/, type: 'update' },
      { pattern: /leads\[status\]\[0\]\[id\]/, type: 'status' },
      { pattern: /leads\[delete\]\[0\]\[id\]/, type: 'delete' }
    ];
    
    for (const { pattern, type } of eventPatterns) {
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
        return { leadId: foundLeadId, eventType: type };
      }
    }
    
    return { leadId: null, eventType: null };
  } catch (error) {
    console.error('Error parseando webhook:', error);
    return { leadId: null, eventType: null };
  }
}

// Obtener datos del lead desde Kommo API
async function fetchLeadDataFromKommo(leadId: number): Promise<any | null> {
  try {
    console.log(`🔍 Obteniendo datos del lead ${leadId} desde Kommo...`);
    
    const { getKommoAccessToken } = await import('../../../../lib/kommo');
    const accessToken = await getKommoAccessToken('open-house');
    
    // Obtener lead con contactos embebidos
    const response = await fetch(
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}?with=contacts`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      console.error(`❌ Error obteniendo lead ${leadId} desde Kommo:`, response.status);
      return null;
    }
    
    const leadData = await response.json();
    console.log(`📥 Datos del lead obtenidos:`, JSON.stringify(leadData, null, 2));
    
    // Extraer contacto principal
    let contactId = null;
    let telefono = '';
    let email = '';
    let nombre = leadData.name || 'Sin nombre';
    
    if (leadData._embedded && leadData._embedded.contacts && leadData._embedded.contacts.length > 0) {
      const contact = leadData._embedded.contacts[0];
      contactId = contact.id;
      
      // Obtener teléfono y email del contacto
      if (contact.custom_fields_values) {
        for (const field of contact.custom_fields_values) {
          if (field.field_id === 557098 && field.values && field.values.length > 0) {
            // Campo teléfono
            telefono = field.values[0].value || '';
          }
          if (field.field_id === 557100 && field.values && field.values.length > 0) {
            // Campo email
            email = field.values[0].value || '';
          }
        }
      }
    }
    
    return {
      leadId: leadData.id,
      contactId,
      nombre,
      telefono,
      email,
      pipelineId: leadData.pipeline_id,
      statusId: leadData.status_id,
      responsibleUserId: leadData.responsible_user_id
    };
  } catch (error) {
    console.error(`❌ Error en fetchLeadDataFromKommo:`, error);
    return null;
  }
}
