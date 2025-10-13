import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Endpoint para probar la lógica de recordatorios sin enviar emails
export async function GET() {
  const startTime = new Date();
  const logId = `TEST_${startTime.getTime()}`;
  
  console.log(`\n🧪 [${logId}] ===== PRUEBA DE LÓGICA DE RECORDATORIOS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  console.log(`🌍 [${logId}] Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  
  try {
    // Simular la lógica exacta de la API de recordatorios
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    console.log(`📅 [${logId}] Calculando rangos de fecha:`);
    console.log(`📅 [${logId}] Fecha actual: ${new Date().toISOString()}`);
    console.log(`📅 [${logId}] Hoy (inicio): ${today.toISOString()}`);
    console.log(`📅 [${logId}] Ayer (inicio): ${yesterday.toISOString()}`);
    
    // Buscar todas las inscripciones recientes para contexto
    console.log(`🔍 [${logId}] Buscando inscripciones recientes...`);
    const { data: todasInscripciones, error: errorTodas } = await supabase
      .from('inscripciones')
      .select('id, nombre_aspirante, email, created_at, reminder_sent')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (errorTodas) {
      console.error(`❌ [${logId}] Error al consultar todas las inscripciones:`, errorTodas);
      return NextResponse.json({ error: 'Error al consultar inscripciones' }, { status: 500 });
    }
    
    console.log(`📊 [${logId}] Inscripciones recientes encontradas: ${todasInscripciones?.length || 0}`);
    if (todasInscripciones) {
      todasInscripciones.forEach((inscripcion, index) => {
        const fecha = new Date(inscripcion.created_at);
        const cumpleCriterio = !inscripcion.reminder_sent && 
                              fecha >= yesterday && 
                              fecha < today;
        
        console.log(`📝 [${logId}] Inscripción ${index + 1}:`);
        console.log(`   - ID: ${inscripcion.id}`);
        console.log(`   - Nombre: ${inscripcion.nombre_aspirante}`);
        console.log(`   - Email: ${inscripcion.email}`);
        console.log(`   - Fecha: ${fecha.toLocaleString('es-MX')}`);
        console.log(`   - Recordatorio enviado: ${inscripcion.reminder_sent}`);
        console.log(`   - Cumple criterio: ${cumpleCriterio ? '✅ SÍ' : '❌ NO'}`);
      });
    }
    
    // Ahora ejecutar la consulta exacta de la API
    console.log(`🔍 [${logId}] Ejecutando consulta exacta de la API...`);
    const { data: inscripcionesTarget, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('reminder_sent', false)
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());
    
    console.log(`📊 [${logId}] Resultado de la consulta exacta:`);
    console.log(`📊 [${logId}] Error: ${dbError ? 'SÍ' : 'NO'}`);
    if (dbError) console.log(`📊 [${logId}] Detalle del error:`, dbError);
    console.log(`📊 [${logId}] Inscripciones que recibirían recordatorio: ${inscripcionesTarget?.length || 0}`);
    
    if (inscripcionesTarget && inscripcionesTarget.length > 0) {
      console.log(`✅ [${logId}] Estas inscripciones recibirían recordatorio MAÑANA:`);
      inscripcionesTarget.forEach((inscripcion, index) => {
        console.log(`   ${index + 1}. ${inscripcion.nombre_aspirante} (${inscripcion.email})`);
      });
    } else {
      console.log(`❌ [${logId}] NO hay inscripciones que recibirían recordatorio mañana`);
      console.log(`📋 [${logId}] Esto significa que necesitas registrar inscripciones HOY para que mañana se envíen recordatorios`);
    }
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n🏁 [${logId}] ===== FIN DE LA PRUEBA =====`);
    console.log(`⏱️ [${logId}] Duración: ${duration}ms`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);
    
    return NextResponse.json({
      success: true,
      message: 'Prueba completada',
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      inscripcionesRecientes: todasInscripciones?.length || 0,
      inscripcionesTarget: inscripcionesTarget?.length || 0,
      rangos: {
        hoy: today.toISOString(),
        ayer: yesterday.toISOString()
      },
      detalles: inscripcionesTarget || []
    });
    
  } catch (error) {
    const endTime = new Date();
    console.error(`\n💥 [${logId}] ===== ERROR EN PRUEBA =====`);
    console.error(`❌ [${logId}] Error:`, error);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json(
      { 
        error: 'Error en la prueba',
        logId,
        timestamp: endTime.toISOString(),
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
