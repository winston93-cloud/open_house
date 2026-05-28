import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase-admin';
import { assignFolioToRegistro, loadRegistroById } from '../../../../../lib/campamento-registro-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).map(String).filter(Boolean) : null;

    const supabase = getSupabaseAdmin();
    let targetIds = ids;

    if (!targetIds?.length) {
      const { data, error } = await supabase
        .from('campamento_verano')
        .select('id')
        .is('folio', null);

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }
      targetIds = (data || []).map((r) => r.id);
    }

    if (!targetIds.length) {
      return NextResponse.json({
        success: true,
        asignados: 0,
        message: 'No hay inscripciones sin folio.',
      });
    }

    const actualizados = [];
    const fallidos: { id: string; message: string }[] = [];

    for (const id of targetIds) {
      try {
        let registro = await loadRegistroById(supabase, id);
        if (!registro) {
          fallidos.push({ id, message: 'No encontrado' });
          continue;
        }
        if (!registro.folio) {
          registro = await assignFolioToRegistro(supabase, registro);
        }
        actualizados.push(registro);
      } catch (err) {
        fallidos.push({
          id,
          message: err instanceof Error ? err.message : 'Error',
        });
      }
    }

    return NextResponse.json({
      success: fallidos.length === 0,
      asignados: actualizados.length,
      registros: actualizados,
      fallidos,
      message:
        fallidos.length === 0
          ? `Se asignaron o verificaron ${actualizados.length} folio(s).`
          : `Procesados: ${actualizados.length}. Fallidos: ${fallidos.length}.`,
    });
  } catch (error) {
    console.error('POST asignar-folios:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
