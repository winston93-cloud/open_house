// Kommo API Integration
import { NextResponse } from 'next/server';

// Kommo API Configuration
const KOMMO_CONFIG = {
  subdomain: 'winstonchurchill',
  clientId: '0c82cd53-e059-48b7-9478-e3fd71f51f1f',
  clientSecret: 'EZGNNwdY3UmmDw6ryQqArm0dLaq2kjDlkTbo0tQP3cxwiVZPEb9A4fWzjXNyoHqq',
  redirectUri: 'https://open-house-chi.vercel.app/api/auth/kommo/callback',
  pipelineId: '10453492', // Pipeline "En espera de Datos"
  whatsappNumber: '8334378743',
};

// WhatsApp Numbers by Plantel
const WHATSAPP_NUMBERS = {
  winston: '8334378743',      // Winston Churchill
  educativo: '8333474507',    // Educativo Winston
};

// Get access token using long-lived token directly
async function getKommoAccessToken(): Promise<string> {
  try {
    // Usar directamente el token de larga duración
    const longLivedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE1YThkY2UyZmU2MTZhNDIxNWM5YzFlM2RiNWY2ZTUxN2JlM2VmODMwZjA1OTA2NDgyNTkxM2Q0ZjRmMDdmZjRkNWNmNWE0ODUyMjZmZWQyIn0.eyJhdWQiOiIwYzgyY2Q1My1lMDU5LTQ4YjctOTQ3OC1lM2ZkNzFmNTFmMWYiLCJqdGkiOiIxNWE4ZGNlMmZlNjE2YTQyMTVjOWMxZTNkYjVmNmU1MTdiZTNlZjgzMGYwNTkwNjQ4MjU5MTNkNGY0ZjA3ZmY0ZDVjZjVhNDg1MjI2ZmVkMiIsImlhdCI6MTc2MDU1Njc2MSwibmJmIjoxNzYwNTU2NzYxLCJleHAiOjE3NjE4Njg4MDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiIzZWE0ZTUyOS0yYWQ4LTQyMGUtYWQzYy05NmUzOTAwODJhMzAiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.bfiUhdxV_EaAHB7B5WYM49LjkXcNStSZr48Jx3wZFFq00GYYmRUPFab0Ae5SX71v0pdgMgnqiKVfHZhDKfW3ykXJbmSAxcCTi2snoD4sBlvBur8G1pDKZ6YGuqqKboCAER2HbCcZFA5aFrgVHf5L1hl6o_YKCO4VkIFR8MwLv753b3jtdgOvHGc_scXT3JRHCtu4WAXWVw8w7Obo2wBtiefxx_zL4ZGRRSWj8WoIr9LYRc_yfEVm1HgGAJkyrkvWiFKZggRvyZkx1VB6_cKxu_A5751MscI8UlnpJvyzAbJ7HRsrAuRxnFDBjKo2cVrHo8TQ2hwVwSYTQtviSF9aYA';
    
    console.log('🔑 Usando token de larga duración directamente');
    console.log('✅ Token obtenido exitosamente');
    
    return longLivedToken;
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
}) {
  try {
    // Log para detectar múltiples llamadas
    console.log('🔍 createKommoLead llamado para:', leadData.name);
    console.log('🕐 Timestamp createKommoLead:', new Date().toISOString());
    
    const accessToken = await getKommoAccessToken();
    
    // Step 1: Create contact first with WhatsApp
    console.log('👤 Paso 1: Creando contacto con WhatsApp...');
    const contactUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/contacts`;
    
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
            field_id: 557098, // Teléfono/WhatsApp
            values: [{ value: leadData.phone, enum_code: "WHATSAPP" }]
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
    const leadUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/leads`;
    
    const leadPayload = [
      {
        name: `[Open House] ${leadData.nombreAspirante}`,
        price: 0,
        pipeline_id: parseInt(KOMMO_CONFIG.pipelineId!),
        _embedded: {
          contacts: [{ id: contactId }]
        }
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
    console.log('📱 El Salesbot de Kommo se encargará del envío de WhatsApp automáticamente');
    
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
