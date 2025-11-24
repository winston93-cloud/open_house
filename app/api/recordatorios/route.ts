import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';

// =============================================================================
// CRON JOB: SISTEMA DE RECORDATORIOS POR EMAIL Y SMS
// =============================================================================
// Se ejecuta diariamente a las 9:00 AM hora de México (15:00 UTC)
// Envía recordatorios de Open House y Sesiones Informativas
// Última actualización: 22 noviembre 2025 - 17:21
// =============================================================================

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Template del email de recordatorio para Open House - MEJORADO PARA MÓVILES
const createReminderEmailTemplate = (formData: any) => {
  const { id, nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombre_padre, fechaEvento, horaEvento, institucionNombre } = formData;
  const nombreCompleto = nombre_padre || 'Familia';
  
  // NOTA: Los valores de fechaEvento, horaEvento e institucionNombre
  // deben pasarse desde sendReminderEmail() para que sean dinámicos y precisos

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
        
        /* MEJORAS PARA MÓVILES */
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .email-container {
                margin: 0;
                border-radius: 0;
                max-width: 100%;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 25px 15px;
            }
            .header h1 {
                font-size: 22px;
                line-height: 1.2;
            }
            .header .subtitle {
                font-size: 16px;
            }
            .reminder-badge {
                font-size: 12px;
                padding: 8px 16px;
                margin-bottom: 20px;
            }
            .welcome h2 {
                font-size: 22px;
                line-height: 1.3;
            }
            .welcome p {
                font-size: 16px;
            }
            .countdown-card {
                padding: 25px 15px;
                margin: 20px 0;
            }
            .countdown-number {
                font-size: 32px;
            }
            .countdown-text {
                font-size: 16px;
            }
            .info-card {
                padding: 20px 15px;
                margin: 20px 0;
            }
            .info-card h3 {
                font-size: 18px;
                margin-bottom: 15px;
            }
            .info-row {
                flex-direction: column;
                gap: 5px;
                text-align: left;
                margin: 12px 0;
                padding: 10px 0;
            }
            .info-label {
                font-size: 14px;
                font-weight: 700;
            }
            .info-value {
                font-size: 14px;
                text-align: left;
            }
            .event-details {
                padding: 25px 15px;
                margin: 20px 0;
            }
            .event-details h3 {
                font-size: 20px;
                margin-bottom: 15px;
            }
            .event-date {
                font-size: 24px;
                margin: 10px 0;
            }
            .event-time {
                font-size: 18px;
                margin: 8px 0;
            }
            .event-description {
                font-size: 14px;
                margin-top: 15px;
            }
            .cta-section {
                padding: 20px 15px;
                margin: 20px 0;
            }
            .cta-section h3 {
                font-size: 20px;
                margin-bottom: 10px;
            }
            .cta-section p {
                font-size: 14px;
            }
            .cta-section a {
                padding: 12px 24px;
                font-size: 14px;
            }
            .footer {
                padding: 25px 15px;
            }
            .footer h4 {
                font-size: 18px;
                margin-bottom: 15px;
            }
            .contact-info {
                padding: 15px;
                margin: 15px 0;
            }
            .contact-info p {
                font-size: 13px;
                margin: 6px 0;
            }
            .social-links a {
                padding: 8px 12px;
                font-size: 12px;
                margin: 0 5px;
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
                    <p style="text-align: center; margin-top: 15px; font-size: 18px; color: #1e3a8a; font-weight: 600;">¡Mañana es el gran día!</p>
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
                    <h3>¿Podrás asistir al evento?</h3>
                    <p>Por favor confirma tu asistencia haciendo clic en uno de los botones:</p>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://open-house-chi.vercel.app/asistencia?id=${id}&confirmacion=confirmado" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                            ✅ Sí, asistiré
                        </a>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                        Al hacer clic en cualquiera de los botones, serás dirigido a una página para confirmar tu respuesta.
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

// Template del email de recordatorio para Sesiones Informativas - MEJORADO PARA MÓVILES
const createSesionesReminderEmailTemplate = (formData: any) => {
  const { id, nombreAspirante, nivelAcademico, gradoEscolar, fechaNacimiento, nombre_padre, fechaEvento, horaEvento, institucionNombre } = formData;
  const nombreCompleto = nombre_padre || 'Familia';
  
  // NOTA: Los valores de fechaEvento, horaEvento e institucionNombre
  // deben pasarse desde sendSesionesReminderEmail() para que sean dinámicos y precisos

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
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
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
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
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
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: inline-block;
            margin-bottom: 25px;
            box-shadow: 0 4px 15px rgba(250, 157, 0, 0.4);
        }
        .welcome {
            margin-bottom: 35px;
        }
        .welcome h2 {
            color: #1e3a8a;
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 15px 0;
            line-height: 1.3;
        }
        .welcome p {
            color: #4a5568;
            font-size: 18px;
            margin: 0;
            line-height: 1.6;
            font-weight: 500;
        }
        .countdown-card {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 35px;
            border-radius: 20px;
            text-align: center;
            margin: 35px 0;
            box-shadow: 0 12px 35px rgba(16, 185, 129, 0.4);
        }
        .countdown-number {
            font-size: 64px;
            font-weight: 900;
            margin: 0;
            line-height: 1;
            text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .countdown-text {
            font-size: 18px;
            margin: 15px 0 0 0;
            opacity: 0.95;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 30px;
            margin: 35px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }
        .info-card h3 {
            color: #1e3a8a;
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 25px 0;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 18px 0;
            padding: 15px 0;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 700;
            color: #374151;
            font-size: 16px;
            flex: 1;
            text-align: left;
        }
        .info-value {
            color: #1e3a8a;
            font-size: 16px;
            font-weight: 700;
            flex: 1;
            text-align: right;
        }
        .event-details {
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
            color: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            margin: 40px 0;
            box-shadow: 0 15px 35px rgba(250, 157, 0, 0.4);
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
            background: linear-gradient(135deg, #fa9d00 0%, #ffb733 100%);
            color: white;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(250, 157, 0, 0.3);
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
        
        /* MEJORAS PARA MÓVILES */
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 10px;
            }
            .email-container {
                margin: 0;
                border-radius: 0;
                max-width: 100%;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 25px 15px;
            }
            .header h1 {
                font-size: 22px;
                line-height: 1.2;
            }
            .header .subtitle {
                font-size: 16px;
            }
            .reminder-badge {
                font-size: 12px;
                padding: 8px 16px;
                margin-bottom: 20px;
            }
            .welcome h2 {
                font-size: 22px;
                line-height: 1.3;
            }
            .welcome p {
                font-size: 16px;
            }
            .countdown-card {
                padding: 25px 15px;
                margin: 20px 0;
            }
            .countdown-number {
                font-size: 32px;
            }
            .countdown-text {
                font-size: 16px;
            }
            .info-card {
                padding: 20px 15px;
                margin: 20px 0;
            }
            .info-card h3 {
                font-size: 18px;
                margin-bottom: 15px;
            }
            .info-row {
                flex-direction: column;
                gap: 5px;
                text-align: left;
                margin: 12px 0;
                padding: 10px 0;
            }
            .info-label {
                font-size: 14px;
                font-weight: 700;
            }
            .info-value {
                font-size: 14px;
                text-align: left;
            }
            .event-details {
                padding: 25px 15px;
                margin: 20px 0;
            }
            .event-details h3 {
                font-size: 20px;
                margin-bottom: 15px;
            }
            .event-date {
                font-size: 24px;
                margin: 10px 0;
            }
            .event-time {
                font-size: 18px;
                margin: 8px 0;
            }
            .event-description {
                font-size: 14px;
                margin-top: 15px;
            }
            .cta-section {
                padding: 20px 15px;
                margin: 20px 0;
            }
            .cta-section h3 {
                font-size: 20px;
                margin-bottom: 10px;
            }
            .cta-section p {
                font-size: 14px;
            }
            .cta-section a {
                padding: 12px 24px;
                font-size: 14px;
            }
            .footer {
                padding: 25px 15px;
            }
            .footer h4 {
                font-size: 18px;
                margin-bottom: 15px;
            }
            .contact-info {
                padding: 15px;
                margin: 15px 0;
            }
            .contact-info p {
                font-size: 13px;
                margin: 6px 0;
            }
            .social-links a {
                padding: 8px 12px;
                font-size: 12px;
                margin: 0 5px;
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
                    <p class="subtitle">Sesión Informativa 2025 - Recordatorio</p>
                </div>
            </div>
            
            <div class="content">
                <div class="reminder-badge">🔔 Recordatorio</div>
                
                <div class="welcome">
                    <h2>¡No te olvides de nuestra Sesión Informativa!</h2>
                    <p>Estimado(a) ${nombreCompleto},</p>
                    <p style="margin-top: 15px; font-size: 18px; color: #1e3a8a; font-weight: 600;">¡Mañana es el gran día!</p>
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
                    <h3>¿Podrás asistir al evento?</h3>
                    <p>Por favor confirma tu asistencia haciendo clic en el botón:</p>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <a href="https://open-house-chi.vercel.app/asistencia?id=${id}&confirmacion=confirmado" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
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

// Función para obtener la información del evento según el nivel y tipo de formulario
const getEventInfo = (nivelAcademico: string, isOpenHouse: boolean = true) => {
  if (isOpenHouse) {
    // OPEN HOUSE
    if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
      return {
        fechaEvento: '29 de Noviembre',
        horaEvento: '9:00 AM',
        institucionNombre: 'Instituto Educativo Winston'
      };
    } else if (nivelAcademico === 'primaria') {
      return {
        fechaEvento: '6 de Diciembre',
        horaEvento: '9:00 AM - 11:30 AM',
        institucionNombre: 'Instituto Winston Churchill'
      };
    } else if (nivelAcademico === 'secundaria') {
      return {
        fechaEvento: '6 de Diciembre',
        horaEvento: '11:30 AM - 2:00 PM',
        institucionNombre: 'Instituto Winston Churchill'
      };
    }
  } else {
    // SESIONES INFORMATIVAS
    if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
      return {
        fechaEvento: '1 de Diciembre',
        horaEvento: '6:00 PM',
        institucionNombre: 'Instituto Educativo Winston'
      };
    } else if (nivelAcademico === 'primaria') {
      return {
        fechaEvento: '8 de Diciembre',
        horaEvento: '6:00 PM',
        institucionNombre: 'Instituto Winston Churchill'
      };
    } else if (nivelAcademico === 'secundaria') {
      return {
        fechaEvento: '9 de Diciembre',
        horaEvento: '6:00 PM',
        institucionNombre: 'Instituto Winston Churchill'
      };
    }
  }
  
  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill'
  };
};

// Función para enviar SMS de recordatorio
async function sendReminderSMS(telefono: string, mensaje: string): Promise<boolean> {
  try {
    if (!telefono || telefono.trim() === '') {
      console.log(`   ⚠️ Sin teléfono, omitiendo SMS...`);
      return false;
    }
    
    // Formatear teléfono
    let phone = telefono.toString().trim();
    if (!phone.startsWith('+52') && !phone.startsWith('52')) {
      phone = '+52' + phone;
    } else if (phone.startsWith('52') && !phone.startsWith('+')) {
      phone = '+' + phone;
    }
    
    console.log(`   📤 Enviando SMS de recordatorio a ${phone}...`);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message: mensaje })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Error SMS API: ${errorText}`);
      return false;
    }
    
    console.log(`   ✅ SMS de recordatorio enviado exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Error enviando SMS:`, error);
    return false;
  }
}

// Función para enviar email de recordatorio de Sesiones Informativas
const sendSesionesReminderEmail = async (sesion: any) => {
  try {
    const eventInfo = getEventInfo(sesion.nivel_academico, false); // false = Sesiones Informativas
    
    // Crear el template del email
    const emailHtml = createSesionesReminderEmailTemplate({
      id: sesion.id,
      nombreAspirante: sesion.nombre_aspirante,
      nivelAcademico: sesion.nivel_academico,
      gradoEscolar: sesion.grado_escolar,
      fechaNacimiento: sesion.fecha_nacimiento,
      nombre_padre: sesion.nombre_padre,
      fechaEvento: eventInfo.fechaEvento,
      horaEvento: eventInfo.horaEvento,
      institucionNombre: eventInfo.institucionNombre
    });
    
    const mailOptions = {
      from: {
        name: eventInfo.institucionNombre,
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: sesion.email,
      subject: `🔔 Recordatorio - Sesión Informativa ${eventInfo.institucionNombre} - ¡Mañana es el gran día!`,
      html: emailHtml
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Recordatorio enviado exitosamente a ${sesion.email}`);
    
    // Enviar SMS de recordatorio
    console.log(`📱 Preparando SMS para: ${sesion.telefono}`);
    const smsMessage = `Recordatorio Winston Sesion Informativa manana ${eventInfo.fechaEvento} a las ${eventInfo.horaEvento}. Confirma asistencia en https://open-house-chi.vercel.app/asistencia?id=${sesion.id}&confirmacion=confirmado`;
    
    console.log(`📝 Mensaje SMS: ${smsMessage.substring(0, 50)}...`);
    const smsResult = await sendReminderSMS(sesion.telefono, smsMessage);
    console.log(`📤 Resultado SMS: ${smsResult ? 'Enviado' : 'Falló'}`);
    
    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${sesion.email}:`, error);
    return { success: false, error };
  }
};

// Función para enviar email de recordatorio de Open House
const sendReminderEmail = async (inscripcion: any) => {
  try {
    const eventInfo = getEventInfo(inscripcion.nivel_academico, true); // true = Open House
    
    // Crear el template del email
    const emailHtml = createReminderEmailTemplate({
      id: inscripcion.id,
      nombreAspirante: inscripcion.nombre_aspirante,
      nivelAcademico: inscripcion.nivel_academico,
      gradoEscolar: inscripcion.grado_escolar,
      fechaNacimiento: inscripcion.fecha_nacimiento,
      nombre_padre: inscripcion.nombre_padre,
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
      subject: `🔔 Recordatorio - Open House ${eventInfo.institucionNombre} - ¡Mañana es el gran día!`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recordatorio enviado a: ${inscripcion.email}`);
    
    console.log(`🔍 DEBUG: Email enviado, ahora voy a procesar SMS...`);
    console.log(`🔍 DEBUG: Teléfono: ${inscripcion.telefono}`);
    console.log(`🔍 DEBUG: Tipo de teléfono: ${typeof inscripcion.telefono}`);
    
    // Enviar SMS de recordatorio
    console.log(`📱 Preparando SMS para: ${inscripcion.telefono}`);
    const smsMessage = `Recordatorio Winston Open House manana ${eventInfo.fechaEvento} a las ${eventInfo.horaEvento}. Confirma asistencia en https://open-house-chi.vercel.app/asistencia?id=${inscripcion.id}&confirmacion=confirmado`;
    
    console.log(`📝 Mensaje SMS: ${smsMessage.substring(0, 50)}...`);
    const smsResult = await sendReminderSMS(inscripcion.telefono, smsMessage);
    console.log(`📤 Resultado SMS: ${smsResult ? 'Enviado' : 'Falló'}`);
    
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
    // Log de inicio (sin validación de token para permitir cron jobs)
    console.log(`✅ [${logId}] Iniciando procesamiento (sin validación de token)`)

    console.log(`🔄 [${logId}] Iniciando procesamiento de recordatorios...`);
    
    // Buscar inscripciones que necesitan recordatorio (fecha programada = hoy)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Inicio del día de hoy (00:00:00)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Inicio de mañana (00:00:00)
    
    console.log(`📅 [${logId}] Calculando rangos de fecha:`);
    console.log(`📅 [${logId}] Fecha actual: ${now.toISOString()}`);
    console.log(`📅 [${logId}] Hoy (inicio 00:00): ${today.toISOString()}`);
    console.log(`📅 [${logId}] Mañana (inicio 00:00): ${tomorrow.toISOString()}`);
    
    console.log(`🔍 [${logId}] Ejecutando consulta a Supabase...`);
    console.log(`🔍 [${logId}] Buscando reminder_scheduled_for >= ${today.toISOString().split('T')[0]} AND < ${tomorrow.toISOString().split('T')[0]}`);
    
    const { data: inscripciones, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('reminder_scheduled_for', today.toISOString())
      .lt('reminder_scheduled_for', tomorrow.toISOString());
      
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
      console.log(`📋 [${logId}] Esto significa que no hay inscripciones programadas para hoy`);
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
      console.log(`   - Fecha programada: ${new Date(inscripcion.reminder_scheduled_for).toLocaleString('es-MX')}`);
      console.log(`   - Recordatorio enviado: ${inscripcion.reminder_sent}`);
    });
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Procesar cada inscripción
    for (let index = 0; index < inscripciones.length; index++) {
      const inscripcion = inscripciones[index];
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

    // ===== PROCESAR SESIONES INFORMATIVAS =====
    console.log(`\n📋 [${logId}] ===== PROCESANDO SESIONES INFORMATIVAS =====`);
    
    console.log(`🔍 [${logId}] Ejecutando consulta a Supabase para sesiones...`);
    console.log(`🔍 [${logId}] Buscando reminder_scheduled_for >= ${today.toISOString().split('T')[0]} AND < ${tomorrow.toISOString().split('T')[0]}`);
    
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesiones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('reminder_scheduled_for', today.toISOString())
      .lt('reminder_scheduled_for', tomorrow.toISOString());
      
    console.log(`📊 [${logId}] Resultado de la consulta de sesiones:`);
    console.log(`📊 [${logId}] Error: ${sesionesError ? 'SÍ' : 'NO'}`);
    if (sesionesError) console.log(`📊 [${logId}] Detalle del error:`, sesionesError);
    console.log(`📊 [${logId}] Sesiones encontradas: ${sesiones ? sesiones.length : 0}`);

    if (sesionesError) {
      console.error('Error al consultar sesiones:', sesionesError);
    } else if (sesiones && sesiones.length > 0) {
      console.log(`📧 [${logId}] Procesando ${sesiones.length} recordatorios de sesiones...`);
      
      // Log detallado de cada sesión encontrada
      sesiones.forEach((sesion, index) => {
        console.log(`📝 [${logId}] Sesión ${index + 1}:`);
        console.log(`   - ID: ${sesion.id}`);
        console.log(`   - Nombre: ${sesion.nombre_aspirante}`);
        console.log(`   - Email: ${sesion.email}`);
        console.log(`   - Fecha programada: ${new Date(sesion.reminder_scheduled_for).toLocaleString('es-MX')}`);
        console.log(`   - Recordatorio enviado: ${sesion.reminder_sent}`);
      });
      
      // Procesar cada sesión
      for (let index = 0; index < sesiones.length; index++) {
        const sesion = sesiones[index];
        console.log(`\n📤 [${logId}] Procesando sesión ${index + 1}/${sesiones.length}: ${sesion.email}`);
        
        try {
          console.log(`🔄 [${logId}] Enviando email a ${sesion.email}...`);
          const result = await sendSesionesReminderEmail(sesion);
          
          if (result.success) {
            console.log(`✅ [${logId}] Email enviado exitosamente a ${sesion.email}`);
            
            // Marcar como enviado en la base de datos
            console.log(`💾 [${logId}] Actualizando base de datos para ${sesion.email}...`);
            const { error: updateError } = await supabase
              .from('sesiones')
              .update({
                reminder_sent: true,
                reminder_sent_at: new Date().toISOString()
              })
              .eq('id', sesion.id);

            if (updateError) {
              console.error(`❌ [${logId}] Error al actualizar BD para ${sesion.email}:`, updateError);
            } else {
              console.log(`✅ [${logId}] Base de datos actualizada para ${sesion.email}`);
              successCount++;
              results.push({
                email: sesion.email,
                status: 'success',
                message: 'Recordatorio de sesión enviado exitosamente'
              });
            }
          } else {
            console.error(`❌ [${logId}] Error al enviar email a ${sesion.email}:`, result.error);
            errorCount++;
            results.push({
              email: sesion.email,
              status: 'error',
              message: 'Error al enviar recordatorio de sesión'
            });
          }
        } catch (error) {
          console.error(`❌ [${logId}] Error inesperado procesando ${sesion.email}:`, error);
          errorCount++;
          results.push({
            email: sesion.email,
            status: 'error',
            message: 'Error inesperado'
          });
        }
      }
    } else {
      console.log(`✅ [${logId}] No hay recordatorios de sesiones pendientes`);
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
      processed: (inscripciones?.length || 0) + (sesiones?.length || 0),
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
// Force rebuild vie 14 nov 2025 10:09:41 CST
