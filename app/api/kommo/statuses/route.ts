import { NextRequest, NextResponse } from 'next/server';

// GET /api/kommo/statuses?pipeline_id=5030645&tipo=sesiones
// Devuelve los statuses (etapas) del embudo especificado en Kommo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') === 'sesiones' ? 'sesiones' : 'open-house';
    const pipelineId = searchParams.get('pipeline_id') ||
      (tipo === 'sesiones' ? process.env.KOMMO_SESIONES_PIPELINE_ID : process.env.KOMMO_PIPELINE_ID) ||
      '5030645';

    const subdomain = tipo === 'sesiones'
      ? (process.env.KOMMO_SESIONES_SUBDOMAIN || 'winstonchurchill')
      : (process.env.KOMMO_SUBDOMAIN || 'winstonchurchill');

    const token = tipo === 'sesiones'
      ? (process.env.KOMMO_SESIONES_LONG_TOKEN || '')
      : (process.env.KOMMO_REFRESH_TOKEN || '');

    if (!token) {
      return NextResponse.json({ error: 'Falta token Kommo para la integración seleccionada' }, { status: 400 });
    }

    const url = `https://${subdomain}.kommo.com/api/v4/leads/pipelines/${pipelineId}/statuses`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'Error consultando Kommo', details: text }, { status: resp.status });
    }

    const data = await resp.json();

    // Normalizar salida: id, name, sort, is_editable
    const statuses = (data?._embedded?.statuses || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      sort: s.sort,
      is_editable: s.is_editable,
    }));

    return NextResponse.json({
      success: true,
      pipelineId,
      count: statuses.length,
      statuses,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}


