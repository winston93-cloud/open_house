import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../../lib/insforge-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cicloEscolar = searchParams.get('ciclo_escolar') ?? '2026';
    const edicionOpenHouse = searchParams.get('edicion_open_house') ?? 'todos';

    const db = getInsforgeAdmin().database;
    let query = db.from('inscripciones').select('*').order('created_at', { ascending: false });

    if (edicionOpenHouse === 'sin-etiqueta') {
      query = query.is('edicion_open_house', null).eq('ciclo_escolar', cicloEscolar);
    } else if (edicionOpenHouse !== 'todos') {
      query = query.eq('edicion_open_house', edicionOpenHouse);
    } else {
      query = query.eq('ciclo_escolar', cicloEscolar);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inscripciones: data ?? [] });
  } catch (error) {
    console.error('GET admin inscripciones:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
