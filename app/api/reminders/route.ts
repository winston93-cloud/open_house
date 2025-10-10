import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase } from '../../../lib/supabase';
import createReminderEmailTemplate from '../../../../backend/src/reminderEmailTemplate';

// Configuración del transporter de email (misma configuración que el email de confirmación)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

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

// Función para obtener la información del evento según el nivel
const getEventInfo = (nivelAcademico: string) => {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEvento: '29 de noviembre de 2025',
      horaEvento: '9:00 AM',
      institucionNombre: 'Instituto Educativo Winston'
    };
  } else if (nivelAcademico === 'primaria') {
    return {
      fechaEvento: '6 de diciembre de 2025',
      horaEvento: '9:00 AM a 11:30 AM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  } else if (nivelAcademico === 'secundaria') {
    return {
      fechaEvento: '6 de diciembre de 2025',
      horaEvento: '11:30 AM a 2:00 PM',
      institucionNombre: 'Instituto Winston Churchill'
    };
  }
  
  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill'
  };
};

// Función para enviar email de recordatorio
const sendReminderEmail = async (inscripcion: any) => {
  try {
    const diasRestantes = calculateDaysUntilEvent(inscripcion.nivel_academico);
    const eventInfo = getEventInfo(inscripcion.nivel_academico);
    
    // Crear el template del email con los días restantes calculados
    const emailHtml = createReminderEmailTemplate({
      ...inscripcion,
      diasRestantes,
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
      subject: `🔔 Recordatorio - Open House ${eventInfo.institucionNombre} (${diasRestantes} días restantes)`,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de recordatorio enviado a: ${inscripcion.email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${inscripcion.email}:`, error);
    return { success: false, error };
  }
};

// Endpoint POST para procesar recordatorios (llamado por el cron job)
export async function POST(request: NextRequest) {
  try {
    // Verificar que la petición viene de una fuente autorizada
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REMINDER_API_TOKEN || 'default-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🔄 Iniciando procesamiento de recordatorios...');
    
    // Buscar inscripciones que necesitan recordatorio
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: inscripciones, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .lt('created_at', oneDayAgo.toISOString());

    if (dbError) {
      console.error('Error al consultar inscripciones:', dbError);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos' },
        { status: 500 }
      );
    }

    if (!inscripciones || inscripciones.length === 0) {
      console.log('✅ No hay recordatorios pendientes');
      return NextResponse.json({
        success: true,
        message: 'No hay recordatorios pendientes',
        processed: 0
      });
    }

    console.log(`📧 Procesando ${inscripciones.length} recordatorios...`);
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Procesar cada inscripción
    for (const inscripcion of inscripciones) {
      try {
        const result = await sendReminderEmail(inscripcion);
        
        if (result.success) {
          // Marcar como enviado en la base de datos
          const { error: updateError } = await supabase
            .from('inscripciones')
            .update({
              reminder_sent: true,
              reminder_sent_at: new Date().toISOString()
            })
            .eq('id', inscripcion.id);

          if (updateError) {
            console.error(`Error al actualizar recordatorio para ${inscripcion.email}:`, updateError);
          } else {
            successCount++;
            results.push({
              email: inscripcion.email,
              status: 'success',
              message: 'Recordatorio enviado exitosamente'
            });
          }
        } else {
          errorCount++;
          results.push({
            email: inscripcion.email,
            status: 'error',
            message: 'Error al enviar recordatorio'
          });
        }
      } catch (error) {
        errorCount++;
        console.error(`Error procesando recordatorio para ${inscripcion.email}:`, error);
        results.push({
          email: inscripcion.email,
          status: 'error',
          message: 'Error inesperado'
        });
      }
    }

    console.log(`✅ Procesamiento completado: ${successCount} exitosos, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      message: 'Procesamiento de recordatorios completado',
      processed: inscripciones.length,
      successful: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('Error general en procesamiento de recordatorios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
