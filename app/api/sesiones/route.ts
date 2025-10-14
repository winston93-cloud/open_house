import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';

    // Función para enviar WhatsApp
    const sendWhatsAppMessage = async (phoneNumber: string, formData: any) => {
      try {
        console.log('=== INICIANDO ENVÍO WHATSAPP ===');
        console.log('Número destino:', phoneNumber);
        console.log('Mensaje a enviar: Template sesiones informativas con parámetros');
        console.log('URL API:', 'https://graph.facebook.com/v22.0/821192997746970/messages');
        
        // Log para el navegador
        console.log('🔍 WHATSAPP DEBUG - Iniciando envío a:', phoneNumber);
        
        const requestBody = {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: 'openhouse',
            language: { 
              code: 'es' 
            }
          }
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        console.log('Token (primeros 20 chars):', process.env.WHATSAPP_TOKEN?.substring(0, 20) || 'NO TOKEN');
        
        // Usar la API de WhatsApp Business con ID del número de Meta
        const response = await fetch('https://graph.facebook.com/v22.0/821192997746970/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer EAARaYqnPlqYBPsgLZCwP3kHsaM4bLK3yhGjX2ieuylGawDh8HXGU2Y6sb3ZAIevKEFv8iuMWXKlpBnMzveBJqIRmFDKZAkqtjFyTd47UICmtLImvucdQrYeH1S0cV0k4gLt8U2ZAaGpohJBmMgloP8DalA6bk1t2gNvdEuQfZAZCZBcpQmoplvdtVnLgPEIWvObebuwx5ont0jW9QktI2VNlONJObESr5gdvcrv0buhUx0NCPdEB6tRAoZCUcZAnp`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!response.ok) {
          console.error('Error sending WhatsApp:', responseText);
          console.log('❌ WHATSAPP ERROR - Status:', response.status, 'Response:', responseText);
          return { success: false, error: responseText, status: response.status };
        }

        console.log('=== WHATSAPP ENVIADO EXITOSAMENTE ===');
        console.log('✅ WHATSAPP SUCCESS - Mensaje enviado correctamente');
        return { success: true, response: responseText };
      } catch (error) {
        console.error('WhatsApp error:', error);
        return { success: false, error: 'Error en el proceso de envío', status: 0 };
      }
    };

// Template para WhatsApp - Instituto Educativo Winston
const createEducativoWhatsAppMessage = (formData: any, fechaEvento: string, horaEvento: string) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto, whatsapp } = formData;
  
  const gradoFormateado = gradoEscolar
    .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
    .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
    .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2');

  return `🏫 *INSTITUTO EDUCATIVO WINSTON CHURCHILL*
📅 *SESIÓN INFORMATIVA - ${fechaEvento}*

¡Hola! 👋

Confirmamos tu inscripción a la Sesión Informativa:

👤 *Información del Aspirante:*
• Nombre: ${nombreAspirante}
• Nivel: ${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}
• Grado: ${gradoFormateado}
• Fecha de nacimiento: ${fechaNacimiento}

👨‍👩‍👧‍👦 *Información del Padre/Madre:*
• Nombre: ${nombreCompleto}
• WhatsApp: ${whatsapp}

📅 *Detalles del Evento:*
• Fecha: ${fechaEvento}
• Hora: ${horaEvento}
• Lugar: Instituto Winston Churchill — Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas

¡Esperamos verte pronto! 🎉

Para más información: 833 347 4507`;

};

// Template para WhatsApp - Instituto Winston Churchill
const createChurchillWhatsAppMessage = (formData: any, fechaEvento: string, horaEvento: string) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto, whatsapp } = formData;
  
  const gradoFormateado = gradoEscolar
    .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
    .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
    .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2');

  return `🏛️ *INSTITUTO WINSTON CHURCHILL*
📅 *SESIÓN INFORMATIVA - ${fechaEvento}*

¡Hola! 👋

Confirmamos tu inscripción a la Sesión Informativa:

👤 *Información del Aspirante:*
• Nombre: ${nombreAspirante}
• Nivel: ${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}
• Grado: ${gradoFormateado}
• Fecha de nacimiento: ${fechaNacimiento}

👨‍👩‍👧‍👦 *Información del Padre/Madre:*
• Nombre: ${nombreCompleto}
• WhatsApp: ${whatsapp}

📅 *Detalles del Evento:*
• Fecha: ${fechaEvento}
• Hora: ${horaEvento}
    • Lugar: Instituto Winston Churchill — Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas

¡Esperamos verte pronto! 🎉

Para más información: 833 437 8743`;

};

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Template para Instituto Educativo Winston (Maternal/Kinder)
const createEducativoTemplate = (formData: any, fechaEvento: string, horaEvento: string, institucionNombre: string) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto } = formData;
  
  // Formatear grado escolar con guión medio
  const gradoFormateado = gradoEscolar
    .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')  // maternal1 -> maternal-1
    .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')  // 1primaria -> 1-Primaria
    .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2'); // maternalA -> maternal-A
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Inscripción - Sesión Informativa</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px 12px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .welcome {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome h2 {
            color: #FA9D00 !important;
            font-size: 24px;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        .welcome p {
            color: #333333 !important;
            font-size: 16px;
            margin: 0;
            font-weight: 500;
        }
        .info-card {
            background: #ffffff;
            border: 2px solid #FA9D00;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h3 {
            color: #FA9D00 !important;
            font-size: 20px;
            margin: 0 0 20px 0;
            text-align: center;
            font-weight: 700;
        }
        .educativo-info-row {
            margin: 15px 0;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
            display: table;
            width: 100%;
        }
        .educativo-info-row:last-child {
            border-bottom: none;
        }
        .educativo-info-label {
            font-weight: 600;
            color: #2c3e50 !important;
            font-size: 14px;
            display: table-cell;
            width: 40%;
            vertical-align: top;
            padding-right: 10px;
        }
        .educativo-info-value {
            color: #FA9D00 !important;
            font-weight: 700;
            font-size: 14px;
            display: table-cell;
            width: 60%;
            vertical-align: top;
            word-wrap: break-word;
        }
        .event-details {
            background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(250, 157, 0, 0.3);
        }
        .event-details h3 {
            margin: 0 0 20px 0;
            font-size: 22px;
            font-weight: 700;
            text-align: center;
        }
        .event-date {
            font-size: 26px;
            font-weight: 700;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            text-align: center;
            display: block;
        }
        .event-time {
            font-size: 20px;
            opacity: 0.95;
            margin: 10px 0;
            text-align: center;
            display: block;
        }
        .event-description {
            margin-top: 20px;
            font-size: 16px;
            opacity: 0.9;
            text-align: center;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            border-radius: 0 0 12px 12px;
        }
        .footer p {
            margin: 0;
            color: #333333 !important;
            font-size: 14px;
            font-weight: 500;
        }
        .contact-info {
            margin-top: 15px;
            padding: 15px;
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .contact-info p {
            margin: 5px 0;
            font-size: 13px;
            color: #333333 !important;
            font-weight: 500;
        }
        .highlight {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight p {
            margin: 0;
            color: #856404;
            font-weight: 600;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
            .educativo-info-row {
                display: block;
            }
            .educativo-info-label {
                display: block;
                width: 100%;
                margin-bottom: 5px;
                font-weight: 700;
            }
            .educativo-info-value {
                display: block;
                width: 100%;
                margin-bottom: 10px;
                text-align: left;
            }
            .event-date {
                font-size: 22px;
            }
            .event-time {
                font-size: 18px;
            }
            .event-details {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${institucionNombre}</h1>
            <p>Sesión Informativa 2025 - Confirmación de Inscripción</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                <p>Estimado(a) ${nombreCompleto},</p>
            </div>
            
            <div class="highlight">
                <p>✅ Su inscripción ha sido confirmada exitosamente</p>
            </div>
            
            <div class="info-card">
                <h3>📋 Información del Aspirante</h3>
                <div class="educativo-info-row">
                    <span class="educativo-info-label">Nombre del Aspirante:</span>
                    <span class="educativo-info-value">${nombreAspirante}</span>
                </div>
                <div class="educativo-info-row">
                    <span class="educativo-info-label">Nivel Académico:</span>
                    <span class="educativo-info-value">${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}</span>
                </div>
                <div class="educativo-info-row">
                    <span class="educativo-info-label">Grado Escolar:</span>
                    <span class="educativo-info-value">${gradoFormateado}</span>
                </div>
                <div class="educativo-info-row">
                    <span class="educativo-info-label">Fecha de Nacimiento:</span>
                    <span class="educativo-info-value">${fechaNacimiento}</span>
                </div>
            </div>
            
            <div class="event-details">
                <h3>🎉 Detalles del Evento</h3>
                <div class="event-date">${fechaEvento}</div>
                <div class="event-time">⏰ ${horaEvento}</div>
                <div class="event-description">
                    Te esperamos en nuestras instalaciones para conocer más sobre nuestro programa educativo
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>¡Esperamos verte pronto!</strong></p>
            <div class="contact-info">
                <p><strong>${institucionNombre}</strong></p>
                <p>📧 recepcioniew@winston93.edu.mx</p>
                <p>🌐 www.winstonkinder.edu.mx</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Template para Instituto Winston Churchill (Primaria/Secundaria)
const createChurchillTemplate = (formData: any, fechaEvento: string, horaEvento: string, institucionNombre: string) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto } = formData;
  
  // Formatear grado escolar con guión medio
  const gradoFormateado = gradoEscolar
    .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')  // maternal1 -> maternal-1
    .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')  // 1primaria -> 1-Primaria
    .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2'); // maternalA -> maternal-A
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Inscripción - Sesión Informativa</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px 12px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            background-color: #ffffff;
        }
        .welcome {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome h2 {
            color: #FA9D00 !important;
            font-size: 24px;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        .welcome p {
            color: #333333 !important;
            font-size: 16px;
            margin: 0;
            font-weight: 500;
        }
        .info-card {
            background: #ffffff;
            border: 2px solid #FA9D00;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h3 {
            color: #FA9D00 !important;
            font-size: 20px;
            margin: 0 0 20px 0;
            text-align: center;
            font-weight: 700;
        }
        .churchill-info-row {
            margin: 15px 0;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
            display: table;
            width: 100%;
        }
        .churchill-info-row:last-child {
            border-bottom: none;
        }
        .churchill-info-label {
            font-weight: 600;
            color: #2c3e50 !important;
            font-size: 14px;
            display: table-cell;
            width: 40%;
            vertical-align: top;
            padding-right: 10px;
        }
        .churchill-info-value {
            color: #FA9D00 !important;
            font-weight: 700;
            font-size: 14px;
            display: table-cell;
            width: 60%;
            vertical-align: top;
            word-wrap: break-word;
        }
        .churchill-info-row:after {
            content: "";
            display: table;
            clear: both;
        }
        .event-details {
            background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(250, 157, 0, 0.3);
        }
        .event-details h3 {
            margin: 0 0 20px 0;
            font-size: 22px;
            font-weight: 700;
            text-align: center;
        }
        .event-date {
            font-size: 26px;
            font-weight: 700;
            margin: 15px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            text-align: center;
            display: block;
        }
        .event-time {
            font-size: 20px;
            opacity: 0.95;
            margin: 10px 0;
            text-align: center;
            display: block;
        }
        .event-description {
            margin-top: 20px;
            font-size: 16px;
            opacity: 0.9;
            text-align: center;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #dee2e6;
            border-radius: 0 0 12px 12px;
        }
        .footer p {
            margin: 0;
            color: #333333 !important;
            font-size: 14px;
            font-weight: 500;
        }
        .contact-info {
            margin-top: 15px;
            padding: 15px;
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        .contact-info p {
            margin: 5px 0;
            font-size: 13px;
            color: #333333 !important;
            font-weight: 500;
        }
        .highlight {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight p {
            margin: 0;
            color: #856404;
            font-weight: 600;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
            .churchill-info-row {
                display: block;
            }
            .churchill-info-label {
                display: block;
                width: 100%;
                margin-bottom: 5px;
                font-weight: 700;
            }
            .churchill-info-value {
                display: block;
                width: 100%;
                margin-bottom: 10px;
                text-align: left;
            }
            .event-date {
                font-size: 22px;
            }
            .event-time {
                font-size: 18px;
            }
            .event-details {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${institucionNombre}</h1>
            <p>Sesión Informativa 2025 - Confirmación de Inscripción</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                <p>Estimado(a) ${nombreCompleto},</p>
            </div>
            
            <div class="highlight">
                <p>✅ Su inscripción ha sido confirmada exitosamente</p>
            </div>
            
            <div class="info-card">
                <h3>📋 Información del Aspirante</h3>
                <div class="churchill-info-row">
                    <span class="churchill-info-label">Nombre del Aspirante:</span>
                    <span class="churchill-info-value">${nombreAspirante}</span>
                </div>
                <div class="churchill-info-row">
                    <span class="churchill-info-label">Nivel Académico:</span>
                    <span class="churchill-info-value">${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}</span>
                </div>
                <div class="churchill-info-row">
                    <span class="churchill-info-label">Grado Escolar:</span>
                    <span class="churchill-info-value">${gradoFormateado}</span>
                </div>
                <div class="churchill-info-row">
                    <span class="churchill-info-label">Fecha de Nacimiento:</span>
                    <span class="churchill-info-value">${fechaNacimiento}</span>
                </div>
            </div>
            
            <div class="event-details">
                <h3>🎉 Detalles del Evento</h3>
                <div class="event-date">${fechaEvento}</div>
                <div class="event-time">⏰ ${horaEvento}</div>
                <div class="event-description">
                    Te esperamos en nuestras instalaciones para conocer más sobre nuestro programa educativo
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>¡Esperamos verte pronto!</strong></p>
            <div class="contact-info">
                <p><strong>${institucionNombre}</strong></p>
                <p>📧 recepcioniew@winston93.edu.mx</p>
                <p>🌐 www.winstonkinder.edu.mx</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para crear el template del email
const createEmailTemplate = (formData: any) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto, correo } = formData;
  
  // Determinar fecha y hora del evento según el nivel
  let fechaEvento, horaEvento, institucionNombre;
  
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    fechaEvento = '29 de noviembre de 2025';
    horaEvento = '9:00 AM';
    institucionNombre = 'Instituto Educativo Winston';
    return createEducativoTemplate(formData, fechaEvento, horaEvento, institucionNombre);
  } else if (nivelAcademico === 'primaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '9:00 AM a 11:30 AM';
    institucionNombre = 'Instituto Winston Churchill';
    return createChurchillTemplate(formData, fechaEvento, horaEvento, institucionNombre);
  } else if (nivelAcademico === 'secundaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '11:30 AM a 2:00 PM';
    institucionNombre = 'Instituto Winston Churchill';
    return createChurchillTemplate(formData, fechaEvento, horaEvento, institucionNombre);
  }
  // Fallback if no academic level matches (should not happen with proper form validation)
  return createChurchillTemplate(formData, 'Fecha no especificada', 'Hora no especificada', 'Instituto Winston Churchill');
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['nombreAspirante', 'nivelAcademico', 'gradoEscolar', 'fechaNacimiento', 'nombreCompleto', 'correo', 'whatsapp', 'medioEntero'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Calcular fecha para el recordatorio (1 día después)
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 1);

    // Guardar en la base de datos (tabla 'sesiones' en lugar de 'inscripciones')
    const { data: inscripcion, error: dbError } = await supabase
      .from('sesiones')
      .insert([
        {
          nombre_aspirante: formData.nombreAspirante,
          nivel_academico: formData.nivelAcademico,
          grado_escolar: formData.gradoEscolar,
          fecha_nacimiento: formData.fechaNacimiento,
          nombre_padre: formData.nombreCompleto,
          nombre_madre: formData.nombreCompleto, // Asumiendo que es el mismo para ambos padres
          telefono: formData.telefono || '',
          whatsapp: formData.whatsapp,
          email: formData.correo,
          direccion: formData.direccion || '',
          fecha_inscripcion: new Date().toISOString(),
          reminder_sent: false,
          reminder_scheduled_for: reminderDate.toISOString()
        }
      ])
      .select();

    if (dbError) {
      console.error('Error al guardar en la base de datos:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar la inscripción' },
        { status: 500 }
      );
    }

    // Crear el template del email
    const emailHtml = createEmailTemplate(formData);
    
    // Configurar el email
    const mailOptions = {
      from: {
        name: formData.nivelAcademico === 'maternal' || formData.nivelAcademico === 'kinder' 
          ? 'Instituto Educativo Winston' 
          : 'Instituto Winston Churchill',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: formData.correo,
      subject: 'Confirmación de Inscripción - Sesión Informativa 2025',
      html: emailHtml
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    // Enviar copia a sistemas.desarrollo@winston93.edu.mx
    const copyMailOptions = {
      from: {
        name: 'Sistema de Inscripciones - Sesión Informativa 2025',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: 'sistemas.desarrollo@winston93.edu.mx',
      subject: `📋 Nueva Inscripción a Sesión Informativa - ${formData.nombreCompleto} (${formData.nivelAcademico})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">📋 Nueva Inscripción a Sesión Informativa</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sesión Informativa 2025</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #FA9D00; margin-top: 0;">👤 Información del Aspirante</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">Nombre del Aspirante:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${formData.nombreCompleto}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nivel Académico:</td>
                <td style="padding: 8px 0; color: #FA9D00; text-transform: capitalize;">${formData.nivelAcademico}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Grado Escolar:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${formData.gradoEscolar}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Nacimiento:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${formData.fechaNacimiento}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${formData.correo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">WhatsApp:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${formData.whatsapp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Inscripción:</td>
                <td style="padding: 8px 0; color: #FA9D00;">${new Date().toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">ID de Inscripción:</td>
                <td style="padding: 8px 0; color: #FA9D00; font-family: monospace;">${inscripcion?.[0]?.id}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff7ed; border-left: 4px solid #FA9D00; border-radius: 5px;">
              <p style="margin: 0; color: #c2410c; font-size: 14px;">
                <strong>📧 Email de confirmación enviado a:</strong> ${formData.correo}<br>
                <strong>📱 WhatsApp enviado a:</strong> ${formData.whatsapp}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #10b981; color: white; border-radius: 10px;">
            <p style="margin: 0; font-weight: bold;">✅ Inscripción procesada exitosamente</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(copyMailOptions);
    console.log('📧 Copia de inscripción a Sesión Informativa enviada a sistemas.desarrollo@winston93.edu.mx');
    
    // Enviar WhatsApp
    try {
      const fechaEvento = 'Sábado 11 de enero de 2025';
      const horaEvento = '9:00 AM - 1:00 PM';
      
      let whatsappMessage = '';
      
      if (formData.nivelAcademico === 'maternal' || formData.nivelAcademico === 'kinder') {
        whatsappMessage = createEducativoWhatsAppMessage(formData, fechaEvento, horaEvento);
      } else {
        whatsappMessage = createChurchillWhatsAppMessage(formData, fechaEvento, horaEvento);
      }
      
      // Limpiar el número de WhatsApp del usuario (quitar espacios, guiones, etc.)
      const cleanWhatsapp = formData.whatsapp.replace(/[\s\-\(\)]/g, '');
      const formattedWhatsapp = cleanWhatsapp.startsWith('52') ? cleanWhatsapp : `52${cleanWhatsapp}`;
      
      // Enviar WhatsApp
      console.log('WhatsApp message to send:', whatsappMessage);
      console.log('To number:', formattedWhatsapp);
      
      // Enviar WhatsApp real
      const whatsappResult = await sendWhatsAppMessage(formattedWhatsapp, formData);
      
      if (whatsappResult && whatsappResult.success) {
        console.log('WhatsApp enviado exitosamente a:', formattedWhatsapp);
        return NextResponse.json({ 
          success: true, 
          message: 'Inscripción guardada, email y WhatsApp enviados exitosamente',
          inscripcionId: inscripcion?.[0]?.id,
          whatsappStatus: 'sent'
        });
      } else {
        console.log('Error al enviar WhatsApp a:', formattedWhatsapp);
        console.log('WhatsApp error details:', whatsappResult);
        const errorMessage = (whatsappResult && typeof whatsappResult === 'object' && 'error' in whatsappResult) 
          ? whatsappResult.error 
          : 'Error desconocido';
        return NextResponse.json({ 
          success: true, 
          message: 'Inscripción guardada, email enviado exitosamente',
          inscripcionId: inscripcion?.[0]?.id,
          whatsappStatus: 'failed',
          whatsappError: errorMessage
        });
      }
      
    } catch (whatsappError) {
      console.error('Error al enviar WhatsApp:', whatsappError);
      return NextResponse.json({ 
        success: true, 
        message: 'Inscripción guardada, email enviado exitosamente',
        inscripcionId: inscripcion?.[0]?.id,
        whatsappStatus: 'failed',
        whatsappError: 'Error en el proceso de envío'
      });
    }
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

