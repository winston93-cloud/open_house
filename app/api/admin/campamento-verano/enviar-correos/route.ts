import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase-admin';
import {
  registroToCampamentoEmailData,
  sendCampamentoConfirmacionEmail,
} from '../../../../../lib/campamento-mail';
import { assignFolioToRegistro, loadRegistroById } from '../../../../../lib/campamento-registro-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? (body.ids as unknown[]).map(String).filter(Boolean) : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Selecciona al menos una inscripción.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const enviados: string[] = [];
    const fallidos: { id: string; message: string }[] = [];

    for (const id of ids) {
      try {
        let registro = await loadRegistroById(supabase, id);
        if (!registro) {
          fallidos.push({ id, message: 'Registro no encontrado' });
          continue;
        }
        registro = await assignFolioToRegistro(supabase, registro);
        await sendCampamentoConfirmacionEmail(registroToCampamentoEmailData(registro));
        enviados.push(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al enviar';
        fallidos.push({ id, message });
        console.error(`Error enviando correo campamento ${id}:`, err);
      }
    }

    return NextResponse.json({
      success: fallidos.length === 0,
      enviados: enviados.length,
      fallidos,
      message:
        fallidos.length === 0
          ? `Se enviaron ${enviados.length} correo(s) correctamente.`
          : `Enviados: ${enviados.length}. Fallidos: ${fallidos.length}.`,
    });
  } catch (error) {
    console.error('POST enviar-correos campamento:', error);
    return NextResponse.json({ success: false, message: 'Error interno' }, { status: 500 });
  }
}
