import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: inscripciones, error } = await supabase
      .from('inscripciones')
      .select('id, nombre_aspirante, nivel_academico, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener inscripciones' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inscripciones: inscripciones || []
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

