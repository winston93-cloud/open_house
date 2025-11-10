import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// Endpoint para recibir webhooks de Kommo
// Kommo enviará notificaciones cuando:
// - Se crea un lead nuevo (CUALQUIER FUENTE: formulario, Facebook, Instagram, WhatsApp, etc.)
// - Se actualiza un lead
// - Se añade una nota
// - Se envía/recibe un mensaje
//
// 🎯 IMPORTANTE: Este webhook captura leads de TODAS las fuentes, no solo de nuestra app.
// Si un lead viene de Facebook/Instagram/WhatsApp y no está en tracking, se registra automáticamente.

export async function POST(request: NextRequest) {
  try {
    // Kommo puede enviar datos como JSON o como form-urlencoded
    const contentType = request.headers.get('content-type') || '';
    let body: any;

    if (contentType.includes('application/json')) {
      // Formato JSON
      body = await request.json();
    } else {
      // Formato form-urlencoded (más común en Kommo)
      const text = await request.text();
      const params = new URLSearchParams(text);
      
      // Convertir URLSearchParams a objeto JSON
      body = {};
      params.forEach((value, key) => {
        // Kommo envía arrays como "leads[add][0][id]"
        // Intentar parsear cada valor como JSON por si es un objeto/array
        try {
          body[key] = JSON.parse(value);
        } catch {
          body[key] = value;
        }
      });
    }
    
    console.log('🔔 Webhook recibido de Kommo:', JSON.stringify(body, null, 2));

    // 🎯 IMPORTANTE: Revisar leads >24h ANTES de procesar eventos
    // Así evitamos que el procesamiento de eventos actualice timestamps
    // y resetee el contador de 24h antes de enviar SMS
    console.log('🔍 Revisando leads con >24h sin comunicación (ANTES de procesar eventos)...');
    await checkAndSendSMS24h();

    // Kommo envía diferentes tipos de eventos
    // Extraer información relevante
    const { leads, contacts } = body;

    // Si el webhook contiene información de leads
    if (leads && leads.add) {
      // Lead nuevo creado
      await handleLeadAdded(leads.add);
    }

    if (leads && leads.update) {
      // Lead actualizado
      await handleLeadUpdated(leads.update);
    }

    if (leads && leads.status) {
      // Status del lead cambió
      await handleLeadStatusChanged(leads.status);
    }

    // Responder OK a Kommo para confirmar recepción
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado correctamente' 
    });

  } catch (error) {
    console.error('❌ Error procesando webhook de Kommo:', error);
    
    // Aunque haya error, responder 200 para evitar que Kommo reintente
    // (los errores se loguean pero no detienen el servicio)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 200 });
  }
}

// Procesar lead nuevo
async function handleLeadAdded(leadsData: any[]) {
  console.log('➕ Procesando leads nuevos:', leadsData.length);
  
  for (const leadData of leadsData) {
    try {
      const leadId = leadData.id;
      const contactId = leadData.main_contact?.id || null;
      
      console.log(`📋 Lead nuevo: ID=${leadId}, Contact=${contactId}`);
      
      // Obtener detalles completos del lead desde Kommo API
      const leadDetails = await getLeadDetails(leadId);
      
      if (!leadDetails) {
        console.log(`⚠️ No se pudieron obtener detalles del lead ${leadId}`);
        continue;
      }

      // Insertar en nuestra base de datos
      await upsertLeadTracking({
        kommo_lead_id: leadId,
        kommo_contact_id: contactId,
        nombre: leadDetails.name,
        telefono: leadDetails.phone || '',
        email: leadDetails.email || '',
        plantel: determinePlantelFromTags(leadDetails.tags),
        last_contact_time: new Date().toISOString(),
        pipeline_id: leadData.pipeline_id,
        status_id: leadData.status_id,
        responsible_user_id: leadData.responsible_user_id,
        lead_status: 'active',
        last_webhook_payload: leadData
      });

      console.log(`✅ Lead ${leadId} registrado en tracking`);
    } catch (error) {
      console.error(`❌ Error procesando lead nuevo:`, error);
    }
  }
}

// Procesar actualización de lead
async function handleLeadUpdated(leadsData: any[]) {
  console.log('🔄 Procesando leads actualizados:', leadsData.length);
  
  for (const leadData of leadsData) {
    try {
      const leadId = leadData.id;
      
      console.log(`📝 Lead actualizado: ID=${leadId}`);
      
      // Verificar si el lead existe en tracking
      const { data: existingLead } = await supabase
        .from('kommo_lead_tracking')
        .select('kommo_lead_id')
        .eq('kommo_lead_id', leadId)
        .single();
      
      if (!existingLead) {
        // Lead no existe en tracking (viene de otra fuente: Facebook, Instagram, etc.)
        console.log(`⚠️ Lead ${leadId} no está en tracking, registrándolo ahora...`);
        
        // Obtener detalles completos del lead
        const leadDetails = await getLeadDetails(leadId);
        
        if (leadDetails) {
          await upsertLeadTracking({
            kommo_lead_id: leadId,
            kommo_contact_id: leadData.main_contact?.id || null,
            nombre: leadDetails.name,
            telefono: leadDetails.phone || '',
            email: leadDetails.email || '',
            plantel: determinePlantelFromTags(leadDetails.tags),
            last_contact_time: new Date().toISOString(),
            pipeline_id: leadData.pipeline_id,
            status_id: leadData.status_id,
            responsible_user_id: leadData.responsible_user_id,
            lead_status: 'active',
            last_webhook_payload: leadData
          });
          console.log(`✅ Lead ${leadId} registrado en tracking desde update`);
        }
      } else {
        // Lead existe, solo actualizar last_contact_time
        const { error } = await supabase
          .from('kommo_lead_tracking')
          .update({
            last_contact_time: new Date().toISOString(),
            pipeline_id: leadData.pipeline_id,
            status_id: leadData.status_id,
            updated_at: new Date().toISOString()
          })
          .eq('kommo_lead_id', leadId);

        if (error) {
          console.error(`❌ Error actualizando lead ${leadId}:`, error);
        } else {
          console.log(`✅ Lead ${leadId} actualizado - last_contact_time renovado`);
        }
      }
    } catch (error) {
      console.error(`❌ Error procesando actualización de lead:`, error);
    }
  }
}

// Procesar cambio de status
async function handleLeadStatusChanged(leadsData: any[]) {
  console.log('🔄 Procesando cambios de status:', leadsData.length);
  
  for (const leadData of leadsData) {
    try {
      const leadId = leadData.id;
      const statusId = leadData.status_id;
      const pipelineId = leadData.pipeline_id;
      
      console.log(`📊 Status cambió: Lead ${leadId}, Status ${statusId}`);
      
      // Verificar si el lead existe en tracking
      const { data: existingLead } = await supabase
        .from('kommo_lead_tracking')
        .select('kommo_lead_id')
        .eq('kommo_lead_id', leadId)
        .single();
      
      if (!existingLead) {
        // Lead no existe en tracking (viene de otra fuente)
        console.log(`⚠️ Lead ${leadId} no está en tracking, registrándolo ahora...`);
        
        const leadDetails = await getLeadDetails(leadId);
        
        if (leadDetails) {
          await upsertLeadTracking({
            kommo_lead_id: leadId,
            kommo_contact_id: leadData.main_contact?.id || null,
            nombre: leadDetails.name,
            telefono: leadDetails.phone || '',
            email: leadDetails.email || '',
            plantel: determinePlantelFromTags(leadDetails.tags),
            last_contact_time: new Date().toISOString(),
            pipeline_id: pipelineId,
            status_id: statusId,
            responsible_user_id: leadData.responsible_user_id,
            lead_status: 'active',
            last_webhook_payload: leadData
          });
          console.log(`✅ Lead ${leadId} registrado en tracking desde status change`);
        }
      } else {
        // Determinar si el lead está cerrado
        let leadStatus = 'active';
        // Aquí puedes añadir lógica para detectar status cerrados
        // Por ejemplo: if (statusId === CLOSED_WON_STATUS_ID) leadStatus = 'closed_won';
        
        const { error } = await supabase
          .from('kommo_lead_tracking')
          .update({
            last_contact_time: new Date().toISOString(),
            status_id: statusId,
            pipeline_id: pipelineId,
            lead_status: leadStatus,
            updated_at: new Date().toISOString()
          })
          .eq('kommo_lead_id', leadId);

        if (error) {
          console.error(`❌ Error actualizando status del lead ${leadId}:`, error);
        } else {
          console.log(`✅ Status del lead ${leadId} actualizado`);
        }
      }
    } catch (error) {
      console.error(`❌ Error procesando cambio de status:`, error);
    }
  }
}

// Helper: Obtener detalles completos del lead desde Kommo
async function getLeadDetails(leadId: number) {
  try {
    // Importar función para obtener token
    const { getKommoAccessToken } = await import('../../../../lib/kommo');
    const accessToken = await getKommoAccessToken('open-house');
    
    const response = await fetch(
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}?with=contacts`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }
    );

    if (!response.ok) {
      console.error(`❌ Error obteniendo lead ${leadId}:`, response.status);
      return null;
    }

    const data = await response.json();
    const lead = data;
    
    // Extraer contacto
    const contact = lead._embedded?.contacts?.[0];
    const phone = contact?.custom_fields_values?.find((f: any) => f.field_id === 557098)?.values?.[0]?.value || '';
    const email = contact?.custom_fields_values?.find((f: any) => f.field_id === 557100)?.values?.[0]?.value || '';
    
    // Extraer tags
    const tags = lead._embedded?.tags?.map((t: any) => t.name) || [];

    return {
      name: lead.name,
      phone,
      email,
      tags
    };
  } catch (error) {
    console.error(`❌ Error en getLeadDetails:`, error);
    return null;
  }
}

// Helper: Determinar plantel desde tags
function determinePlantelFromTags(tags: string[]): 'winston' | 'educativo' {
  const tagString = tags.join(' ').toLowerCase();
  
  // Buscar tags específicos de Educativo Winston (Maternal/Kinder)
  if (
    tagString.includes('educativo') || 
    tagString.includes('maternal') || 
    tagString.includes('kinder') ||
    tagString.includes('preescolar') ||
    tagString.includes('sesiones informativas educativo') ||
    tagString.includes('open house educativo')
  ) {
    return 'educativo';
  }
  
  // Por defecto: Winston Churchill (Primaria/Secundaria)
  // Esto cubre leads de Facebook, Instagram, WhatsApp que no tienen tags específicos
  return 'winston';
}

// Helper: Insertar o actualizar lead en tracking
async function upsertLeadTracking(data: any) {
  const { error } = await supabase
    .from('kommo_lead_tracking')
    .upsert({
      kommo_lead_id: data.kommo_lead_id,
      kommo_contact_id: data.kommo_contact_id,
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email,
      plantel: data.plantel,
      last_contact_time: data.last_contact_time,
      pipeline_id: data.pipeline_id,
      status_id: data.status_id,
      responsible_user_id: data.responsible_user_id,
      lead_status: data.lead_status,
      last_webhook_payload: data.last_webhook_payload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'kommo_lead_id'
    });

  if (error) {
    console.error('❌ Error en upsert:', error);
    throw error;
  }
}

// 🎯 FUNCIÓN PRINCIPAL: Revisar leads con >24h y enviar SMS automáticamente
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

// Helper: Enviar SMS de notificación 24h
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

// Helper: Añadir tag a lead en Kommo
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

// Nota: getKommoAccessToken se importa dinámicamente donde se necesita
// No es necesario exportarlo desde este archivo de ruta de API

