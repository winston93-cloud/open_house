import { NextRequest, NextResponse } from 'next/server';
import * as nodemailer from 'nodemailer';
import { getEmailTemplate24h, getEmailTemplate72h, getEmailTemplate5d } from '../../../lib/email-templates';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

export async function GET(request: NextRequest) {
  const logId = `TEST_ALL_WINSTON_${Date.now()}`;
  console.log(`\n🚀 [${logId}] ===== ENVIANDO 3 EMAILS DE WINSTON =====`);

  const emailDestino = 'isc.escobedo@gmail.com';
  const nombreLead = 'JUANITA HERNANDEZ';
  const plantel = 'winston';

  try {
    console.log(`📧 Enviando a: ${emailDestino}`);
    console.log(`👤 Nombre: ${nombreLead}`);
    console.log(`🏫 Plantel: ${plantel}`);
    console.log(`\n📨 Enviando 3 emails de seguimiento WINSTON...\n`);

    // EMAIL 1: 24 horas
    console.log(`1️⃣ Enviando email de 24 horas...`);
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: emailDestino,
      subject: '👋 Admisiones Winston - Estamos aquí para ayudarte',
      html: getEmailTemplate24h(nombreLead, plantel)
    });
    console.log(`✅ Email 24h enviado`);

    // Espera 2 segundos entre envíos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // EMAIL 2: 72 horas
    console.log(`2️⃣ Enviando email de 72 horas...`);
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: emailDestino,
      subject: '📅 Agenda tu recorrido - Winston Churchill',
      html: getEmailTemplate72h(nombreLead, plantel)
    });
    console.log(`✅ Email 72h enviado`);

    // Espera 2 segundos entre envíos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // EMAIL 3: 5 días
    console.log(`3️⃣ Enviando email de 5 días...`);
    await transporter.sendMail({
      from: '"Instituto Winston Churchill" <sistemas.desarrollo@winston93.edu.mx>',
      to: emailDestino,
      subject: '🎁 ¡Última oportunidad! Promoción especial - Winston',
      html: getEmailTemplate5d(nombreLead, plantel)
    });
    console.log(`✅ Email 5d enviado`);

    console.log(`\n✅ Los 3 emails de WINSTON fueron enviados exitosamente\n`);

    return NextResponse.json({
      success: true,
      message: 'Los 3 emails de seguimiento de WINSTON fueron enviados',
      detalles: {
        destinatario: emailDestino,
        nombre: nombreLead,
        plantel: plantel,
        emails_enviados: [
          { tipo: '24h', subject: 'Admisiones Winston - Estamos aquí para ayudarte' },
          { tipo: '72h', subject: 'Agenda tu recorrido - Winston Churchill' },
          { tipo: '5d', subject: '¡Última oportunidad! Promoción especial - Winston' }
        ]
      }
    });

  } catch (error) {
    console.error(`❌ [${logId}] Error al enviar emails:`, error);
    return NextResponse.json(
      { error: 'Error al enviar emails', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  } finally {
    console.log(`🏁 [${logId}] ===== FIN DE ENVÍO DE EMAILS WINSTON =====\n`);
  }
}

