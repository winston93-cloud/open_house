const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nmxrccrbnoenkahefrrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarLead() {
  console.log('🔍 Verificando lead de prueba...\n');
  
  const { data: lead, error } = await supabase
    .from('kommo_lead_tracking')
    .select('*')
    .eq('email', 'isc.escobedo@gmail.com')
    .single();
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📋 Datos del lead:');
  console.log('   - Nombre:', lead.nombre);
  console.log('   - Email:', lead.email);
  console.log('   - Plantel:', lead.plantel);
  console.log('   - Last contact:', lead.last_contact_time);
  console.log('   - SMS 24h enviado:', lead.sms_24h_sent);
  
  // Calcular tiempo transcurrido
  const lastContact = new Date(lead.last_contact_time);
  const now = new Date();
  const horasTranscurridas = (now - lastContact) / (1000 * 60 * 60);
  
  console.log('\n⏰ Tiempo transcurrido:', horasTranscurridas.toFixed(2), 'horas');
  console.log('   ¿Califica para 24h?', horasTranscurridas >= 24 && !lead.sms_24h_sent ? '✅ SÍ' : '❌ NO');
  
  if (horasTranscurridas < 24) {
    console.log('\n⚠️  El lead AÚN NO califica. Necesito ajustar la fecha.');
    
    // Ajustar a hace 25 horas
    const hace25Horas = new Date(now.getTime() - (25 * 60 * 60 * 1000));
    
    const { error: updateError } = await supabase
      .from('kommo_lead_tracking')
      .update({
        last_contact_time: hace25Horas.toISOString(),
        sms_24h_sent: false,
        sms_24h_sent_at: null
      })
      .eq('id', lead.id);
    
    if (updateError) {
      console.error('❌ Error al actualizar:', updateError);
    } else {
      console.log('✅ Fecha ajustada a:', hace25Horas.toISOString());
      console.log('✅ Lead listo para prueba de email 24h');
    }
  } else if (lead.sms_24h_sent) {
    console.log('\n⚠️  El lead ya tiene sms_24h_sent = true. Lo reseteo.');
    
    const { error: updateError } = await supabase
      .from('kommo_lead_tracking')
      .update({
        sms_24h_sent: false,
        sms_24h_sent_at: null
      })
      .eq('id', lead.id);
    
    if (updateError) {
      console.error('❌ Error al actualizar:', updateError);
    } else {
      console.log('✅ Lead reseteado y listo para prueba de email 24h');
    }
  } else {
    console.log('\n✅ El lead YA CALIFICA para el envío de 24h');
  }
}

verificarLead();

