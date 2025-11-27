import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import * as nodemailer from 'nodemailer';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Template del email de 24h (importado de sms-cron)
function getEmailTemplate24h(nombre: string): string {
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
                    INSTITUTO WINSTON CHURCHILL
                  </p>
                  
                  <!-- Escríbenos al -->
                  <p style="color: #0066CC; font-size: 15px; font-weight: 700; margin: 0 0 10px 0;">
                    Escríbenos al
                  </p>
                  
                  <!-- Número WhatsApp -->
                  <div style="margin-bottom: 25px;">
                    <a href="https://wa.me/528334378743" style="color: #0066CC; font-size: 28px; font-weight: 900; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                      <span style="font-size: 24px;">💬</span> 833 437 87 43
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
                    <a href="https://wa.me/528334378743" style="display: inline-block; background: linear-gradient(135deg, #7CC344 0%, #6BB236 100%); color: white; text-decoration: none; padding: 16px 50px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(124,195,68,0.4);">
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

export async function GET(request: NextRequest) {
  const logId = `TEST_24H_${Date.now()}`;
  
  console.log(`\n🧪 [${logId}] ===== PRUEBA EMAIL 24H =====`);
  
  try {
    // Buscar el registro específico
    const { data: lead, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('id', '63543351-30f5-4591-944f-e992ded9a769')
      .single();
    
    if (error || !lead) {
      console.error('❌ Error al buscar lead:', error);
      return NextResponse.json({ success: false, error: 'Lead no encontrado' }, { status: 404 });
    }
    
    console.log(`📋 [${logId}] Lead encontrado: ${lead.nombre} (${lead.email})`);
    
    // Enviar email de 24h
    const emailHtml = getEmailTemplate24h(lead.nombre);
    
    const mailOptions = {
      from: {
        name: 'Admisiones Winston Churchill',
        address: 'sistemas.desarrollo@winston93.edu.mx'
      },
      to: lead.email,
      subject: '👋 Admisiones Winston - Estamos aquí para ayudarte',
      html: emailHtml
    };
    
    console.log(`📧 [${logId}] Enviando email a ${lead.email}...`);
    
    await transporter.sendMail(mailOptions);
    
    console.log(`✅ [${logId}] Email enviado exitosamente`);
    
    return NextResponse.json({
      success: true,
      mensaje: 'Email de prueba 24h enviado',
      destinatario: {
        nombre: lead.nombre,
        email: lead.email,
        telefono: lead.telefono
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ [${logId}] Error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

