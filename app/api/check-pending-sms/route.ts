import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    const fiveDaysAgo = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000));

    // Leads pendientes de SMS 24h
    const { data: leads24h, error: error24h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', twentyFourHoursAgo.toISOString())
      .gte('last_contact_time', fortyEightHoursAgo.toISOString())
      .eq('sms_24h_sent', false)
      .eq('lead_status', 'active');

    // Leads pendientes de SMS 48h
    const { data: leads48h, error: error48h } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', fortyEightHoursAgo.toISOString())
      .gte('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_24h_sent', true)
      .eq('sms_48h_sent', false)
      .eq('lead_status', 'active');

    // Leads pendientes de SMS 5 días
    const { data: leads5d, error: error5d } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', fiveDaysAgo.toISOString())
      .eq('sms_48h_sent', true)
      .eq('sms_72h_sent', false)
      .eq('lead_status', 'active');

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      pendientes: {
        sms24h: {
          count: leads24h?.length || 0,
          leads: leads24h || []
        },
        sms48h: {
          count: leads48h?.length || 0,
          leads: leads48h || []
        },
        sms5d: {
          count: leads5d?.length || 0,
          leads: leads5d || []
        }
      },
      rangos: {
        '24h': `${fortyEightHoursAgo.toISOString()} a ${twentyFourHoursAgo.toISOString()}`,
        '48h': `${fiveDaysAgo.toISOString()} a ${fortyEightHoursAgo.toISOString()}`,
        '5d': `< ${fiveDaysAgo.toISOString()}`
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al consultar leads pendientes' },
      { status: 500 }
    );
  }
}

