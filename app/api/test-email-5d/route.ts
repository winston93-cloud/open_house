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

// Template de 5 días (el mismo que se usa en el sistema automático)
function getEmailTemplate5d(nombre: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Promoción especial - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; max-width: 100%;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #8b4513; margin: 0; font-size: 32px; font-weight: 700;">⏰ ${nombre}</h1>
                  <p style="color: #8b4513; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">¡Última oportunidad!</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <div style="background: linear-gradient(135deg, #fff5ba 0%, #ffeaa7 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; border: 3px dashed #fdcb6e;">
                    <p style="color: #d63031; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">
                      🎁 PROMOCIÓN ESPECIAL
                    </p>
                    <p style="color: #8b4513; font-size: 16px; margin: 0; font-weight: 600;">
                      Esta semana únicamente
                    </p>
                  </div>
                  
                  <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                    Hola ${nombre}, no queremos que pierdas esta oportunidad especial que tenemos preparada para ti y tu familia.
                  </p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; text-align: center;">
                        <p style="color: #8b4513; font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">
                          Beneficios exclusivos al inscribirte esta semana:
                        </p>
                        <p style="color: #8b4513; font-size: 15px; margin: 0; line-height: 1.8;">
                          ✨ Descuento especial en inscripción<br>
                          ✨ Asesoría personalizada sin costo<br>
                          ✨ Kit de bienvenida para tu hijo/a
                        </p>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #d63031; font-size: 16px; font-weight: 600; text-align: center; margin: 0 0 25px 0;">
                    ⏰ ¡No dejes pasar esta oportunidad!
                  </p>
                  
                  <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; text-align: center;">
                    <p style="color: #8b4513; font-size: 18px; font-weight: 700; margin: 0 0 15px 0;">📱 Contacta ahora por WhatsApp</p>
                    <p style="color: #8b4513; margin: 0 0 5px 0; font-size: 15px; font-weight: 600;">
                      Winston Churchill: 833 437 8743
                    </p>
                    <p style="color: #8b4513; margin: 0; font-size: 15px; font-weight: 600;">
                      Educativo Winston: 833 347 4507
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
                    🎁 Educación de excelencia al alcance de tu familia
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
    
    console.log(`📧 Enviando email de prueba (5 días) a ${emailPrueba}...`);
    
    // Enviar email con el template de 5 días
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: emailPrueba,
      subject: '🎁 [PRUEBA] ¡Última oportunidad! Promoción especial - Winston',
      html: getEmailTemplate5d(nombrePrueba)
    });
    
    console.log(`✅ Email de prueba (5 días) enviado exitosamente`);
    
    return NextResponse.json({
      success: true,
      message: 'Email de prueba (5 días) enviado exitosamente',
      to: emailPrueba,
      template: '5 días',
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

