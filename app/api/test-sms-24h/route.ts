import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  console.log('🚀 ===== INICIO TEST SMS 24H =====');
  
  try {
    // Calcular timestamp de hace 24 horas
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log(`📅 Buscando leads con last_contact_time < ${twentyFourHoursAgo.toISOString()}`);
    console.log(`📅 Hora actual: ${new Date().toISOString()}`);
    
    // Buscar leads pendientes
    const { data: pendingLeads, error } = await supabase
      .from('kommo_lead_tracking')
      .select('*')
      .lt('last_contact_time', twentyFourHoursAgo.toISOString())
      .eq('sms_24h_sent', false)
      .eq('lead_status', 'active');
    
    if (error) {
      console.error('❌ Error consultando leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`📊 Leads encontrados: ${pendingLeads?.length || 0}`);
    
    if (!pendingLeads || pendingLeads.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No hay leads pendientes',
        twentyFourHoursAgo: twentyFourHoursAgo.toISOString(),
        now: new Date().toISOString()
      });
    }
    
    // Mostrar detalles de cada lead encontrado
    for (const lead of pendingLeads) {
      console.log(`\n📋 Lead encontrado:`);
      console.log(`   ID: ${lead.kommo_lead_id}`);
      console.log(`   Nombre: ${lead.nombre}`);
      console.log(`   Teléfono: ${lead.telefono}`);
      console.log(`   Last contact: ${lead.last_contact_time}`);
      console.log(`   SMS 24h sent: ${lead.sms_24h_sent}`);
      console.log(`   Status: ${lead.lead_status}`);
      
      // Validar teléfono
      if (!lead.telefono || lead.telefono.trim() === '') {
        console.log(`   ⚠️ Sin teléfono, omitiendo...`);
        continue;
      }
      
      // Preparar teléfono
      let telefono = lead.telefono.toString().trim();
      if (!telefono.startsWith('+52') && !telefono.startsWith('52')) {
        telefono = '+52' + telefono;
      } else if (telefono.startsWith('52') && !telefono.startsWith('+')) {
        telefono = '+' + telefono;
      }
      
      console.log(`   📤 Enviando SMS a ${telefono}...`);
      
      // Mensaje de 24h
      const mensaje = `¡Hola! Te recordamos que estamos disponibles para apoyarte con el proceso de admisión al Instituto Winston Churchill.

Escríbenos por WhatsApp al 833 437 8743 y con gusto te brindamos toda la información necesaria.`;
      
      // Enviar SMS
      const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://open-house-chi.vercel.app'}/api/sms/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: telefono,
          message: mensaje
        })
      });
      
      if (!smsResponse.ok) {
        const errorText = await smsResponse.text();
        console.error(`   ❌ Error enviando SMS:`, errorText);
        continue;
      }
      
      console.log(`   ✅ SMS enviado exitosamente`);
      
      // Actualizar BD
      const { error: updateError } = await supabase
        .from('kommo_lead_tracking')
        .update({
          sms_24h_sent: true,
          sms_24h_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('kommo_lead_id', lead.kommo_lead_id);
      
      if (updateError) {
        console.error(`   ❌ Error actualizando BD:`, updateError);
      } else {
        console.log(`   ✅ BD actualizada`);
      }
      
      // Agregar tag en Kommo
      try {
        const { getKommoAccessToken } = await import('../../../lib/kommo');
        const accessToken = await getKommoAccessToken('open-house');
        
        const tagResponse = await fetch(
          `https://winstonchurchill.kommo.com/api/v4/leads/${lead.kommo_lead_id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              _embedded: {
                tags: [{ name: 'SMS-24h-Enviado' }]
              }
            })
          }
        );
        
        if (tagResponse.ok) {
          console.log(`   🏷️ Tag agregado en Kommo`);
        } else {
          console.error(`   ⚠️ Error agregando tag: ${tagResponse.status}`);
        }
      } catch (tagError) {
        console.error(`   ⚠️ Error con tag:`, tagError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      leadsProcessed: pendingLeads.length,
      leads: pendingLeads.map(l => ({
        id: l.kommo_lead_id,
        nombre: l.nombre,
        telefono: l.telefono,
        last_contact: l.last_contact_time
      }))
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

