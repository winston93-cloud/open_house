import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const now = new Date();
    const mexicoOffset = -6; // GMT-6
    const nowMexico = new Date(now.getTime() + mexicoOffset * 60 * 60 * 1000);
    
    // Calcular mañana en México
    const tomorrow = new Date(nowMexico);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);
    
    console.log('Buscando eventos para:', {
      hoy_mexico: nowMexico.toISOString(),
      manana_inicio: tomorrow.toISOString(),
      manana_fin: tomorrowEnd.toISOString()
    });
    
    // Buscar inscripciones Open House para mañana
    const { data: inscripciones, error: errorInsc } = await supabase
      .from('inscripciones')
      .select('*')
      .gte('fecha_evento', tomorrow.toISOString().split('T')[0])
      .lte('fecha_evento', tomorrowEnd.toISOString().split('T')[0])
      .eq('recordatorio_enviado', false)
      .order('fecha_evento', { ascending: true });
    
    // Buscar sesiones informativas para mañana
    const { data: sesiones, error: errorSes } = await supabase
      .from('sesiones')
      .select('*')
      .gte('fecha_evento', tomorrow.toISOString().split('T')[0])
      .lte('fecha_evento', tomorrowEnd.toISOString().split('T')[0])
      .eq('recordatorio_enviado', false)
      .order('fecha_evento', { ascending: true });

    return NextResponse.json({
      success: true,
      fecha_consulta: nowMexico.toISOString(),
      manana: tomorrow.toISOString().split('T')[0],
      open_house: {
        count: inscripciones?.length || 0,
        pendientes: inscripciones?.map(i => ({
          id: i.id,
          nombre: i.nombre_completo,
          email: i.email,
          telefono: i.telefono,
          fecha_evento: i.fecha_evento,
          hora_evento: i.hora_evento,
          plantel: i.plantel,
          nivel_academico: i.nivel_academico
        })) || []
      },
      sesiones_informativas: {
        count: sesiones?.length || 0,
        pendientes: sesiones?.map(s => ({
          id: s.id,
          nombre: s.nombre_completo,
          email: s.email,
          telefono: s.telefono,
          fecha_evento: s.fecha_evento,
          hora_evento: s.hora_evento,
          plantel: s.plantel,
          nivel_academico: s.nivel_academico
        })) || []
      },
      total_recordatorios_pendientes: (inscripciones?.length || 0) + (sesiones?.length || 0)
    });

  } catch (error) {
    console.error('Error consultando recordatorios:', error);
    return NextResponse.json(
      { error: 'Error consultando datos', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

