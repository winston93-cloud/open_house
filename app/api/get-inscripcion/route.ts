import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../lib/insforge-admin';

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

    const db = getInsforgeAdmin().database;

    const { data: inscripcion, error } = await db
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener inscripción', details: error.message },
        { status: 500 }
      );
    }

    if (!inscripcion) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      inscripcion
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
