import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const now = new Date();
    
    // Ventana de 24 horas (entre 24h y 48h atrás)
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    // Ventana de 48 horas (entre 48h y 5 días atrás)
    const ago5days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    
    console.log('Rangos de tiempo:', {
      ahora: now.toISOString(),
      hace24h: ago24h.toISOString(),
      hace48h: ago48h.toISOString(),
      hace5dias: ago5days.toISOString()
    });
    
    // 1. Leads pendientes de SMS 24h (entre 24h y 48h desde last_contact_time)
    const { data: pending24h, error: error24h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_24h_sent', false)
      .eq('lead_status', 'active')
      .lte('last_contact_time', ago24h.toISOString())
      .gte('last_contact_time', ago48h.toISOString())
      .order('last_contact_time', { ascending: false });
    
    // 2. Leads pendientes de SMS 48h (>48h desde sms_24h_sent_at pero <5 días)
    const { data: pending48h, error: error48h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_24h_sent', true)
      .eq('sms_48h_sent', false)
      .eq('lead_status', 'active')
      .lte('sms_24h_sent_at', ago48h.toISOString())
      .order('sms_24h_sent_at', { ascending: false });
    
    // 3. Leads pendientes de SMS 5 días (>5 días desde sms_48h_sent_at)
    const { data: pending5d, error: error5d } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_48h_sent', true)
      .eq('sms_72h_sent', false)
      .eq('lead_status', 'active')
      .lte('sms_48h_sent_at', ago5days.toISOString())
      .order('sms_48h_sent_at', { ascending: false });

    if (error24h || error48h || error5d) {
      console.error('Errores:', { error24h, error48h, error5d });
    }

    return NextResponse.json({
      success: true,
      fecha_consulta: now.toISOString(),
      horario_cron: '12:50 PM México (18:50 UTC)',
      proxima_ejecucion: 'Hoy a las 12:50 PM',
      pendientes_para_hoy: {
        sms_24h: {
          count: pending24h?.length || 0,
          descripcion: 'Leads que entraron hace 24-48 horas',
          leads: pending24h?.map(l => ({
            id: l.id,
            nombre: l.nombre,
            telefono: l.telefono,
            email: l.email,
            plantel: l.plantel,
            last_contact_time: l.last_contact_time,
            horas_desde_contacto: Math.floor((now.getTime() - new Date(l.last_contact_time).getTime()) / (1000 * 60 * 60))
          })) || []
        },
        sms_48h: {
          count: pending48h?.length || 0,
          descripcion: 'Leads que recibieron SMS 24h hace más de 48 horas',
          leads: pending48h?.map(l => ({
            id: l.id,
            nombre: l.nombre,
            telefono: l.telefono,
            email: l.email,
            plantel: l.plantel,
            sms_24h_sent_at: l.sms_24h_sent_at,
            horas_desde_sms24h: Math.floor((now.getTime() - new Date(l.sms_24h_sent_at).getTime()) / (1000 * 60 * 60))
          })) || []
        },
        sms_5d: {
          count: pending5d?.length || 0,
          descripcion: 'Leads que recibieron SMS 48h hace más de 5 días',
          leads: pending5d?.map(l => ({
            id: l.id,
            nombre: l.nombre,
            telefono: l.telefono,
            email: l.email,
            plantel: l.plantel,
            sms_48h_sent_at: l.sms_48h_sent_at,
            dias_desde_sms48h: Math.floor((now.getTime() - new Date(l.sms_48h_sent_at).getTime()) / (1000 * 60 * 60 * 24))
          })) || []
        }
      },
      total_pendientes: (pending24h?.length || 0) + (pending48h?.length || 0) + (pending5d?.length || 0)
    });

  } catch (error) {
    console.error('Error consultando SMS pendientes:', error);
    return NextResponse.json(
      { error: 'Error consultando datos', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

