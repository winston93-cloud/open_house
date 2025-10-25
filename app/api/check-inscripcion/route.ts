import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando inscripción con ID:', id);
    
    // Obtener datos de la inscripción
    const { data: inscripcion, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !inscripcion) {
      console.error('❌ Error al obtener inscripción:', dbError);
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Inscripción encontrada:', inscripcion.nombre_aspirante);

    return NextResponse.json({
      success: true,
      message: 'Inscripción encontrada',
      data: {
        id: inscripcion.id,
        nombre_aspirante: inscripcion.nombre_aspirante,
        nombre_completo: inscripcion.nombre_completo,
        nivel_academico: inscripcion.nivel_academico,
        grado_escolar: inscripcion.grado_escolar,
        correo: inscripcion.correo,
        telefono: inscripcion.telefono,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        reminder_sent: inscripcion.reminder_sent,
        reminder_scheduled_for: inscripcion.reminder_scheduled_for
      }
    });

  } catch (error) {
    console.error('❌ Error al consultar inscripción:', error);
    return NextResponse.json(
      { 
        error: 'Error al consultar inscripción', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
