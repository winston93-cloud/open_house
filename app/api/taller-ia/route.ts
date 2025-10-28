import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Template para el email de confirmación del taller
const createTallerEmailTemplate = (formData: any) => {
  const { nombre, apellido, puesto, gradoClase, institucionProcedencia, email, whatsapp, experienciaIA } = formData;
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Registro - Taller IA e Inclusión</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #667eea !important;
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
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h3 {
            color: #667eea !important;
            font-size: 20px;
            margin: 0 0 20px 0;
            text-align: center;
            font-weight: 700;
        }
        .info-row {
            margin: 15px 0;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
            display: table;
            width: 100%;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #2c3e50 !important;
            font-size: 14px;
            display: table-cell;
            width: 40%;
            vertical-align: top;
            padding-right: 10px;
        }
        .info-value {
            color: #667eea !important;
            font-weight: 700;
            font-size: 14px;
            display: table-cell;
            width: 60%;
            vertical-align: top;
            word-wrap: break-word;
        }
        .event-details {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
            background-color: #e6fffa;
            border: 1px solid #81e6d9;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight p {
            margin: 0;
            color: #234e52;
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
            .info-row {
                display: block;
            }
            .info-label {
                display: block;
                width: 100%;
                margin-bottom: 5px;
                font-weight: 700;
            }
            .info-value {
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
            <h1>Taller "IA e Inclusión en la Educación Temprana"</h1>
            <p>Confirmación de Registro</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                <p>Estimado(a) ${nombre} ${apellido},</p>
            </div>
            
            <div class="highlight">
                <p>✅ Su registro al taller ha sido confirmado exitosamente</p>
            </div>
            
            <div class="info-card">
                <h3>📋 Información del Participante</h3>
                <div class="info-row">
                    <span class="info-label">Nombre Completo:</span>
                    <span class="info-value">${nombre} ${apellido}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Puesto:</span>
                    <span class="info-value">${puesto}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Grado que Imparte:</span>
                    <span class="info-value">${gradoClase}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Institución:</span>
                    <span class="info-value">${institucionProcedencia}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">WhatsApp:</span>
                    <span class="info-value">${whatsapp}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Experiencia con IA:</span>
                    <span class="info-value">${experienciaIA ? 'Sí' : 'No'}</span>
                </div>
            </div>
            
            <div class="event-details">
                <h3>🎯 Detalles del Taller</h3>
                <div class="event-date">Sábado 8 de Noviembre</div>
                <div class="event-time">⏰ 09:30 AM</div>
                <div class="event-description">
                    Te esperamos en nuestras instalaciones para participar en este importante taller
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>¡Esperamos verte en el taller!</strong></p>
            <div class="contact-info">
                <p><strong>Dirección Académica</strong></p>
                <p>📧 direccion.academica@winston93.edu.mx</p>
                <p>🌐 www.winston93.edu.mx</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('🚀 INICIO - Procesando registro del taller para:', formData.nombre);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    // Validar datos requeridos
    const requiredFields = ['nombre', 'apellido', 'puesto', 'gradoClase', 'institucionProcedencia', 'email', 'whatsapp'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Guardar en la base de datos
    const { data: registro, error: dbError } = await supabase
      .from('taller_ia')
      .insert([
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          puesto: formData.puesto,
          grado_clase: formData.gradoClase,
          institucion_procedencia: formData.institucionProcedencia,
          email: formData.email,
          whatsapp: formData.whatsapp,
          experiencia_ia: formData.experienciaIA || false,
          fecha_registro: new Date().toISOString()
        }
      ])
      .select();

    if (dbError) {
      console.error('Error al guardar en la base de datos:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar el registro' },
        { status: 500 }
      );
    }

    // Crear el template del email
    const emailHtml = createTallerEmailTemplate(formData);
    
    // Configurar el email de confirmación al participante
    const mailOptions = {
      from: {
        name: 'Taller IA e Inclusión - Directora Claudia',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: formData.email,
      subject: 'Confirmación de Registro - Taller "IA e Inclusión en la Educación Temprana"',
      html: emailHtml
    };

    // Enviar el email de confirmación
    await transporter.sendMail(mailOptions);
    
    // Enviar notificación a dirección académica
    const notificationMailOptions = {
      from: {
        name: 'Sistema de Registro - Taller IA',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: 'direccion.academica@winston93.edu.mx',
      subject: `📋 Nuevo Registro al Taller IA - ${formData.nombre} ${formData.apellido}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">📋 Nuevo Registro al Taller IA</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">IA e Inclusión en la Educación Temprana</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #667eea; margin-top: 0;">👤 Información del Participante</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">Nombre:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.nombre} ${formData.apellido}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Puesto:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.puesto}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Grado que Imparte:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.gradoClase}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Institución:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.institucionProcedencia}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">WhatsApp:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.whatsapp}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Experiencia con IA:</td>
                <td style="padding: 8px 0; color: #667eea;">${formData.experienciaIA ? 'Sí' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Registro:</td>
                <td style="padding: 8px 0; color: #667eea;">${new Date().toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">ID de Registro:</td>
                <td style="padding: 8px 0; color: #667eea; font-family: monospace;">${registro?.[0]?.id}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #e6fffa; border-left: 4px solid #38b2ac; border-radius: 5px;">
              <p style="margin: 0; color: #234e52; font-size: 14px;">
                <strong>📧 Email de confirmación enviado a:</strong> ${formData.email}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #38b2ac; color: white; border-radius: 10px;">
            <p style="margin: 0; font-weight: bold;">✅ Registro procesado exitosamente</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(notificationMailOptions);
    console.log('📧 Notificación enviada a dirección académica');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registro guardado y email enviado exitosamente',
      registroId: registro?.[0]?.id
    });
    
  } catch (error) {
    console.error('Error al procesar el registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
