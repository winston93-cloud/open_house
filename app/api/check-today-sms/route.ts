import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // SMS 24h enviados hoy
    const { data: sms24h, error: error24h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_24h_sent', true)
      .gte('sms_24h_sent_at', today.toISOString())
      .order('sms_24h_sent_at', { ascending: false });
    
    // SMS 48h enviados hoy
    const { data: sms48h, error: error48h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_48h_sent', true)
      .gte('sms_48h_sent_at', today.toISOString())
      .order('sms_48h_sent_at', { ascending: false });
    
    // SMS 5 días enviados hoy
    const { data: sms5d, error: error5d } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_72h_sent', true)
      .gte('sms_72h_sent_at', today.toISOString())
      .order('sms_72h_sent_at', { ascending: false });

    return NextResponse.json({
      success: true,
      fecha_consulta: now.toISOString(),
      horario_cron: '12:50 PM México (18:50 UTC)',
      enviados_hoy: {
        sms_24h: {
          count: sms24h?.length || 0,
          leads: sms24h || []
        },
        sms_48h: {
          count: sms48h?.length || 0,
          leads: sms48h || []
        },
        sms_5d: {
          count: sms5d?.length || 0,
          leads: sms5d || []
        }
      }
    });

  } catch (error) {
    console.error('Error consultando SMS enviados hoy:', error);
    return NextResponse.json(
      { error: 'Error consultando datos' },
      { status: 500 }
    );
  }
}

