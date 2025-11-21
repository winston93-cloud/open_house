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

// Template de 48h (el mismo que se usa en el sistema automático)
function getEmailTemplate48h(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agenda tu recorrido - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">😊 ${nombre}</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">¿Te gustaría conocer nuestro campus?</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                    ¡Nos encantaría mostrarte nuestras instalaciones! 🏫
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                    <p style="color: #8b4513; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; text-align: center;">
                      📅 Agenda tu recorrido personalizado
                    </p>
                    <p style="color: #8b4513; font-size: 15px; margin: 0; text-align: center; line-height: 1.6;">
                      Conoce nuestras aulas, laboratorios, áreas deportivas y todo lo que Winston tiene para ofrecer a tu familia
                    </p>
                  </div>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                    Durante el recorrido podrás:
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c; margin-bottom: 10px;">
                        <p style="margin: 0; color: #333; font-size: 15px;">🎯 Conocer nuestro modelo educativo</p>
                      </td>
                    </tr>
                    <tr><td style="height: 8px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c;">
                        <p style="margin: 0; color: #333; font-size: 15px;">👥 Hablar con nuestro equipo académico</p>
                      </td>
                    </tr>
                    <tr><td style="height: 8px;"></td></tr>
                    <tr>
                      <td style="padding: 12px; background-color: #fff5f5; border-left: 4px solid #f5576c;">
                        <p style="margin: 0; color: #333; font-size: 15px;">💡 Resolver todas tus dudas</p>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; text-align: center;">
                    <p style="color: white; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">📱 Agenda ahora por WhatsApp</p>
                    <p style="color: rgba(255,255,255,0.95); margin: 0 0 5px 0; font-size: 15px;">
                      <strong>Winston Churchill:</strong> 833 437 8743
                    </p>
                    <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 15px;">
                      <strong>Educativo Winston:</strong> 833 347 4507
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fff5f5; padding: 30px; text-align: center;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Instituto Winston Churchill | Admisiones
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                    📅 Tu futuro comienza aquí
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function GET(request: NextRequest) {
  try {
    // Datos de prueba
    const emailPrueba = 'isc.escobedo@gmail.com';
    const nombrePrueba = 'Juanita Pérez';
    
    console.log(`📧 Enviando email de prueba (48h) a ${emailPrueba}...`);
    
    // Enviar email con el template de 48h
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: emailPrueba,
      subject: '📅 [PRUEBA] Agenda tu recorrido - Winston Churchill',
      html: getEmailTemplate48h(nombrePrueba)
    });
    
    console.log(`✅ Email de prueba (48h) enviado exitosamente`);
    
    return NextResponse.json({
      success: true,
      message: 'Email de prueba (48h) enviado exitosamente',
      to: emailPrueba,
      template: '48h',
      nombre: nombrePrueba
    });
    
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);
    return NextResponse.json(
      {
        error: 'Error al enviar email de prueba',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

