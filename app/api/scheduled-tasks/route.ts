import { NextRequest, NextResponse } from 'next/server';
import { GET as backupHandler } from '../backup-inscripciones/route';
import { GET as remindersHandler } from '../reminders/route';

export async function GET(request: NextRequest) {
  const now = new Date();
  const currentHour = now.getHours();
  const logId = `SCHEDULED_${now.getTime()}`;
  
  console.log(`\n🔄 [${logId}] ===== INICIO DE TAREAS PROGRAMADAS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${now.toLocaleString('es-MX')}`);
  console.log(`⏰ [${logId}] Hora actual: ${currentHour}h`);
  
  const results: any = {
    timestamp: now.toISOString(),
    tasks: []
  };

  // Ejecutar backup a las 13:30 PM México (19:30 UTC)
  if (currentHour === 19) {
    console.log(`📊 [${logId}] Ejecutando backup...`);
    try {
      const backupResult = await backupHandler(request);
      const backupData = await backupResult.json();
      results.tasks.push({
        type: 'backup',
        success: backupData.success,
        message: backupData.message,
        timestamp: backupData.timestamp
      });
      console.log(`✅ [${logId}] Backup completado:`, backupData.success);
    } catch (error: any) {
      console.error(`❌ [${logId}] Error en backup:`, error);
      results.tasks.push({
        type: 'backup',
        success: false,
        error: error.message
      });
    }
  } else {
    console.log(`⏭️ [${logId}] Backup no programado para esta hora (solo a las 13:30 PM México)`);
  }

  // Ejecutar recordatorios a las 9:00 AM (15:00 UTC)
  if (currentHour === 15) {
    console.log(`📧 [${logId}] Ejecutando recordatorios...`);
    try {
      const remindersResult = await remindersHandler();
      const remindersData = await remindersResult.json();
      results.tasks.push({
        type: 'reminders',
        success: remindersData.success,
        message: remindersData.message,
        timestamp: remindersData.timestamp
      });
      console.log(`✅ [${logId}] Recordatorios completados:`, remindersData.success);
    } catch (error: any) {
      console.error(`❌ [${logId}] Error en recordatorios:`, error);
      results.tasks.push({
        type: 'reminders',
        success: false,
        error: error.message
      });
    }
  } else {
    console.log(`⏭️ [${logId}] Recordatorios no programados para esta hora`);
  }

  console.log(`\n🏁 [${logId}] ===== FIN DE TAREAS PROGRAMADAS =====`);
  console.log(`📊 [${logId}] Total de tareas ejecutadas: ${results.tasks.length}`);
  console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);

  return NextResponse.json({
    success: true,
    message: 'Tareas programadas ejecutadas',
    ...results
  });
}
