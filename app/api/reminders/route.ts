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

// Template del email de recordatorio
const createReminderEmailTemplate = (formData: any) => {
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
                    <h2>¡No te olvides de nuestro Open House!</h2>
                    <p>Estimado(a) ${nombreCompleto},</p>
                </div>
                
                <div class="countdown-card">
                    <div class="countdown-number">${diasRestantes}</div>
                    <div class="countdown-text">días restantes</div>
                </div>
                
                <div class="info-card">
                    <h3>👤 Información del Aspirante</h3>
                    <div class="info-row">
                        <span class="info-label">Nombre del Aspirante:</span>
                        <span class="info-value">${nombreAspirante}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nivel Académico:</span>
                        <span class="info-value">${nivelAcademico.charAt(0).toUpperCase() + nivelAcademico.slice(1)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Grado Escolar:</span>
                        <span class="info-value">${gradoEscolar}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Fecha de Nacimiento:</span>
                        <span class="info-value">${fechaNacimiento}</span>
                    </div>
                </div>
                
                <div class="event-details">
                    <h3>🎉 Detalles del Evento</h3>
                    <div class="event-date">${fechaEvento}</div>
                    <div class="event-time">⏰ ${horaEvento}</div>
                    <div class="event-description">
                        Te esperamos en nuestras instalaciones para conocer más sobre nuestro programa educativo y resolver todas tus dudas.
                    </div>
                </div>
                
                <div class="cta-section">
                    <h3>¡Nos vemos pronto!</h3>
                    <p>Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.</p>
                </div>
            </div>
            
            <div class="footer">
                <h4>${institucionNombre}</h4>
                <div class="contact-info">
                    <p><strong>📧 Email:</strong> vinculacionw@winston93.edu.mx</p>
                    <p><strong>🌐 Sitio Web:</strong> www.winston93.edu.mx</p>
                    <p><strong>📞 Teléfono:</strong> 833 347 4507</p>
                </div>
                <div class="social-links">
                    <a href="mailto:vinculacionw@winston93.edu.mx">Contactar</a>
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
const calculateDaysUntilEvent = (nivelAcademico: string): number => {
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
const getEventInfo = (nivelAcademico: string) => {
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
const sendReminderEmail = async (inscripcion: any) => {
  try {
    const diasRestantes = calculateDaysUntilEvent(inscripcion.nivel_academico);
    const eventInfo = getEventInfo(inscripcion.nivel_academico);
    
    // Crear el template del email con los días restantes calculados
    const emailHtml = createReminderEmailTemplate({
      ...inscripcion,
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

// Endpoint POST para procesar recordatorios (llamado por el cron job)
export async function POST(request: NextRequest) {
  const startTime = new Date();
  const logId = `REMINDER_${startTime.getTime()}`;
  
  console.log(`\n🚀 [${logId}] ===== INICIO DE PROCESAMIENTO DE RECORDATORIOS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  console.log(`🌍 [${logId}] Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  try {
    // Verificar que la petición viene de una fuente autorizada
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REMINDER_API_TOKEN || 'default-secret-token';
    
    console.log(`🔐 [${logId}] Verificando autorización...`);
    console.log(`🔐 [${logId}] Auth header presente: ${authHeader ? 'SÍ' : 'NO'}`);
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      console.log(`❌ [${logId}] Autorización fallida`);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    console.log(`✅ [${logId}] Autorización exitosa`);

    console.log(`🔄 [${logId}] Iniciando procesamiento de recordatorios...`);
    
    // Buscar inscripciones que necesitan recordatorio (de ayer)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día de hoy
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // Ayer
    
    console.log(`📅 [${logId}] Calculando rangos de fecha:`);
    console.log(`📅 [${logId}] Fecha actual: ${new Date().toISOString()}`);
    console.log(`📅 [${logId}] Hoy (inicio): ${today.toISOString()}`);
    console.log(`📅 [${logId}] Ayer (inicio): ${yesterday.toISOString()}`);
    
    console.log(`🔍 [${logId}] Ejecutando consulta a Supabase...`);
    const { data: inscripciones, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());
      
    console.log(`📊 [${logId}] Resultado de la consulta:`);
    console.log(`📊 [${logId}] Error: ${dbError ? 'SÍ' : 'NO'}`);
    if (dbError) console.log(`📊 [${logId}] Detalle del error:`, dbError);
    console.log(`📊 [${logId}] Inscripciones encontradas: ${inscripciones ? inscripciones.length : 0}`);

    if (dbError) {
      console.error('Error al consultar inscripciones:', dbError);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos' },
        { status: 500 }
      );
    }

    if (!inscripciones || inscripciones.length === 0) {
      console.log(`✅ [${logId}] No hay recordatorios pendientes`);
      console.log(`📋 [${logId}] Esto significa que no hay inscripciones de ayer que necesiten recordatorio`);
      return NextResponse.json({
        success: true,
        message: 'No hay recordatorios pendientes',
        processed: 0,
        logId
      });
    }

    console.log(`📧 [${logId}] Procesando ${inscripciones.length} recordatorios...`);
    
    // Log detallado de cada inscripción encontrada
    inscripciones.forEach((inscripcion, index) => {
      console.log(`📝 [${logId}] Inscripción ${index + 1}:`);
      console.log(`   - ID: ${inscripcion.id}`);
      console.log(`   - Nombre: ${inscripcion.nombre_aspirante}`);
      console.log(`   - Email: ${inscripcion.email}`);
      console.log(`   - Fecha creación: ${new Date(inscripcion.created_at).toLocaleString('es-MX')}`);
      console.log(`   - Recordatorio enviado: ${inscripcion.reminder_sent}`);
    });
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Procesar cada inscripción
    for (const [index, inscripcion] of inscripciones.entries()) {
      console.log(`\n📤 [${logId}] Procesando inscripción ${index + 1}/${inscripciones.length}: ${inscripcion.email}`);
      
      try {
        console.log(`🔄 [${logId}] Enviando email a ${inscripcion.email}...`);
        const result = await sendReminderEmail(inscripcion);
        
        if (result.success) {
          console.log(`✅ [${logId}] Email enviado exitosamente a ${inscripcion.email}`);
          
          // Marcar como enviado en la base de datos
          console.log(`💾 [${logId}] Actualizando base de datos para ${inscripcion.email}...`);
          const { error: updateError } = await supabase
            .from('inscripciones')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString()
            })
            .eq('id', inscripcion.id);

          if (updateError) {
            console.error(`❌ [${logId}] Error al actualizar BD para ${inscripcion.email}:`, updateError);
          } else {
            console.log(`✅ [${logId}] Base de datos actualizada para ${inscripcion.email}`);
            successCount++;
            results.push({
              email: inscripcion.email,
              status: 'success',
              message: 'Recordatorio enviado exitosamente'
            });
          }
        } else {
          console.error(`❌ [${logId}] Error al enviar email a ${inscripcion.email}:`, result.error);
          errorCount++;
          results.push({
            email: inscripcion.email,
            status: 'error',
            message: 'Error al enviar recordatorio'
          });
        }
      } catch (error) {
        console.error(`❌ [${logId}] Error inesperado procesando ${inscripcion.email}:`, error);
        errorCount++;
        results.push({
          email: inscripcion.email,
          status: 'error',
          message: 'Error inesperado'
        });
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n🏁 [${logId}] ===== FINALIZACIÓN DEL PROCESAMIENTO =====`);
    console.log(`✅ [${logId}] Procesamiento completado: ${successCount} exitosos, ${errorCount} errores`);
    console.log(`⏱️ [${logId}] Duración total: ${duration}ms`);
    console.log(`📅 [${logId}] Fecha de finalización: ${endTime.toLocaleString('es-MX')}`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);

    return NextResponse.json({
      success: true,
      message: 'Procesamiento de recordatorios completado',
      processed: inscripciones.length,
      successful: successCount,
      errors: errorCount,
      results,
      logId,
      duration: `${duration}ms`,
      timestamp: endTime.toISOString()
    });

  } catch (error) {
    const endTime = new Date();
    console.error(`\n💥 [${logId}] ===== ERROR CRÍTICO =====`);
    console.error(`❌ [${logId}] Error general en procesamiento de recordatorios:`, error);
    console.error(`📅 [${logId}] Fecha del error: ${endTime.toLocaleString('es-MX')}`);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        logId,
        timestamp: endTime.toISOString(),
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar el estado del sistema de recordatorios
export async function GET() {
  try {
    const { data: pendingReminders, error } = await supabase
      .from('inscripciones')
      .select('id, email, nombre_aspirante, nivel_academico, created_at, reminder_sent')
      .eq('reminder_sent', false)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error al consultar recordatorios pendientes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pendingReminders: pendingReminders || [],
      count: pendingReminders?.length || 0
    });
  } catch (error) {
    console.error('Error al obtener estado de recordatorios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}