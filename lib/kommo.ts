// Kommo API Integration
import { NextResponse } from 'next/server';

// Kommo API Configuration
const KOMMO_CONFIG = {
  subdomain: process.env.KOMMO_SUBDOMAIN,
  clientId: process.env.KOMMO_CLIENT_ID,
  clientSecret: process.env.KOMMO_CLIENT_SECRET,
  redirectUri: process.env.KOMMO_REDIRECT_URI,
  pipelineId: process.env.KOMMO_PIPELINE_ID,
  whatsappNumber: process.env.KOMMO_WHATSAPP_NUMBER,
};

// WhatsApp Numbers by Plantel
const WHATSAPP_NUMBERS = {
  winston: '8334378743',      // Winston Churchill
  educativo: '8333474507',    // Educativo Winston
};

// Get access token using OAuth 2.0
async function getKommoAccessToken(): Promise<string> {
  try {
    const tokenUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/oauth2/access_token`;
    
    console.log('🔑 Configuración Kommo:', {
      subdomain: KOMMO_CONFIG.subdomain,
      clientId: KOMMO_CONFIG.clientId ? 'SET' : 'MISSING',
      clientSecret: KOMMO_CONFIG.clientSecret ? 'SET' : 'MISSING',
      redirectUri: KOMMO_CONFIG.redirectUri,
      refreshToken: process.env.KOMMO_REFRESH_TOKEN ? 'SET' : 'MISSING',
      tokenUrl: tokenUrl
    });
    
    const requestBody = {
      client_id: KOMMO_CONFIG.clientId,
      client_secret: KOMMO_CONFIG.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: process.env.KOMMO_REFRESH_TOKEN,
      redirect_uri: KOMMO_CONFIG.redirectUri,
    };
    
    console.log('📤 Enviando request a Kommo:', requestBody);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      throw new Error(`Error getting access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Access token obtenido exitosamente');
    return data.access_token;
  } catch (error) {
    console.error('Error getting Kommo access token:', error);
    throw error;
  }
}

// Create lead in Kommo
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
    const accessToken = await getKommoAccessToken();
    
    // Determine WhatsApp number based on plantel
    const whatsappNumber = WHATSAPP_NUMBERS[leadData.plantel];
    
    const leadUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/leads`;
    
    const leadPayload = {
      name: `Open House - ${leadData.nombreAspirante}`,
      price: 0,
      pipeline_id: parseInt(KOMMO_CONFIG.pipelineId!),
      status_id: null, // Will use default stage
      responsible_user_id: null,
      custom_fields_values: [
        {
          field_id: 'phone', // Campo de teléfono
          values: [{ value: leadData.phone }]
        },
        {
          field_id: 'email', // Campo de email
          values: [{ value: leadData.email }]
        }
      ],
      _embedded: {
        contacts: [
          {
            name: leadData.name,
            custom_fields_values: [
              {
                field_id: 'phone',
                values: [{ value: leadData.phone }]
              },
              {
                field_id: 'email',
                values: [{ value: leadData.email }]
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(leadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating Kommo lead:', errorText);
      throw new Error(`Error creating lead: ${response.status}`);
    }

    const data = await response.json();
    return data._embedded.leads[0].id;
  } catch (error) {
    console.error('Error creating Kommo lead:', error);
    throw error;
  }
}

// Send WhatsApp message via Kommo
export async function sendKommoWhatsApp(leadId: number, phone: string, plantel: 'winston' | 'educativo') {
  try {
    const accessToken = await getKommoAccessToken();
    
    // Determine WhatsApp number based on plantel
    const whatsappNumber = WHATSAPP_NUMBERS[plantel];
    
    const messageUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/chats`;
    
    // Create WhatsApp confirmation message based on plantel
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

    const messagePayload = {
      entity_id: leadId,
      entity_type: 'lead',
      message: message,
      phone: phone.replace(/\D/g, ''), // Remove non-digits
      source: {
        external_id: whatsappNumber,
        type: 'whatsapp'
      }
    };

    const response = await fetch(messageUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending WhatsApp message:', errorText);
      throw new Error(`Error sending WhatsApp: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending Kommo WhatsApp:', error);
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
