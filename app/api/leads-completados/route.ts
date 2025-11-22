import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// =============================================================================
// MÓDULO: Gestión de Leads Completados (Ciclo de 5 días terminado)
// =============================================================================
// Endpoint para listar y eliminar leads que ya completaron su ciclo de SMS
// (24h -> 48h -> 5 días)
// El campo sms_72h_sent se reutiliza para marcar el envío del SMS de 5 días
// =============================================================================

// GET: Listar leads completados
export async function GET(request: NextRequest) {
  try {
    const { data: leadsCompletados, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .eq('sms_72h_sent', true)
      .eq('lead_status', 'active')
      .order('sms_72h_sent_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo leads completados:', error);
      return NextResponse.json(
        { error: 'Error al obtener leads completados', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: leadsCompletados?.length || 0,
      leads: leadsCompletados || []
    });

  } catch (error) {
    console.error('❌ Error en GET /api/leads-completados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar lead(s) completado(s)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadIds, eliminarTodos } = body;

    // Si se solicita eliminar todos
    if (eliminarTodos === true) {
      // Primero obtener los IDs para el conteo
      const { data: leadsParaEliminar } = await supabase
        .from('kommo_lead_tracking')
        .select('kommo_lead_id')
        .eq('sms_72h_sent', true)
        .eq('lead_status', 'active');
      
      const count = leadsParaEliminar?.length || 0;
      
      // Eliminar físicamente
      const { error } = await supabase
        .from('kommo_lead_tracking')
        .delete()
        .eq('sms_72h_sent', true)
        .eq('lead_status', 'active');

      if (error) {
        console.error('❌ Error eliminando todos los leads:', error);
        return NextResponse.json(
          { error: 'Error al eliminar leads', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${count} leads eliminados permanentemente`,
        count: count
      });
    }

    // Eliminar leads específicos
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds debe ser un array con al menos un ID' },
        { status: 400 }
      );
    }

    // Primero obtener los leads para el conteo
    const { data: leadsParaEliminar } = await supabase
      .from('kommo_lead_tracking')
      .select('kommo_lead_id')
      .in('kommo_lead_id', leadIds)
      .eq('sms_72h_sent', true)
      .eq('lead_status', 'active');
    
    const count = leadsParaEliminar?.length || 0;

    // Eliminar físicamente
    const { error } = await supabase
      .from('kommo_lead_tracking')
      .delete()
      .in('kommo_lead_id', leadIds)
      .eq('sms_72h_sent', true)
      .eq('lead_status', 'active');

    if (error) {
      console.error('❌ Error eliminando leads:', error);
      return NextResponse.json(
        { error: 'Error al eliminar leads', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${count} leads eliminados permanentemente`,
      count: count
    });

  } catch (error) {
    console.error('❌ Error en DELETE /api/leads-completados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

