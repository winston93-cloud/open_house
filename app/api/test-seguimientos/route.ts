import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getEmailTemplate24h, getEmailTemplate72h, getEmailTemplate5d } from '@/lib/email-templates';

// Configurar el transportador de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Enviando emails de prueba de seguimientos...');
    
    const destinatarios = [
      { email: 'isc.escobedo@gmail.com', telefono: '8333246904', nombre: 'Mario Escobedo' },
      { email: 'sistemas.desarrollo@winston93.edu.mx', telefono: '8331491483', nombre: 'Sistemas' },
      { email: 'isc.escobedo@gmail.com', telefono: '8331078297', nombre: 'Test User' }
    ];
    
    const results = [];
    
    for (const dest of destinatarios) {
      console.log(`\n📧 Enviando seguimientos a ${dest.email}...`);
      
      // Datos de prueba del lead
      const plantel = 'winston';
      
      // 1. Email de 24 horas
      const email24h = getEmailTemplate24h(dest.nombre, plantel);
      
      await transporter.sendMail({
        from: {
          name: 'Instituto Educativo Winston',
          address: 'sistemas.desarrollo@winston93.edu.mx'
        },
        to: dest.email,
        subject: '📱 Seguimiento 24h - Instituto Winston',
        html: email24h
      });
      
      console.log(`✅ Email 24h enviado a ${dest.email}`);
      
      // Esperar 2 segundos entre emails
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 2. Email de 72 horas
      const email72h = getEmailTemplate72h(dest.nombre, plantel);
      
      await transporter.sendMail({
        from: {
          name: 'Instituto Educativo Winston',
          address: 'sistemas.desarrollo@winston93.edu.mx'
        },
        to: dest.email,
        subject: '📞 Seguimiento 72h - Instituto Winston',
        html: email72h
      });
      
      console.log(`✅ Email 72h enviado a ${dest.email}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Email de 5 días
      const email5d = getEmailTemplate5d(dest.nombre, plantel);
      
      await transporter.sendMail({
        from: {
          name: 'Instituto Educativo Winston',
          address: 'sistemas.desarrollo@winston93.edu.mx'
        },
        to: dest.email,
        subject: '🎓 Seguimiento 5 días - Instituto Winston',
        html: email5d
      });
      
      console.log(`✅ Email 5 días enviado a ${dest.email}`);
      
      results.push({
        email: dest.email,
        telefono: dest.telefono,
        status: 'success'
      });
      
      // Esperar 3 minutos antes del siguiente destinatario (excepto el último)
      const esUltimo = destinatarios.indexOf(dest) === destinatarios.length - 1;
      if (!esUltimo) {
        console.log(`⏳ Esperando 3 minutos antes del siguiente destinatario...`);
        await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutos = 180000ms
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Emails de seguimiento enviados',
      enviados: results.length,
      detalles: results
    });
    
  } catch (error) {
    console.error('❌ Error enviando emails:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al enviar emails',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

