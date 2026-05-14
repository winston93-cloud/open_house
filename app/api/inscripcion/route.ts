import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';
import { createKommoLead, determinePlantel } from '../../../lib/kommo';
import { getOpenHouseEventConfig, OPEN_HOUSE_EDICION_ACTUAL } from '../../../lib/open-house-event';




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
    <title>Confirmación de Inscripción - Open House</title>
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
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
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
            color: #1e3a8a !important;
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
            border: 2px solid #1e3a8a;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h3 {
            color: #1e3a8a !important;
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
            color: #1e3a8a !important;
            font-weight: 700;
            font-size: 14px;
            display: table-cell;
            width: 60%;
            vertical-align: top;
            word-wrap: break-word;
        }
        .event-details {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
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
            <p>Open House 2026 - Confirmación de Inscripción</p>
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
                <p>📧 ${institucionNombre === 'Instituto Educativo Winston' ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}</p>
                <p>🌐 ${institucionNombre === 'Instituto Educativo Winston' ? 'www.winstonkinder.edu.mx' : 'www.winston93.edu.mx'}</p>
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
    <title>Confirmación de Inscripción - Open House</title>
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
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
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
            color: #1e3a8a !important;
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
            border: 2px solid #1e3a8a;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h3 {
            color: #1e3a8a !important;
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
            color: #1e3a8a !important;
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
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            box-shadow: 0 4px 15px rgba(30, 58, 138, 0.3);
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
            <p>Open House 2026 - Confirmación de Inscripción</p>
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
                <p>📧 ${institucionNombre === 'Instituto Educativo Winston' ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}</p>
                <p>🌐 ${institucionNombre === 'Instituto Educativo Winston' ? 'www.winstonkinder.edu.mx' : 'www.winston93.edu.mx'}</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para crear el template del email
const createEmailTemplate = (formData: any) => {
  const ev = getOpenHouseEventConfig(formData.nivelAcademico);
  if (!ev) {
    return createChurchillTemplate(
      formData,
      'Fecha no especificada',
      'Hora no especificada',
      'Instituto Winston Churchill'
    );
  }
  const { fechaEventoMail, horaEventoMail, institucionNombre } = ev;
  if (formData.nivelAcademico === 'maternal' || formData.nivelAcademico === 'kinder') {
    return createEducativoTemplate(formData, fechaEventoMail, horaEventoMail, institucionNombre);
  }
  return createChurchillTemplate(formData, fechaEventoMail, horaEventoMail, institucionNombre);
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    // Log para detectar múltiples ejecuciones
    console.log('🚀 INICIO - Procesando inscripción para:', formData.nombreCompleto);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    // Validar datos requeridos
    const requiredFields = ['nombreAspirante', 'nivelAcademico', 'gradoEscolar', 'fechaNacimiento', 'nombreCompleto', 'correo', 'medioEntero'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const ev = getOpenHouseEventConfig(formData.nivelAcademico);
    if (!ev) {
      console.error('❌ Nivel académico no válido:', formData.nivelAcademico);
      return NextResponse.json(
        { error: `Nivel académico no válido: ${formData.nivelAcademico}. Debe ser: maternal, kinder, primaria o secundaria` },
        { status: 400 }
      );
    }
    const reminderDate = new Date(ev.reminderDateStr);

    // Guardar en la base de datos
    const { data: inscripcion, error: dbError } = await supabase
      .from('inscripciones')
      .insert([
        {
          nombre_aspirante: formData.nombreAspirante,
          nivel_academico: formData.nivelAcademico,
          grado_escolar: formData.gradoEscolar,
          fecha_nacimiento: formData.fechaNacimiento,
          nombre_padre: formData.nombreCompleto,
          nombre_madre: formData.nombreCompleto, // Asumiendo que es el mismo para ambos padres
          telefono: formData.telefono || '',
          whatsapp: '',
          email: formData.correo,
          direccion: formData.direccion || '',
          fecha_inscripcion: new Date().toISOString(),
          reminder_sent: false,
          reminder_scheduled_for: reminderDate.toISOString(),
          ciclo_escolar: '2026', // Año para eventos de junio 2026
          edicion_open_house: OPEN_HOUSE_EDICION_ACTUAL,
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

    // ===== INTEGRACIÓN KOMMO ===== CREAR LEAD Y ENVIAR WHATSAPP
    try {
      console.log('🚀 Creando lead en Kommo y enviando WhatsApp...');
      
      // Determinar el plantel basado en el nivel académico
      const plantel = determinePlantel(formData);
      
      // Crear lead en Kommo (esto también envía el WhatsApp automáticamente)
      const notaLead = `${ev.notaKommoBase}\n\nAspirante: ${formData.nombreAspirante}\nGrado: ${formData.gradoEscolar}`;

      const leadId = await createKommoLead({
        name: formData.nombreCompleto,
        phone: formData.telefono || '',
        email: formData.correo,
        plantel: plantel,
        nivelAcademico: formData.nivelAcademico,
        gradoEscolar: formData.gradoEscolar,
        nombreAspirante: formData.nombreAspirante,
        notaLead,
      });
      
      console.log(`✅ Lead creado exitosamente con ID: ${leadId}`);
      console.log(`📱 WhatsApp de confirmación enviado automáticamente`);
      
    } catch (kommoError) {
      console.error('❌ Error en integración Kommo:', kommoError);
    }

    // ===== ENVIAR SMS DE CONFIRMACIÓN =====
    if (formData.telefono) {
      try {
        console.log('📱 Enviando SMS de confirmación...');
        
        const waUrl =
          formData.nivelAcademico === 'maternal' || formData.nivelAcademico === 'kinder'
            ? 'https://wa.me/528333474507'
            : 'https://wa.me/528334378743';
        const mensaje = `✅ Open House 2026: ${formData.nombreAspirante}. ${ev.smsEventoCorto}. Rec. 1 día antes por correo. ${waUrl} 🏫`;
        
        // Formatear teléfono
        let phone = formData.telefono.toString().trim();
        if (!phone.startsWith('+52') && !phone.startsWith('52')) {
          phone = '+52' + phone;
        } else if (phone.startsWith('52') && !phone.startsWith('+')) {
          phone = '+' + phone;
        }
        
        // Enviar SMS
        const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message: mensaje })
        });
        
        if (smsResponse.ok) {
          console.log('✅ SMS de confirmación enviado exitosamente');
        } else {
          console.error('❌ Error al enviar SMS:', await smsResponse.text());
        }
        
      } catch (smsError) {
        console.error('❌ Error al enviar SMS de confirmación:', smsError);
        // No retornamos error para que el proceso continúe
      }
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
      subject: 'Confirmación de Inscripción - Open House 2026',
      html: emailHtml
    };

    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    // Enviar copia a sistemas.desarrollo@winston93.edu.mx
    const copyMailOptions = {
      from: {
        name: 'Sistema de Inscripciones - Open House 2026',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: 'sistemas.desarrollo@winston93.edu.mx',
      subject: `📋 Nueva Inscripción - ${formData.nombreCompleto} (${formData.nivelAcademico})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">📋 Nueva Inscripción Registrada</h2>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Open House 2026</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #1e3a8a; margin-top: 0;">👤 Información del Aspirante</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 40%;">Nombre del Aspirante:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${formData.nombreAspirante}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nivel Académico:</td>
                <td style="padding: 8px 0; color: #1e3a8a; text-transform: capitalize;">${formData.nivelAcademico}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Grado Escolar:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${formData.gradoEscolar}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha del Open House:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${ev.fechaEventoMail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Horario del evento:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${ev.horaEventoMail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Nacimiento:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${formData.fechaNacimiento}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${formData.correo}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fecha de Inscripción:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${new Date().toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">ID de Inscripción:</td>
                <td style="padding: 8px 0; color: #1e3a8a; font-family: monospace;">${inscripcion?.[0]?.id}</td>
              </tr>
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 5px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>📧 Email de confirmación enviado a:</strong> ${formData.correo}
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
    console.log('📧 Copia de inscripción enviada a sistemas.desarrollo@winston93.edu.mx');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inscripción guardada y email enviado exitosamente',
      inscripcionId: inscripcion?.[0]?.id
    });
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
