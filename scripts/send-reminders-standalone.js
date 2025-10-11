#!/usr/bin/env node

/**
 * Script independiente para enviar recordatorios automáticos
 * Este script funciona sin depender de Next.js
 */

const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmxrccrbnoenkahefrrw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sistemas.desarrollo@winston93.edu.mx',
    pass: process.env.EMAIL_PASS
  }
});

// Template del email de recordatorio
const createReminderEmailTemplate = (formData) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto } = formData;
  
  // Determinar fecha y hora del evento según el nivel
  let fechaEvento, horaEvento, institucionNombre, diasRestantes;
  
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    fechaEvento = '29 de noviembre de 2025';
    horaEvento = '9:00 AM';
    institucionNombre = 'Instituto Educativo Winston';
    diasRestantes = 5; // En producción calcularías la diferencia real
  } else if (nivelAcademico === 'primaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '9:00 AM a 11:30 AM';
    institucionNombre = 'Instituto Winston Churchill';
    diasRestantes = 12;
  } else if (nivelAcademico === 'secundaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '11:30 AM a 2:00 PM';
    institucionNombre = 'Instituto Winston Churchill';
    diasRestantes = 12;
  }

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
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            letter-spacing: -0.5px;
        }
        .header .subtitle {
            margin: 15px 0 0 0;
            font-size: 18px;
            opacity: 0.95;
            font-weight: 500;
        }
        .content {
            padding: 50px 40px;
            background-color: #ffffff;
        }
        .reminder-badge {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 700;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
        }
        .welcome {
            text-align: center;
            margin-bottom: 40px;
        }
        .welcome h2 {
            color: #1e3a8a;
            font-size: 28px;
            margin: 0 0 15px 0;
            font-weight: 700;
            line-height: 1.2;
        }
        .welcome p {
            color: #4b5563;
            font-size: 18px;
            margin: 0;
            font-weight: 500;
            line-height: 1.6;
        }
        .countdown-card {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(30, 58, 138, 0.3);
            position: relative;
            overflow: hidden;
        }
        .countdown-number {
            font-size: 48px;
            font-weight: 900;
            margin: 10px 0;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .countdown-text {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        .info-card {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .info-card h3 {
            color: #1e3a8a;
            font-size: 22px;
            margin: 0 0 25px 0;
            text-align: center;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
            padding: 15px 0;
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.2s ease;
        }
        .info-row:hover {
            background-color: #f8fafc;
            border-radius: 8px;
            margin: 20px -10px;
            padding: 15px 10px;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 15px;
            flex: 1;
        }
        .info-value {
            color: #1e3a8a;
            font-weight: 700;
            font-size: 15px;
            flex: 1;
            text-align: right;
        }
        .event-details {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin: 40px 0;
            box-shadow: 0 15px 35px rgba(30, 58, 138, 0.4);
            position: relative;
            overflow: hidden;
        }
        .event-details h3 {
            margin: 0 0 25px 0;
            font-size: 26px;
            font-weight: 800;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .event-date {
            font-size: 32px;
            font-weight: 900;
            margin: 20px 0;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }
        .event-time {
            font-size: 22px;
            opacity: 0.95;
            margin: 15px 0;
            font-weight: 600;
            position: relative;
            z-index: 1;
        }
        .event-description {
            margin-top: 25px;
            font-size: 18px;
            opacity: 0.9;
            line-height: 1.6;
            font-weight: 500;
            position: relative;
            z-index: 1;
        }
        .cta-section {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            color: white;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
        .cta-section h3 {
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: 700;
        }
        .cta-section p {
            margin: 0;
            font-size: 16px;
            opacity: 0.95;
            line-height: 1.5;
        }
        .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer h4 {
            margin: 0 0 20px 0;
            color: #1e3a8a;
            font-size: 20px;
            font-weight: 700;
        }
        .contact-info {
            background: #ffffff;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        .contact-info p {
            margin: 8px 0;
            font-size: 14px;
            color: #4b5563;
            font-weight: 500;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            padding: 10px 15px;
            background: #1e3a8a;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: background-color 0.3s ease;
        }
        .social-links a:hover {
            background: #1e40af;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .info-row {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }
            .info-value {
                text-align: center;
            }
            .event-date {
                font-size: 24px;
            }
            .countdown-number {
                font-size: 36px;
            }
            .event-details {
                padding: 30px 20px;
            }
            .footer {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header-gradient">
                <div class="header">
                    <h1>${institucionNombre}</h1>
                    <p class="subtitle">Open House 2025 - Recordatorio de Evento</p>
                </div>
            </div>
            
            <div class="content">
                <div class="reminder-badge">🔔 Recordatorio</div>
                
                <div class="welcome">
                    <h2>✨ ¡Mañana es el gran día! ✨</h2>
                    <p>Estimado(a) ${nombreCompleto},</p>
                </div>
                
                <div class="countdown-card">
                    <div class="countdown-number">${diasRestantes}</div>
                    <div class="countdown-text">días restantes</div>
                </div>
                
                <div class="event-details">
                    <h3>🎉 Detalles del Evento</h3>
                    <div class="event-description">
                        Les recordamos que mañana los esperamos en nuestro Open House de <strong>${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}</strong>, una experiencia diseñada para que conozcan de cerca nuestro modelo educativo, recorran nuestras instalaciones y descubran por qué somos una comunidad que trabaja por un futuro más brillante. ✨
                    </div>
                    <div class="info-card">
                        <div class="info-row">
                            <span class="info-label">📅 Fecha:</span>
                            <span class="info-value">${fechaEvento}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">🕐 Hora:</span>
                            <span class="info-value">${horaEvento}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📍 Lugar:</span>
                            <span class="info-value">Instituto Winston Churchill — Calle 3 #309 Col. Jardin 20 de Noviembre Cd. Madero Tamaulipas</span>
                        </div>
                    </div>
                    <div class="cta-section">
                        <p>Será un gusto recibirlos 😊</p>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <h4>${institucionNombre}</h4>
                <div class="contact-info">
                    <p><strong>📧 Email:</strong> sistemas.desarrollo@winston93.edu.mx</p>
                    <p><strong>🌐 Sitio Web:</strong> www.winston93.edu.mx</p>
                    <p><strong>📞 Teléfono:</strong> 833 347 4507</p>
                </div>
                <div class="social-links">
                    <a href="mailto:sistemas.desarrollo@winston93.edu.mx">Contactar</a>
                    <a href="https://www.winston93.edu.mx">Visitar Sitio</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para calcular días restantes hasta el evento
const calculateDaysUntilEvent = (nivelAcademico) => {
  const now = new Date();
  
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    const eventDate = new Date('2025-11-29');
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else if (nivelAcademico === 'primaria' || nivelAcademico === 'secundaria') {
    const eventDate = new Date('2025-12-06');
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  return 0;
};

// Función para obtener la información del evento según el nivel
const getEventInfo = (nivelAcademico) => {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEvento: '29 de noviembre de 2025',
      horaEvento: '9:00 AM',
      institucionNombre: 'Instituto Educativo Winston'
    };
  } else if (nivelAcademico === 'primaria') {
    return {
      fechaEvento: '6 de diciembre de 2025',
      horaEvento: '9:00 AM a 11:30 AM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  } else if (nivelAcademico === 'secundaria') {
    return {
      fechaEvento: '6 de diciembre de 2025',
      horaEvento: '11:30 AM a 2:00 PM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  }
  
  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill'
  };
};

// Función para enviar email de recordatorio
const sendReminderEmail = async (inscripcion) => {
  try {
    const diasRestantes = calculateDaysUntilEvent(inscripcion.nivel_academico);
    const eventInfo = getEventInfo(inscripcion.nivel_academico);
    
    // Crear el template del email con los días restantes calculados
    const emailHtml = createReminderEmailTemplate({
      nombreAspirante: inscripcion.nombre_aspirante,
      nivelAcademico: inscripcion.nivel_academico,
      gradoEscolar: inscripcion.grado_escolar,
      fechaNacimiento: inscripcion.fecha_nacimiento,
      nombreCompleto: inscripcion.nombre_padre,
      diasRestantes,
      fechaEvento: eventInfo.fechaEvento,
      horaEvento: eventInfo.horaEvento,
      institucionNombre: eventInfo.institucionNombre
    });
    
    const mailOptions = {
      from: {
        name: eventInfo.institucionNombre,
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: inscripcion.email,
      subject: `🔔 Recordatorio - Open House ${eventInfo.institucionNombre} (${diasRestantes} días restantes)`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recordatorio enviado a: ${inscripcion.email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${inscripcion.email}:`, error);
    return { success: false, error };
  }
};

// Función principal
async function sendReminders() {
  try {
    console.log('🔄 Iniciando envío de recordatorios...');
    
    // Buscar inscripciones que necesitan recordatorio (de ayer)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día de hoy
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Ayer
    
    const { data: inscripciones, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    if (dbError) {
      console.error('Error al consultar inscripciones:', dbError);
      return;
    }

    if (!inscripciones || inscripciones.length === 0) {
      console.log('✅ No hay recordatorios pendientes');
      return;
    }

    console.log(`📧 Procesando ${inscripciones.length} recordatorios...`);
    
    let successCount = 0;
    let errorCount = 0;

    // Procesar cada inscripción
    for (const inscripcion of inscripciones) {
      try {
        const result = await sendReminderEmail(inscripcion);
        
        if (result.success) {
          // Marcar como enviado en la base de datos
          const { error: updateError } = await supabase
            .from('inscripciones')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString()
            })
            .eq('id', inscripcion.id);

          if (updateError) {
            console.error(`Error al actualizar recordatorio para ${inscripcion.email}:`, updateError);
          } else {
            successCount++;
            console.log(`✅ Recordatorio enviado exitosamente a: ${inscripcion.email}`);
          }
        } else {
          errorCount++;
          console.error(`❌ Error al enviar recordatorio a: ${inscripcion.email}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Error procesando recordatorio para ${inscripcion.email}:`, error);
      }
    }

    console.log(`✅ Procesamiento completado: ${successCount} exitosos, ${errorCount} errores`);

  } catch (error) {
    console.error('Error general en procesamiento de recordatorios:', error);
  }
}

// Función para verificar el estado del sistema
async function checkSystemStatus() {
  try {
    // Buscar recordatorios pendientes (de ayer)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: pendingReminders, error } = await supabase
      .from('inscripciones')
      .select('id, email, nombre_aspirante, nivel_academico, created_at, reminder_sent')
      .eq('reminder_sent', false)
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al consultar recordatorios pendientes:', error);
      return;
    }

    console.log(`📊 Estado del sistema: ${pendingReminders?.length || 0} recordatorios pendientes`);
    
    if (pendingReminders && pendingReminders.length > 0) {
      console.log('📋 Recordatorios pendientes:');
      pendingReminders.forEach((reminder, index) => {
        const daysSinceRegistration = Math.floor(
          (new Date() - new Date(reminder.created_at)) / (1000 * 60 * 60 * 24)
        );
        console.log(`  ${index + 1}. ${reminder.email} (${reminder.nivel_academico}) - ${daysSinceRegistration} días desde registro`);
      });
    }
    
  } catch (error) {
    console.error('Error al verificar estado del sistema:', error);
  }
}

// Función principal del script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status') || args.includes('-s')) {
    await checkSystemStatus();
  } else {
    await sendReminders();
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n⏹️ Script interrumpido por el usuario');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Script terminado por el sistema');
  process.exit(0);
});

// Ejecutar el script principal
main().then(() => {
  console.log('🏁 Script completado exitosamente');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal en el script:', error);
  process.exit(1);
});
