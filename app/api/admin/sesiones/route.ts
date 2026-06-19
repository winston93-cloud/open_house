import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../../lib/insforge-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cicloEscolar = searchParams.get('ciclo_escolar') ?? '2026';
    const edicionSesiones = searchParams.get('edicion_sesiones') ?? 'todos';

    const db = getInsforgeAdmin().database;
    let query = db.from('sesiones').select('*').order('created_at', { ascending: false });

    if (edicionSesiones === 'sin-etiqueta') {
      query = query.is('edicion_sesiones', null).eq('ciclo_escolar', cicloEscolar);
    } else if (edicionSesiones !== 'todos') {
      query = query.eq('edicion_sesiones', edicionSesiones);
    } else {
      query = query.eq('ciclo_escolar', cicloEscolar);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sesiones: data ?? [] });
  } catch (error) {
    console.error('GET admin sesiones:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
