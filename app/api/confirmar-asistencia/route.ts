import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { id, confirmacion } = await request.json();

    if (!id || !confirmacion) {
      return NextResponse.json(
        { error: 'ID y confirmación son requeridos' },
        { status: 400 }
      );
    }

    if (!['confirmado', 'no_confirmado'].includes(confirmacion)) {
      return NextResponse.json(
        { error: 'Confirmación debe ser "confirmado" o "no_confirmado"' },
        { status: 400 }
      );
    }

    // Primero intentar buscar en inscripciones (Open House)
    let { data, error } = await supabase
      .from('inscripciones')
      .update({
        confirmacion_asistencia: confirmacion,
        fecha_confirmacion: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    let tabla = 'inscripciones';

    // Si no se encuentra en inscripciones, buscar en sesiones (Sesiones Informativas)
    if (error || !data || data.length === 0) {
      console.log('No encontrado en inscripciones, buscando en sesiones...');
      
      const { data: sesionData, error: sesionError } = await supabase
        .from('sesiones')
        .update({
          confirmacion_asistencia: confirmacion,
          fecha_confirmacion: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (sesionError) {
        console.error('Error al confirmar asistencia en sesiones:', sesionError);
        return NextResponse.json(
          { error: 'Error al actualizar la confirmación' },
          { status: 500 }
        );
      }

      if (!sesionData || sesionData.length === 0) {
        return NextResponse.json(
          { error: 'Inscripción no encontrada' },
          { status: 404 }
        );
      }

      data = sesionData;
      tabla = 'sesiones';
    }

    const registro = data[0];
    const mensaje = confirmacion === 'confirmado' 
      ? '¡Gracias por confirmar tu asistencia! Te esperamos en el evento.'
      : 'Hemos registrado que no podrás asistir. Gracias por informarnos.';

    return NextResponse.json({
      success: true,
      mensaje,
      inscripcion: {
        id: registro.id,
        nombre_aspirante: registro.nombre_aspirante,
        nivel_academico: registro.nivel_academico,
        confirmacion_asistencia: registro.confirmacion_asistencia,
        fecha_confirmacion: registro.fecha_confirmacion
      },
      tabla: tabla // Para debugging
    });

  } catch (error) {
    console.error('Error en confirmación de asistencia:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Primero intentar buscar en inscripciones (Open House)
    let { data, error } = await supabase
      .from('inscripciones')
      .select('id, nombre_aspirante, nivel_academico, confirmacion_asistencia, fecha_confirmacion')
      .eq('id', id)
      .single();

    // Si no se encuentra en inscripciones, buscar en sesiones (Sesiones Informativas)
    if (error || !data) {
      console.log('No encontrado en inscripciones, buscando en sesiones...');
      
      const { data: sesionData, error: sesionError } = await supabase
        .from('sesiones')
        .select('id, nombre_aspirante, nivel_academico, confirmacion_asistencia, fecha_confirmacion')
        .eq('id', id)
        .single();

      if (sesionError) {
        console.error('Error al obtener inscripción de sesiones:', sesionError);
        return NextResponse.json(
          { error: 'Error al obtener la inscripción' },
          { status: 500 }
        );
      }

      if (!sesionData) {
        return NextResponse.json(
          { error: 'Inscripción no encontrada' },
          { status: 404 }
        );
      }

      data = sesionData;
    }

    return NextResponse.json({
      success: true,
      inscripcion: data
    });

  } catch (error) {
    console.error('Error al obtener inscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
