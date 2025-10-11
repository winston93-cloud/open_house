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

    // Actualizar la confirmación en la base de datos
    const { data, error } = await supabase
      .from('inscripciones')
      .update({
        confirmacion_asistencia: confirmacion,
        fecha_confirmacion: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al confirmar asistencia:', error);
      return NextResponse.json(
        { error: 'Error al actualizar la confirmación' },
        { status: 500 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    const inscripcion = data[0];
    const mensaje = confirmacion === 'confirmado' 
      ? '¡Gracias por confirmar tu asistencia! Te esperamos en el evento.'
      : 'Hemos registrado que no podrás asistir. Gracias por informarnos.';

    return NextResponse.json({
      success: true,
      mensaje,
      inscripcion: {
        id: inscripcion.id,
        nombre_aspirante: inscripcion.nombre_aspirante,
        nivel_academico: inscripcion.nivel_academico,
        confirmacion_asistencia: inscripcion.confirmacion_asistencia,
        fecha_confirmacion: inscripcion.fecha_confirmacion
      }
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

    // Obtener información de la inscripción
    const { data, error } = await supabase
      .from('inscripciones')
      .select('id, nombre_aspirante, nivel_academico, confirmacion_asistencia, fecha_confirmacion')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener inscripción:', error);
      return NextResponse.json(
        { error: 'Error al obtener la inscripción' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
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
