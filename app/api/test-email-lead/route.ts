import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';

// Importar la función desde el archivo sms-cron
// Como no puedo importarla directamente, la recreo aquí
function getEmailTemplate24h(nombre: string, plantel: string = 'winston'): string {
  // Configuración dinámica según plantel
  const isWinston = plantel === 'winston';
  const institucion = isWinston ? 'INSTITUTO WINSTON CHURCHILL' : 'INSTITUTO EDUCATIVO WINSTON';
  const whatsappNumber = isWinston ? '528334378743' : '528333474507';
  const whatsappDisplay = isWinston ? '833 437 87 43' : '833 347 45 07';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; max-width: 100%;">
              
              <!-- Logo Winston -->
              <tr>
                <td style="padding: 30px 40px 0 40px; text-align: right;">
                  <div style="font-size: 28px; font-weight: 900; color: #0066CC; letter-spacing: -1px;">
                    <span style="color: #0066CC;">W</span><span style="color: #00A8E1;">inston</span>
                  </div>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px 50px 40px;">
                  
                  <!-- RECORDATORIO -->
                  <div style="margin-bottom: 25px;">
                    <h2 style="color: #0066CC; font-size: 22px; font-weight: 700; margin: 0 0 5px 0; letter-spacing: 1px;">RECORDATORIO</h2>
                    <div style="width: 140px; height: 3px; background-color: #0066CC;"></div>
                  </div>
                  
                  <!-- HOLA TE RECORDAMOS -->
                  <h1 style="color: #00A8E1; font-size: 36px; font-weight: 900; margin: 0 0 20px 0; line-height: 1.2; letter-spacing: -0.5px;">
                    HOLA<br>TE RECORDAMOS
                  </h1>
                  
                  <!-- Texto principal -->
                  <p style="color: #00A8E1; font-size: 15px; font-weight: 600; margin: 0 0 25px 0; line-height: 1.5;">
                    que estamos disponibles para apoyarte con el proceso de admisión al
                  </p>
                  
                  <p style="color: #00A8E1; font-size: 18px; font-weight: 900; margin: 0 0 30px 0; letter-spacing: 0.5px;">
                    ${institucion}
                  </p>
                  
                  <!-- Escríbenos al -->
                  <p style="color: #0066CC; font-size: 15px; font-weight: 700; margin: 0 0 10px 0;">
                    Escríbenos al
                  </p>
                  
                  <!-- Número WhatsApp -->
                  <div style="margin-bottom: 25px;">
                    <a href="https://wa.me/${whatsappNumber}" style="color: #0066CC; font-size: 28px; font-weight: 900; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                      <span style="font-size: 24px;">💬</span> ${whatsappDisplay}
                    </a>
                  </div>
                  
                  <!-- CON GUSTO -->
                  <p style="color: #0066CC; font-size: 16px; font-weight: 900; margin: 0 0 30px 0;">
                    CON GUSTO
                  </p>
                  <p style="color: #00A8E1; font-size: 15px; font-weight: 600; margin: 0 0 35px 0;">
                    te brindamos toda la información necesaria.
                  </p>
                  
                  <!-- Botón CONTÁCTANOS -->
                  <div style="text-align: center;">
                    <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background: linear-gradient(135deg, #7CC344 0%, #6BB236 100%); color: white; text-decoration: none; padding: 16px 50px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(124,195,68,0.4);">
                      ➜ CONTÁCTANOS
                    </a>
                  </div>
                  
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

export async function GET(request: NextRequest) {
  const logId = `TEST_EMAIL_LEAD_${Date.now()}`;
  console.log(`\n🚀 [${logId}] ===== PRUEBA DE EMAIL 24H CON PLANTEL =====`);

  try {
    // Obtener el lead de prueba
    const { data: lead, error: dbError } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('email', 'isc.escobedo@gmail.com')
      .single();

    if (dbError || !lead) {
      console.error(`❌ [${logId}] Error al obtener lead:`, dbError);
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    console.log(`📋 [${logId}] Lead encontrado:`);
    console.log(`   - Nombre: ${lead.nombre}`);
    console.log(`   - Email: ${lead.email}`);
    console.log(`   - Plantel: ${lead.plantel}`);
    console.log(`   - Teléfono: ${lead.telefono}`);

    // Generar email con el plantel correcto
    const emailTemplate = getEmailTemplate24h(lead.nombre, lead.plantel);

    console.log(`\n📧 [${logId}] Enviando email de prueba...`);

    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: lead.email,
      subject: '👋 Admisiones Winston - Estamos aquí para ayudarte',
      html: emailTemplate
    });

    console.log(`✅ [${logId}] Email enviado exitosamente`);

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado',
      lead: {
        nombre: lead.nombre,
        email: lead.email,
        plantel: lead.plantel,
        telefono: lead.telefono
      }
    });

  } catch (error) {
    console.error(`❌ [${logId}] Error inesperado:`, error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    console.log(`🏁 [${logId}] ===== FIN DE PRUEBA DE EMAIL 24H =====\n`);
  }
}

