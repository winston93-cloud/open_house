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
    
    // Step 1: Create contact first
    console.log('👤 Paso 1: Creando contacto...');
    const contactUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/contacts`;
    
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
            values: [{ value: leadData.phone, enum_code: "MOB" }]
          }
        ]
      }
    ];
    
    console.log('📤 Payload del contacto:', JSON.stringify(contactPayload, null, 2));
    
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
    
    // Step 3: Send WhatsApp confirmation message
    console.log('📱 Paso 3: Enviando mensaje de confirmación por WhatsApp...');
    try {
      await sendKommoWhatsApp(leadId, contactId, leadData.phone, leadData.plantel);
      console.log('✅ WhatsApp enviado exitosamente');
    } catch (whatsappError) {
      console.error('⚠️ Error enviando WhatsApp (continuando sin error):', whatsappError);
      // No lanzamos el error para que la creación del lead no falle
    }
    
    return leadId;
  } catch (error) {
    console.error('Error creating Kommo lead:', error);
    throw error;
  }
}

// Send WhatsApp message via Kommo using correct endpoint
export async function sendKommoWhatsApp(leadId: number, contactId: number, phone: string, plantel: 'winston' | 'educativo') {
  try {
    const accessToken = await getKommoAccessToken();
    
    // Usar el endpoint correcto según la información del Copilot
    const messagesUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/messages`;
    
    console.log('🔍 URL que se está usando:', messagesUrl);
    
    // Create confirmation message based on plantel
    const message = plantel === 'educativo' 
      ? `¡Hola! 👋

Gracias por tu interés en el Open House del Instituto Educativo Winston.

✅ Tu registro ha sido confirmado exitosamente.

📅 Fecha: [Fecha del evento]
🕐 Hora: [Hora del evento]
📍 Ubicación: Instituto Educativo Winston
🏫 Dirección: [Dirección Educativo Winston]

📞 Contacto:
• Teléfono: 833 347 4507
• WhatsApp: 833 347 4507
• Email: [Email Educativo Winston]

Te esperamos para mostrarte todo lo que tenemos preparado para tu hijo/a.

¡Nos vemos pronto! 🎓`
      : `¡Hola! 👋

Gracias por tu interés en el Open House del Instituto Winston Churchill.

✅ Tu registro ha sido confirmado exitosamente.

📅 Fecha: [Fecha del evento]
🕐 Hora: [Hora del evento]
📍 Ubicación: Instituto Winston Churchill
🏫 Dirección: [Dirección Winston Churchill]

📞 Contacto:
• Teléfono: 833 437 8743
• WhatsApp: 833 437 8743
• Email: [Email Winston Churchill]

Te esperamos para mostrarte todo lo que tenemos preparado para tu hijo/a.

¡Nos vemos pronto! 🎓`;

    // Formatear teléfono según especificaciones del Copilot (internacional sin signos ni espacios)
    const formattedPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    
    // Payload según especificaciones del Copilot
    const messagesPayload = {
      to: formattedPhone,
      channel: "whatsapp",
      text: message,
      entity_id: leadId,
      entity_type: "leads"
    };

    console.log('📤 Payload del WhatsApp:', JSON.stringify(messagesPayload, null, 2));

    const response = await fetch(messagesUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagesPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error sending WhatsApp message:', errorText);
      throw new Error(`Error sending WhatsApp: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ WhatsApp enviado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending Kommo WhatsApp:', error);
    throw error;
  }
}

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
