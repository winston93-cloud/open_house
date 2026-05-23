import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase-admin';
import {
  normalizeCampamentoRow,
  parseCampamentoPayload,
  payloadToDbRow,
  validateCampamentoPayload,
} from '../../../../../lib/campamento-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('campamento_verano').select('*').eq('id', id).single();

    if (error || !data) {
      return NextResponse.json({ success: false, message: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, registro: normalizeCampamentoRow(data) });
  } catch (error) {
    console.error('GET campamento id:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = parseCampamentoPayload(body);
    const err = validateCampamentoPayload(payload);
    if (err) {
      return NextResponse.json({ success: false, message: err }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('campamento_verano')
      .update(payloadToDbRow(payload))
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando campamento:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registro: normalizeCampamentoRow(data) });
  } catch (error) {
    console.error('PATCH campamento:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('campamento_verano').delete().eq('id', id);

    if (error) {
      console.error('Error eliminando campamento:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE campamento:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
