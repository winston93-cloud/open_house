import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';
import { getEmailTemplate24h } from '../../../lib/email-templates';

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

