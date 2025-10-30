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

// WhatsApp Numbers by Plantel
const WHATSAPP_NUMBERS = {
  winston: '8334378743',      // Winston Churchill
  educativo: '8333474507',    // Educativo Winston
};

// Get access token using long-lived token directly
async function getKommoAccessToken(): Promise<string> {
  try {
    // Usar directamente el token de larga duración
    const longLivedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2OWZhMDA2OWIwOTNjMGFhNmZmMjQ2MTJkZjQ3MjI3Y2ViNTM3MGUyODAxODg1MzBmZDM1MDE1MDU0NDA2ZGE2OTdlNDIxMDJhODZkZDI0In0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiJkNjlmYTAwNjliMDkzYzBhYTZmZjI0NjEyZGY0NzIyN2NlYjUzNzBlMjgwMTg4NTMwZmQzNTAxNTA1NDQwNmRhNjk3ZTQyMTAyYTg2ZGQyNCIsImlhdCI6MTc2MTA1NTQzOCwibmJmIjoxNzYxMDU1NDM4LCJleHAiOjE3NjcxMzkyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlNmQxYmViMy0yMGNlLTQ0YWQtODQ0MC1lYTlhZDhlYjhhYWUiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.ccmhIk5mzRS0KyWhoagHROXdXX0fJHXTMKa43JNh9d-S0-snBpMae6WJz2IvX2k1j1tk0oKYIqjus2UviPRsHunuFO1SDmO6h1T1m3bTeNEXcNytreytSYlXgYws4rYxLYUGF5k9DMeFyoN92lXc_r6H97GDa5hvpmG1MCi8cVTMiumRkHtzmzgvqD9OAmUxLAzE3UQy846kwCn6ctJ_nSGSIfr_IKR4fRK1DBPkDVUhpTK5Mr1Hl6LAYj3dMotcjOl13ZfS7G3XsDfLFVW29zJm_SsYg_kTwYBuVxO2lyyFKG6ePZdxrVFGlcH_ppGwpulGOSj6Ua-AH8NQ-kIlBA';
    
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
  tipoEvento?: 'open-house' | 'sesiones'; // Tipo de evento para determinar etiqueta
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
    const leadUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/leads`;
    
    // Determine tag name based on plantel and tipoEvento
    const tipoEvento = leadData.tipoEvento || 'open-house';
    let tagName: string | null = null;
    if (tipoEvento === 'sesiones') {
      // Sesiones Informativas:
      // - Winston (niveles 3,4): sin etiqueta
      // - Educativo (niveles 1,2): mantener etiqueta de Sesiones
      tagName = leadData.plantel === 'winston' ? null : 'Sesiones Informativas Educativo';
    } else {
      // Open House se mantiene igual
      tagName = leadData.plantel === 'winston' ? 'Open House Winston' : 'Open House Educativo';
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
        pipeline_id: parseInt(KOMMO_CONFIG.pipelineId!),
        status_id: parseInt(KOMMO_CONFIG.statusId!),
        responsible_user_id: parseInt(KOMMO_CONFIG.responsibleUserId!),
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
