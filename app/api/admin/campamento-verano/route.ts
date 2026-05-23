import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';
import {
  normalizeCampamentoRow,
  parseCampamentoPayload,
  payloadToDbRow,
  validateCampamentoPayload,
} from '../../../../lib/campamento-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edicion = searchParams.get('edicion');

    const supabase = getSupabaseAdmin();
    let query = supabase.from('campamento_verano').select('*').order('created_at', { ascending: false });

    if (edicion && edicion !== 'todos') {
      query = query.eq('edicion', edicion);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error listando campamento:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registros: (data || []).map((r) => normalizeCampamentoRow(r)),
    });
  } catch (error) {
    console.error('GET admin campamento:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = parseCampamentoPayload(body);
    const err = validateCampamentoPayload(payload);
    if (err) {
      return NextResponse.json({ success: false, message: err }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('campamento_verano')
      .insert([payloadToDbRow(payload)])
      .select()
      .single();

    if (error) {
      console.error('Error creando campamento:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registro: normalizeCampamentoRow(data) });
  } catch (error) {
    console.error('POST admin campamento:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
