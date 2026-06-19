import { NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../../lib/insforge-admin';

export async function GET() {
  try {
    const { data, error } = await getInsforgeAdmin()
      .database.from('taller_ia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, participantes: data ?? [] });
  } catch (error) {
    console.error('GET admin taller-ia:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
