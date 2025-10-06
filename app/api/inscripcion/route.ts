import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Función para crear el template del email
const createEmailTemplate = (formData: any) => {
  const { nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombreCompleto, correo } = formData;
  
  // Determinar fecha y hora del evento según el nivel
  let fechaEvento, horaEvento, institucionNombre;
  
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    fechaEvento = '29 de noviembre de 2025';
    horaEvento = '9:00 AM';
    institucionNombre = 'Instituto Educativo Winston';
  } else if (nivelAcademico === 'primaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '9:00 AM a 11:30 AM';
    institucionNombre = 'Instituto Winston Churchill';
  } else if (nivelAcademico === 'secundaria') {
    fechaEvento = '6 de diciembre de 2025';
    horaEvento = '11:30 AM a 2:00 PM';
    institucionNombre = 'Instituto Winston Churchill';
  }

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
            color: #1e3a8a;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        .welcome p {
            color: #333;
            font-size: 16px;
            margin: 0;
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
            color: #1e3a8a;
            font-size: 20px;
            margin: 0 0 20px 0;
            text-align: center;
            font-weight: 700;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #495057;
            font-size: 14px;
        }
        .info-value {
            color: #1e3a8a;
            font-weight: 700;
            font-size: 14px;
        }
        .event-details {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            color: white;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
        }
        .event-details h3 {
            margin: 0 0 15px 0;
            font-size: 22px;
            font-weight: 700;
        }
        .event-date {
            font-size: 24px;
            font-weight: 700;
            margin: 10px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .event-time {
            font-size: 18px;
            opacity: 0.9;
            margin: 5px 0;
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
            color: #333;
            font-size: 14px;
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
            color: #333;
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
            .info-row {
                flex-direction: column;
                gap: 5px;
            }
            .event-date {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>${institucionNombre}</h1>
            <p>Open House 2025 - Confirmación de Inscripción</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                <h2>¡Bienvenido a nuestra familia!</h2>
                <p>Estimado(a) ${nombreCompleto},</p>
            </div>
            
            <div class="highlight">
                <p>✅ Su inscripción ha sido confirmada exitosamente</p>
            </div>
            
            <div class="info-card">
                <h3>📋 Información del Aspirante</h3>
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
                <p style="margin-top: 15px; font-size: 16px; opacity: 0.9;">
                    Te esperamos en nuestras instalaciones para conocer más sobre nuestro programa educativo
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>¡Esperamos verte pronto!</strong></p>
            <div class="contact-info">
                <p><strong>${institucionNombre}</strong></p>
                <p>📧 sistemas.desarrollo@winston93.edu.mx</p>
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
    const body = await request.json();
    const {
      nombreAspirante,
      nivelAcademico,
      gradoEscolar,
      fechaNacimiento,
      genero,
      escuelaProcedencia,
      nombreCompleto,
      correo,
      whatsapp,
      parentesco,
      personasAsistiran,
      medioEntero
    } = body;

    // Validaciones básicas
    if (!nombreAspirante || !nivelAcademico || !gradoEscolar || !fechaNacimiento || 
        !genero || !escuelaProcedencia || !nombreCompleto || !correo || 
        !whatsapp || !parentesco || !personasAsistiran || !medioEntero) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        { success: false, message: 'El formato del correo electrónico no es válido' },
        { status: 400 }
      );
    }

    // Enviar email de confirmación
    try {
      const emailHtml = createEmailTemplate({
        nombreAspirante,
        nivelAcademico,
        gradoEscolar,
        fechaNacimiento,
        nombreCompleto,
        correo
      });

      const mailOptions = {
        from: `"${nivelAcademico === 'maternal' || nivelAcademico === 'kinder' ? 'Instituto Educativo Winston' : 'Instituto Winston Churchill'}" <sistemas.desarrollo@winston93.edu.mx>`,
        to: correo,
        subject: '🎉 Confirmación de Inscripción - Open House Winston Churchill 2025',
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado exitosamente a:', correo);
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      // No fallar la inscripción si el email falla
    }

    return NextResponse.json({
      success: true,
      message: 'Inscripción registrada exitosamente. Se ha enviado un email de confirmación.',
      data: {
        nombreAspirante,
        nivelAcademico,
        gradoEscolar
      }
    });

  } catch (error) {
    console.error('Error al procesar inscripción:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
