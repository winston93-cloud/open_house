// Kommo API Integration
import { NextResponse } from 'next/server';

// Kommo API Configuration
const KOMMO_CONFIG = {
  subdomain: 'winstonchurchill',
  clientId: 'fd378cbf-e7a0-494a-bb98-303e15c621aa',
  clientSecret: 'p8n7DWLGmjOnTDqtPGjt1ydDr1F93aDMaAAa3Res3G9ZayP762p4RAm9LmuVvrPH',
  redirectUri: 'https://open-house-chi.vercel.app/api/auth/kommo/callback',
  pipelineId: '5030645', // Pipeline "Embudo de ventas"
  statusId: '56296556', // Status "comentarios"
  responsibleUserId: '7882301', // Karla Garza
  whatsappNumber: '8334378743',
};

// Config alternativa para Sesiones (override por variables de entorno)
// Si no se definen, se usarán los valores de KOMMO_CONFIG
const KOMMO_CONFIG_SESIONES = {
  subdomain: process.env.KOMMO_SESIONES_SUBDOMAIN || KOMMO_CONFIG.subdomain,
  clientId: process.env.KOMMO_SESIONES_CLIENT_ID || KOMMO_CONFIG.clientId,
  clientSecret: process.env.KOMMO_SESIONES_CLIENT_SECRET || KOMMO_CONFIG.clientSecret,
  redirectUri: process.env.KOMMO_SESIONES_REDIRECT_URI || KOMMO_CONFIG.redirectUri,
  pipelineId: process.env.KOMMO_SESIONES_PIPELINE_ID || KOMMO_CONFIG.pipelineId,
  statusId: process.env.KOMMO_SESIONES_STATUS_ID || KOMMO_CONFIG.statusId,
  responsibleUserId: process.env.KOMMO_SESIONES_RESPONSIBLE_USER_ID || KOMMO_CONFIG.responsibleUserId,
  whatsappNumber: process.env.KOMMO_SESIONES_WHATSAPP || KOMMO_CONFIG.whatsappNumber,
};

// WhatsApp Numbers by Plantel
const WHATSAPP_NUMBERS = {
  winston: '8334378743',      // Winston Churchill
  educativo: '8333474507',    // Educativo Winston
};

// Get access token using long-lived token directly
export async function getKommoAccessToken(integration: 'open-house' | 'sesiones'): Promise<string> {
  try {
    // Elegir token de larga duración por integración (Renovado: 5 enero 2026)
    const defaultToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6Ijg1OGZiMTIwM2JlOWViMmMzNjIyZDI2OWIxOTFjYWE2MGIxOTBkZDQyODk5NTg5YmI4NmJkZDRjNTNjMzI5MDNlMjc1YzNmY2VlODExYzcyIn0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiI4NThmYjEyMDNiZTllYjJjMzYyMmQyNjliMTkxY2FhNjBiMTkwZGQ0Mjg5OTU4OWJiODZiZGQ0YzUzYzMyOTAzZTI3NWMzZmNlZTgxMWM3MiIsImlhdCI6MTc2NzYzMTY1NCwibmJmIjoxNzY3NjMxNjU0LCJleHAiOjE3NzQ5MTUyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlYzc4YTRjMy03MTJlLTQ1ZGYtYTFhNC0xYzk4ZGEzM2E2ZTMiLCJ1c2VyX2ZsYWdzIjoxLCJhcGlfZG9tYWluIjoiYXBpLWMua29tbW8uY29tIn0.CaqZDYWHLvs78j2q0xoQxKY25xeGh1DRvaqPbbKyDVXh4AnNufPbMAJ0jynODxopRmMN5QtG9u6vyzouwlSDIRshD9ld1tinN-WikIrKWG8WQ0TAXgb-9x4ZFw2LY56objARqMgy675jicsoSsnTVf5k0NVrRf6VGFi8cTo1VjxZYA1EvBujeE1cXSnpZrUZg-Rj5VJamYu2uaDSBedQSLrWwF4IwMxzSGfgSwzMIG8UT1Jc_sb7w8j1NhM3jK-21YcrdK3lxBk40tsV6atl6VnPQNRJdP6hJSWQbSqwLdxzSa2sJQS_xWQg6knCpWjmLlKbdCpqECv4Gfxau8lwrg';
    const sesionesToken = process.env.KOMMO_SESIONES_LONG_TOKEN || defaultToken;
    const tokenToUse = integration === 'sesiones' ? sesionesToken : defaultToken;
    console.log(`🔑 Usando token para integración: ${integration}`);
    console.log('✅ Token obtenido exitosamente');
    return tokenToUse;
  } catch (error) {
    console.error('❌ Error getting Kommo access token:', error);
    throw error;
  }
}

// Create contact first, then lead
export async function createKommoLead(leadData: {
  name: string;
  phone: string;
  email: string;
  plantel: 'winston' | 'educativo';
  nivelAcademico: string;
  gradoEscolar: string;
  nombreAspirante: string;
  tipoEvento?: 'open-house' | 'sesiones'; // Tipo de evento para determinar etiqueta
}) {
  try {
    // Log para detectar múltiples llamadas
    console.log('🔍 createKommoLead llamado para:', leadData.name);
    console.log('🕐 Timestamp createKommoLead:', new Date().toISOString());
    
    const accessToken = await getKommoAccessToken(leadData.tipoEvento === 'sesiones' ? 'sesiones' : 'open-house');
    
    // Step 1: Create contact first with WhatsApp
    console.log('👤 Paso 1: Creando contacto con WhatsApp...');
    const isSesiones = leadData.tipoEvento === 'sesiones';
    const cfg = isSesiones ? KOMMO_CONFIG_SESIONES : KOMMO_CONFIG;
    const contactUrl = `https://${cfg.subdomain}.kommo.com/api/v4/contacts`;
    
    // Get WhatsApp number based on plantel
    const whatsappNumber = leadData.plantel === 'winston' ? WHATSAPP_NUMBERS.winston : WHATSAPP_NUMBERS.educativo;
    console.log(`📱 Usando número WhatsApp para ${leadData.plantel}: ${whatsappNumber}`);
    
    const contactPayload = [
      {
        name: leadData.name,
        custom_fields_values: [
          {
            field_id: 557100, // Email
            values: [{ value: leadData.email, enum_code: "WORK" }]
          },
          {
            field_id: 557098, // Teléfono
            values: [
              { value: leadData.phone, enum_id: 360072 } // Solo celular del papá (MOB)
            ]
          }
        ]
      }
    ];
    
    console.log('📤 Payload del contacto con WhatsApp:', JSON.stringify(contactPayload, null, 2));
    
    const contactResponse = await fetch(contactUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });
    
    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('Error creating contact:', errorText);
      throw new Error(`Error creating contact: ${contactResponse.status}`);
    }
    
    const contactData = await contactResponse.json();
    console.log('📥 Respuesta del contacto:', JSON.stringify(contactData, null, 2));
    
    const contactId = contactData._embedded.contacts[0].id;
    console.log('✅ Contacto creado con ID:', contactId);
    
    // Step 2: Create lead with contact
    console.log('📋 Paso 2: Creando lead con contacto...');
    const leadUrl = `https://${cfg.subdomain}.kommo.com/api/v4/leads`;
    
    // Determine tag name based on plantel and tipoEvento
    const tipoEvento = leadData.tipoEvento || 'open-house';
    let tagName: string | null = null;
    if (tipoEvento === 'sesiones') {
      // Sesiones Informativas:
      // Winston -> Sesiones Informativas Winston 2026, Educativo -> Sesiones Informativas Educativo 2026
      tagName = leadData.plantel === 'winston' ? 'Sesiones Informativas Winston 2026' : 'Sesiones Informativas Educativo 2026';
    } else {
      // Open House
      tagName = leadData.plantel === 'winston' ? 'Open House Winston 2026' : 'Open House Educativo 2026';
    }
    if (tagName) {
      console.log(`🏷️ Etiqueta a incluir: ${tagName} (Evento: ${tipoEvento}, Plantel: ${leadData.plantel})`);
    } else {
      console.log(`🏷️ Sin etiquetas para este lead (Evento: ${tipoEvento})`);
    }

    const embedded: any = { contacts: [{ id: contactId }] };
    if (tagName) {
      embedded.tags = [{ name: tagName }];
    }
    const leadPayload = [
      {
        name: leadData.name,
        price: 0,
        pipeline_id: parseInt(cfg.pipelineId!),
        status_id: parseInt(cfg.statusId!),
        responsible_user_id: parseInt(cfg.responsibleUserId!),
        _embedded: embedded
      }
    ];

    console.log('📤 Payload del lead:', JSON.stringify(leadPayload, null, 2));
    
    const leadResponse = await fetch(leadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadPayload),
    });

    if (!leadResponse.ok) {
      const errorText = await leadResponse.text();
      console.error('Error creating lead:', errorText);
      throw new Error(`Error creating lead: ${leadResponse.status}`);
    }

    const leadResponseData = await leadResponse.json();
    console.log('📥 Respuesta del lead:', JSON.stringify(leadResponseData, null, 2));
    
    // Verificar cuántos leads se crearon
    if (leadResponseData._embedded && leadResponseData._embedded.leads) {
      console.log(`📊 Total de leads creados: ${leadResponseData._embedded.leads.length}`);
      leadResponseData._embedded.leads.forEach((lead: any, index: number) => {
        console.log(`📋 Lead ${index + 1}: ID=${lead.id}, Name="${lead.name}"`);
      });
    }
    
    const leadId = leadResponseData._embedded.leads[0].id;
    
    console.log('✅ Lead creado exitosamente con ID:', leadId);
    
    if (tagName) {
    console.log('🏷️ Etiqueta incluida en el payload del lead');
    }
    
    console.log('📱 El Salesbot de Kommo se encargará del envío de WhatsApp automáticamente');
    
    // 🎯 Registrar lead en tracking para monitoreo de 24h
    console.log('📝 Registrando lead en tracking de comunicaciones...');
    try {
      const { supabase } = await import('./supabase');
      await supabase
        .from('kommo_lead_tracking')
        .insert({
          kommo_lead_id: leadId,
          kommo_contact_id: contactId,
          nombre: leadData.name,
          telefono: leadData.phone,
          email: leadData.email,
          plantel: leadData.plantel,
          last_contact_time: new Date().toISOString(), // Ahora mismo, porque se acaba de crear
          pipeline_id: parseInt(cfg.pipelineId!),
          status_id: parseInt(cfg.statusId!),
          responsible_user_id: parseInt(cfg.responsibleUserId!),
          lead_status: 'active'
        });
      console.log('✅ Lead registrado en tracking');
    } catch (trackingError) {
      console.error('⚠️ Error registrando en tracking (no crítico):', trackingError);
      // No lanzar error, el lead ya se creó exitosamente en Kommo
    }
    
    return leadId;
  } catch (error) {
    console.error('Error creating Kommo lead:', error);
    throw error;
  }
}

// NOTE: WhatsApp sending is now handled by Kommo Salesbot automatically
// No need to send WhatsApp from the application

// Determine plantel based on form data or logic
export function determinePlantel(formData: any): 'winston' | 'educativo' {
  // Maternal y Kinder → Educativo Winston
  // Primaria y Secundaria → Winston Churchill
  if (formData.nivelAcademico === 'maternal' || formData.nivelAcademico === 'kinder') {
    return 'educativo';
  }
  // Por defecto, Primaria y Secundaria van a Winston Churchill
  return 'winston';
}
