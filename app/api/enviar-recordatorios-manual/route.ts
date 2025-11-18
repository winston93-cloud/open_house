import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';

// =============================================================================
// ENDPOINT MANUAL: ENVIAR RECORDATORIOS DEL DÍA
// =============================================================================
// Envía recordatorios programados para HOY
// Se ejecuta manualmente desde el navegador cuando lo necesites
// URL: https://open-house-chi.vercel.app/api/enviar-recordatorios-manual
// =============================================================================

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Template del email de recordatorio para Open House
const createReminderEmailTemplate = (formData: any) => {
  const { id, nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombre_padre, fechaEvento, horaEvento, institucionNombre } = formData;
  const nombreCompleto = nombre_padre || 'Familia';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio - Open House Winston Churchill</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            position: relative;
        }
        .header-gradient {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
            position: relative;
            overflow: hidden;
        }
        .header {
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            z-index: 1;
        }
        .reminder-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .info-card {
            background: linear-gradient(135deg, #f6f8fb 0%, #ffffff 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
        }
        .info-row {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 16px;
        }
        .icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .footer {
            background: #f6f8fb;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .info-card {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header-gradient">
                <div class="header">
                    <div class="reminder-badge">📧 Recordatorio</div>
                    <h1>¡Mañana es el gran día!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Open House - ${institucionNombre}</p>
                </div>
            </div>

            <div class="content">
                <p style="font-size: 18px; color: #1e293b; margin-bottom: 20px;">
                    Estimado/a <strong>${nombreCompleto}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    Le recordamos que <strong>mañana</strong> tenemos el gusto de recibirle en nuestro Open House para conocer más sobre la educación de su hijo/a.
                </p>

                <div class="info-card">
                    <div style="font-size: 18px; font-weight: 600; color: #1e40af; margin-bottom: 15px;">
                        📋 Información del Evento
                    </div>
                    <div class="info-row">
                        <span class="icon">👤</span>
                        <div>
                            <strong>Aspirante:</strong><br>
                            ${nombreAspirante}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">📚</span>
                        <div>
                            <strong>Nivel:</strong><br>
                            ${nivelAcademico?.charAt(0).toUpperCase() + nivelAcademico?.slice(1)}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">📅</span>
                        <div>
                            <strong>Fecha:</strong><br>
                            ${fechaEvento}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">⏰</span>
                        <div>
                            <strong>Horario:</strong><br>
                            ${horaEvento}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">🏫</span>
                        <div>
                            <strong>Institución:</strong><br>
                            ${institucionNombre}
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://open-house-chi.vercel.app/asistencia?id=${id}" class="cta-button">
                        ✅ Confirmar mi Asistencia
                    </a>
                </div>

                <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
                    ¡Esperamos verle mañana! Si tiene alguna pregunta, no dude en contactarnos.
                </p>
            </div>

            <div class="footer">
                <p style="margin: 5px 0;"><strong>${institucionNombre}</strong></p>
                <p style="margin: 5px 0;">📞 Teléfono: ${institucionNombre.includes('Educativo') ? '833 347 4507' : '833 437 8743'}</p>
                <p style="margin: 5px 0;">📧 Email: ${institucionNombre.includes('Educativo') ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}</p>
                <p style="margin: 15px 0 5px 0; font-size: 12px; color: #94a3b8;">
                    Este es un recordatorio automático. Por favor no responda a este correo.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Template para Sesiones Informativas
const createSesionesReminderEmailTemplate = (formData: any) => {
  const { id, nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombre_padre, fechaEvento, horaEvento, institucionNombre } = formData;
  const nombreCompleto = nombre_padre || 'Familia';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio - Sesión Informativa Winston Churchill</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            position: relative;
        }
        .header-gradient {
            background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%);
            position: relative;
            overflow: hidden;
        }
        .header {
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            z-index: 1;
        }
        .reminder-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 15px;
            backdrop-filter: blur(10px);
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .info-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
        }
        .info-row {
            display: flex;
            align-items: center;
            margin: 15px 0;
            font-size: 16px;
        }
        .icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 30px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #047857 100%);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        .footer {
            background: #f0fdf4;
            padding: 30px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .header h1 {
                font-size: 24px;
            }
            .content {
                padding: 20px 15px;
            }
            .info-card {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header-gradient">
                <div class="header">
                    <div class="reminder-badge">📧 Recordatorio</div>
                    <h1>¡Mañana es el gran día!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Sesión Informativa - ${institucionNombre}</p>
                </div>
            </div>

            <div class="content">
                <p style="font-size: 18px; color: #1e293b; margin-bottom: 20px;">
                    Estimado/a <strong>${nombreCompleto}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    Le recordamos que <strong>mañana</strong> tenemos el gusto de recibirle en nuestra Sesión Informativa para conocer más sobre la educación de su hijo/a.
                </p>

                <div class="info-card">
                    <div style="font-size: 18px; font-weight: 600; color: #047857; margin-bottom: 15px;">
                        📋 Información del Evento
                    </div>
                    <div class="info-row">
                        <span class="icon">👤</span>
                        <div>
                            <strong>Aspirante:</strong><br>
                            ${nombreAspirante}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">📚</span>
                        <div>
                            <strong>Nivel:</strong><br>
                            ${nivelAcademico?.charAt(0).toUpperCase() + nivelAcademico?.slice(1)}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">📅</span>
                        <div>
                            <strong>Fecha:</strong><br>
                            ${fechaEvento}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">⏰</span>
                        <div>
                            <strong>Horario:</strong><br>
                            ${horaEvento}
                        </div>
                    </div>
                    <div class="info-row">
                        <span class="icon">🏫</span>
                        <div>
                            <strong>Institución:</strong><br>
                            ${institucionNombre}
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://open-house-chi.vercel.app/asistencia?id=${id}" class="cta-button">
                        ✅ Confirmar mi Asistencia
                    </a>
                </div>

                <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 20px;">
                    ¡Esperamos verle mañana! Si tiene alguna pregunta, no dude en contactarnos.
                </p>
            </div>

            <div class="footer">
                <p style="margin: 5px 0;"><strong>${institucionNombre}</strong></p>
                <p style="margin: 5px 0;">📞 Teléfono: ${institucionNombre.includes('Educativo') ? '833 347 4507' : '833 437 8743'}</p>
                <p style="margin: 5px 0;">📧 Email: ${institucionNombre.includes('Educativo') ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}</p>
                <p style="margin: 15px 0 5px 0; font-size: 12px; color: #94a3b8;">
                    Este es un recordatorio automático. Por favor no responda a este correo.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para obtener información del evento según nivel
function getEventInfo(nivelAcademico: string) {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEvento: 'Sábado 29 de noviembre de 2025',
      horaEvento: '9:00 AM',
      institucionNombre: 'Instituto Educativo Winston',
      telefono: '833 347 4507',
      emailContacto: 'recepcioniew@winston93.edu.mx',
      sitioWeb: 'winstonkinder.edu.mx',
      direccion: 'C. 2 209, Jardín 20 de Noviembre, 89440 Cd Madero, Tamps.'
    };
  } else if (nivelAcademico === 'primaria') {
    return {
      fechaEvento: 'Sábado 6 de diciembre de 2025',
      horaEvento: '9:00 a 11:30 AM',
      institucionNombre: 'Instituto Winston Churchill',
      telefono: '833 437 8743',
      emailContacto: 'vinculacionw@winston93.edu.mx',
      sitioWeb: 'winston93.edu.mx',
      direccion: 'Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas'
    };
  } else if (nivelAcademico === 'secundaria') {
    return {
      fechaEvento: 'Sábado 6 de diciembre de 2025',
      horaEvento: '11:30 AM a 2:00 PM',
      institucionNombre: 'Instituto Winston Churchill',
      telefono: '833 437 8743',
      emailContacto: 'vinculacionw@winston93.edu.mx',
      sitioWeb: 'winston93.edu.mx',
      direccion: 'Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas'
    };
  }
  
  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill',
    telefono: '833 437 8743',
    emailContacto: 'vinculacionw@winston93.edu.mx',
    sitioWeb: 'winston93.edu.mx',
    direccion: 'Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas'
  };
}

// Función para enviar email
async function sendReminderEmail(inscripcion: any, isOpenHouse: boolean = true) {
  try {
    const eventInfo = getEventInfo(inscripcion.nivel_academico);
    
    const templateData = {
      id: inscripcion.id,
      nombreAspirante: inscripcion.nombre_aspirante,
      nivelAcademico: inscripcion.nivel_academico,
      gradoEscolar: inscripcion.grado_escolar,
      fechaNacimiento: inscripcion.fecha_nacimiento,
      nombre_padre: inscripcion.nombre_padre,
      fechaEvento: eventInfo.fechaEvento,
      horaEvento: eventInfo.horaEvento,
      institucionNombre: eventInfo.institucionNombre
    };

    const emailHtml = isOpenHouse 
      ? createReminderEmailTemplate(templateData)
      : createSesionesReminderEmailTemplate(templateData);
    
    const mailOptions = {
      from: {
        name: eventInfo.institucionNombre,
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: inscripcion.email,
      subject: `¡Mañana es el gran día! - ${isOpenHouse ? 'Open House' : 'Sesión Informativa'} Winston Churchill`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}

// Endpoint GET y POST
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const startTime = new Date();
  const logId = `MANUAL_REMINDER_${startTime.getTime()}`;
  
  console.log(`\n🚀 [${logId}] ===== ENVÍO MANUAL DE RECORDATORIOS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  
  try {
    // Calcular rangos de fecha (HOY)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`📅 [${logId}] Buscando recordatorios para HOY:`);
    console.log(`📅 [${logId}] Desde: ${today.toISOString()}`);
    console.log(`📅 [${logId}] Hasta: ${tomorrow.toISOString()}`);
    
    // Buscar en INSCRIPCIONES (Open House)
    const { data: inscripciones, error: inscError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('reminder_scheduled_for', today.toISOString())
      .lt('reminder_scheduled_for', tomorrow.toISOString());
    
    // Buscar en SESIONES (Sesiones Informativas)
    const { data: sesiones, error: sesError } = await supabase
      .from('sesiones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('reminder_scheduled_for', today.toISOString())
      .lt('reminder_scheduled_for', tomorrow.toISOString());
    
    if (inscError || sesError) {
      console.error(`❌ [${logId}] Error en consultas:`, { inscError, sesError });
      return NextResponse.json({
        success: false,
        error: 'Error al consultar la base de datos'
      }, { status: 500 });
    }
    
    const totalInscripciones = inscripciones?.length || 0;
    const totalSesiones = sesiones?.length || 0;
    const totalTotal = totalInscripciones + totalSesiones;
    
    console.log(`📊 [${logId}] Encontrados:`);
    console.log(`   - Open House: ${totalInscripciones}`);
    console.log(`   - Sesiones: ${totalSesiones}`);
    console.log(`   - TOTAL: ${totalTotal}`);
    
    if (totalTotal === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay recordatorios programados para hoy',
        processed: 0,
        openHouse: 0,
        sesiones: 0
      });
    }
    
    const results = {
      openHouse: { sent: 0, errors: 0, emails: [] as string[] },
      sesiones: { sent: 0, errors: 0, emails: [] as string[] }
    };
    
    // Procesar Open House
    if (inscripciones && inscripciones.length > 0) {
      console.log(`\n📧 [${logId}] Procesando Open House...`);
      for (const inscripcion of inscripciones) {
        const result = await sendReminderEmail(inscripcion, true);
        if (result.success) {
          await supabase
            .from('inscripciones')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString()
            })
            .eq('id', inscripcion.id);
          
          results.openHouse.sent++;
          results.openHouse.emails.push(inscripcion.email);
          console.log(`   ✅ ${inscripcion.email}`);
        } else {
          results.openHouse.errors++;
          console.log(`   ❌ ${inscripcion.email}`);
        }
      }
    }
    
    // Procesar Sesiones
    if (sesiones && sesiones.length > 0) {
      console.log(`\n📧 [${logId}] Procesando Sesiones Informativas...`);
      for (const sesion of sesiones) {
        const result = await sendReminderEmail(sesion, false);
        if (result.success) {
          await supabase
            .from('sesiones')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString()
            })
            .eq('id', sesion.id);
          
          results.sesiones.sent++;
          results.sesiones.emails.push(sesion.email);
          console.log(`   ✅ ${sesion.email}`);
        } else {
          results.sesiones.errors++;
          console.log(`   ❌ ${sesion.email}`);
        }
      }
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n🏁 [${logId}] ===== PROCESO COMPLETADO =====`);
    console.log(`⏱️ [${logId}] Duración: ${duration}ms`);
    console.log(`✅ [${logId}] Open House: ${results.openHouse.sent}/${totalInscripciones}`);
    console.log(`✅ [${logId}] Sesiones: ${results.sesiones.sent}/${totalSesiones}`);
    
    return NextResponse.json({
      success: true,
      message: 'Recordatorios enviados exitosamente',
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      results: {
        openHouse: {
          processed: totalInscripciones,
          sent: results.openHouse.sent,
          errors: results.openHouse.errors,
          emails: results.openHouse.emails
        },
        sesiones: {
          processed: totalSesiones,
          sent: results.sesiones.sent,
          errors: results.sesiones.errors,
          emails: results.sesiones.emails
        }
      }
    });
    
  } catch (error) {
    console.error(`❌ [${logId}] Error:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

