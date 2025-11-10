import { NextRequest, NextResponse } from 'next/server';

// FUNCIONES COPIADAS EXACTAMENTE DEL CÓDIGO DE PRODUCCIÓN (reminders/route.ts) - SIN MODIFICAR
// Template del email de recordatorio para Sesiones Informativas - MEJORADO PARA MÓVILES
const createSesionesReminderEmailTemplate = (formData: any) => {
  const { id, nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto, diasRestantes, fechaEvento, horaEvento, institucionNombre } = formData;
  
  // Formatear grado escolar con guión medio
  const gradoFormateado = gradoEscolar
    ? gradoEscolar
        .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
        .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
        .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2')
    : gradoEscolar;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio - Sesión Informativa Winston Churchill</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); min-height: 100vh; }
        .email-wrapper { background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); padding: 20px; min-height: 100vh; }
        .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15); position: relative; }
        .header-gradient { background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); position: relative; overflow: hidden; }
        .header { color: white; padding: 40px 30px; text-align: center; position: relative; z-index: 1; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); letter-spacing: -0.5px; }
        .header .subtitle { margin: 15px 0 0 0; font-size: 18px; opacity: 0.95; font-weight: 500; }
        .content { padding: 50px 40px; background-color: #ffffff; }
        .reminder-badge { background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); color: white; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(250, 157, 0, 0.4); }
        .welcome { margin-bottom: 35px; }
        .welcome h2 { color: #1e3a8a; font-size: 28px; font-weight: 800; margin: 0 0 15px 0; line-height: 1.3; }
        .welcome p { color: #4a5568; font-size: 18px; margin: 0; line-height: 1.6; font-weight: 500; }
        .countdown-card { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 35px; border-radius: 20px; text-align: center; margin: 35px 0; box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4); }
        .countdown-number { font-size: 64px; font-weight: 900; margin: 0; line-height: 1; text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
        .countdown-text { font-size: 18px; margin: 15px 0 0 0; opacity: 0.95; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
        .info-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #e5e7eb; border-radius: 16px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); }
        .info-card h3 { color: #1e3a8a; font-size: 22px; font-weight: 800; margin: 0 0 25px 0; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-row { display: flex; justify-content: space-between; align-items: center; margin: 18px 0; padding: 15px 0; border-bottom: 2px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: 700; color: #374151; font-size: 16px; flex: 1; text-align: left; }
        .info-value { color: #1e3a8a; font-size: 16px; font-weight: 700; flex: 1; text-align: right; }
        .event-details { background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); color: white; border-radius: 20px; padding: 40px; text-align: center; margin: 40px 0; box-shadow: 0 15px 35px rgba(250, 157, 0, 0.4); position: relative; overflow: hidden; }
        .event-details h3 { margin: 0 0 25px 0; font-size: 26px; font-weight: 800; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); position: relative; z-index: 1; }
        .event-date { font-size: 32px; font-weight: 900; margin: 20px 0; text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); position: relative; z-index: 1; }
        .event-time { font-size: 22px; opacity: 0.95; margin: 15px 0; font-weight: 600; position: relative; z-index: 1; }
        .event-description { margin-top: 25px; font-size: 18px; opacity: 0.9; line-height: 1.6; font-weight: 500; position: relative; z-index: 1; }
        .cta-section { background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%); color: white; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 8px 25px rgba(250, 157, 0, 0.3); }
        .cta-section h3 { margin: 0 0 15px 0; font-size: 24px; font-weight: 700; }
        .cta-section p { margin: 0; font-size: 16px; opacity: 0.95; line-height: 1.5; }
        .footer { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 40px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer h4 { margin: 0 0 20px 0; color: #1e3a8a; font-size: 20px; font-weight: 700; }
        .contact-info { background: #ffffff; border-radius: 12px; padding: 25px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); }
        .contact-info p { margin: 8px 0; font-size: 14px; color: #4b5563; font-weight: 500; }
        .social-links { margin-top: 20px; }
        .social-links a { display: inline-block; margin: 0 10px; padding: 10px 15px; background: #1e3a8a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.3s ease; }
        .social-links a:hover { background: #1e40af; }
        @media (max-width: 600px) {
            .email-wrapper { padding: 10px; }
            .email-container { margin: 0; border-radius: 0; max-width: 100%; }
            .content { padding: 20px 15px; }
            .header { padding: 25px 15px; }
            .header h1 { font-size: 22px; line-height: 1.2; }
            .header .subtitle { font-size: 16px; }
            .reminder-badge { font-size: 12px; padding: 8px 16px; margin-bottom: 20px; }
            .welcome h2 { font-size: 22px; line-height: 1.3; }
            .welcome p { font-size: 16px; }
            .countdown-card { padding: 25px 15px; margin: 20px 0; }
            .countdown-number { font-size: 32px; }
            .countdown-text { font-size: 16px; }
            .info-card { padding: 20px 15px; margin: 20px 0; }
            .info-card h3 { font-size: 18px; margin-bottom: 15px; }
            .info-row { flex-direction: column; gap: 5px; text-align: left; margin: 12px 0; padding: 10px 0; }
            .info-label { font-size: 14px; font-weight: 700; }
            .info-value { font-size: 14px; text-align: left; }
            .event-details { padding: 25px 15px; margin: 20px 0; }
            .event-details h3 { font-size: 20px; margin-bottom: 15px; }
            .event-date { font-size: 24px; margin: 10px 0; }
            .event-time { font-size: 18px; margin: 8px 0; }
            .event-description { font-size: 14px; margin-top: 15px; }
            .cta-section { padding: 20px 15px; margin: 20px 0; }
            .cta-section h3 { font-size: 20px; margin-bottom: 10px; }
            .cta-section p { font-size: 14px; }
            .cta-section a { padding: 12px 24px; font-size: 14px; }
            .footer { padding: 25px 15px; }
            .footer h4 { font-size: 18px; margin-bottom: 15px; }
            .contact-info { padding: 15px; margin: 15px 0; }
            .contact-info p { font-size: 13px; margin: 6px 0; }
            .social-links a { padding: 8px 12px; font-size: 12px; margin: 0 5px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header-gradient">
                <div class="header">
                    <h1>${institucionNombre}</h1>
                    <p class="subtitle">Sesión Informativa 2025 - Recordatorio</p>
                </div>
            </div>
            
            <div class="content">
                <div class="reminder-badge">🔔 Recordatorio</div>
                
                <div class="welcome">
                    <h2>¡No te olvides de nuestra Sesión Informativa!</h2>
                    <p>Estimado(a) ${nombreCompleto},</p>
                </div>
                
                <div class="countdown-card">
                    <div class="countdown-number">${diasRestantes}</div>
                    <div class="countdown-text">día restante</div>
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
                        <span class="info-value">${gradoFormateado}</span>
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
                    <h3>¿Podrás asistir al evento?</h3>
                    <p>Por favor confirma tu asistencia haciendo clic en el botón:</p>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://open-house-chi.vercel.app/asistencia?id=${id || 'test-id'}&confirmacion=confirmado" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                            ✅ Sí, asistiré
                        </a>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                        Al hacer clic en el botón, serás dirigido a una página para confirmar tu respuesta.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <h4>${institucionNombre}</h4>
                <div class="contact-info">
                    <p><strong>📧 Email:</strong> ${institucionNombre === 'Instituto Educativo Winston' ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}</p>
                    <p><strong>🌐 Sitio Web:</strong> ${institucionNombre === 'Instituto Educativo Winston' ? 'www.winstonkinder.edu.mx' : 'www.winston93.edu.mx'}</p>
                    <p><strong>📞 Teléfono:</strong> ${institucionNombre === 'Instituto Educativo Winston' ? '833 347 4507' : '833 437 8743'}</p>
                </div>
                <div class="social-links">
                    <a href="mailto:${institucionNombre === 'Instituto Educativo Winston' ? 'recepcioniew@winston93.edu.mx' : 'vinculacionw@winston93.edu.mx'}">Contactar</a>
                    <a href="https://${institucionNombre === 'Instituto Educativo Winston' ? 'www.winstonkinder.edu.mx' : 'www.winston93.edu.mx'}">Visitar Sitio</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// Función para obtener la información del evento según el nivel - IGUAL QUE PRODUCCIÓN
const getEventInfo = (nivelAcademico: string) => {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEvento: 'Lunes 1 de Diciembre',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Educativo Winston'
    };
  } else if (nivelAcademico === 'primaria') {
    return {
      fechaEvento: 'Lunes 8 de Diciembre',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  } else if (nivelAcademico === 'secundaria') {
    return {
      fechaEvento: 'Martes 9 de Diciembre',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  }
  
  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill'
  };
};

// Función para calcular días restantes hasta el evento - IGUAL QUE PRODUCCIÓN
const calculateDaysUntilEvent = (nivelAcademico: string): number => {
  const now = new Date();
  
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    const eventDate = new Date('2025-12-01'); // 1 de Diciembre
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else if (nivelAcademico === 'primaria') {
    const eventDate = new Date('2025-12-08'); // 8 de Diciembre
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  } else if (nivelAcademico === 'secundaria') {
    const eventDate = new Date('2025-12-09'); // 9 de Diciembre
    const diffTime = eventDate.getTime() - now.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }
  
  return 1; // Por defecto 1 día restante
};

// Este endpoint es SOLO para pruebas de visualización del email de RECORDATORIO
// NO envía correos, solo genera el HTML del template
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validar que se proporcionaron los datos mínimos
    if (!formData.nombreAspirante || !formData.nivelAcademico || !formData.nombreCompleto) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: nombreAspirante, nivelAcademico, nombreCompleto' },
        { status: 400 }
      );
    }

    // Calcular días restantes y obtener info del evento
    const diasRestantes = calculateDaysUntilEvent(formData.nivelAcademico);
    const eventInfo = getEventInfo(formData.nivelAcademico);
    
    // Generar el template del email usando la misma función de producción
    // IMPORTANTE: Esto NO modifica nada de producción
    const emailHtml = createSesionesReminderEmailTemplate({
      ...formData,
      id: formData.id || 'test-id',
      diasRestantes,
      fechaEvento: eventInfo.fechaEvento,
      horaEvento: eventInfo.horaEvento,
      institucionNombre: eventInfo.institucionNombre
    });

    return NextResponse.json({
      success: true,
      html: emailHtml,
      message: 'Email de recordatorio generado correctamente (NO enviado)',
      datosUsados: {
        nombreAspirante: formData.nombreAspirante,
        nivelAcademico: formData.nivelAcademico,
        nombreCompleto: formData.nombreCompleto,
        diasRestantes,
        fechaEvento: eventInfo.fechaEvento,
        horaEvento: eventInfo.horaEvento,
        institucionNombre: eventInfo.institucionNombre
      }
    });

  } catch (error) {
    console.error('Error al generar email de prueba:', error);
    return NextResponse.json(
      { 
        error: 'Error al generar el email', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}