import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const email = 'isc.escobedo@gmail.com';

    // Buscar en inscripciones
    const { data: inscripciones, error: errorInscripciones } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    // Buscar en sesiones
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('sesiones')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      email: email,
      inscripciones: {
        count: inscripciones?.length || 0,
        registros: inscripciones || []
      },
      sesiones: {
        count: sesiones?.length || 0,
        registros: sesiones || []
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al consultar registros' },
      { status: 500 }
    );
  }
}

