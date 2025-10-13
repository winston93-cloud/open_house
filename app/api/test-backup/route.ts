import { NextRequest, NextResponse } from 'next/server';

// Endpoint para probar el sistema de backup sin restricciones de horario
export async function GET(request: NextRequest) {
  const logId = `TEST_BACKUP_${new Date().getTime()}`;
  
  console.log(`\n🧪 [${logId}] ===== PRUEBA DE SISTEMA DE BACKUP =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${new Date().toLocaleString('es-MX')}`);
  
  try {
    // Simular llamada al endpoint de backup
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    console.log(`🔗 [${logId}] URL base: ${baseUrl}`);
    
    const response = await fetch(`${baseUrl}/api/backup-inscripciones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log(`📊 [${logId}] Resultado del backup:`);
    console.log(`📊 [${logId}] Status: ${response.status}`);
    console.log(`📊 [${logId}] Success: ${result.success}`);
    console.log(`📊 [${logId}] Message: ${result.message}`);
    
    if (result.success) {
      console.log(`📊 [${logId}] Total registros: ${result.totalRecords}`);
      console.log(`📊 [${logId}] Archivo: ${result.fileName}`);
      console.log(`📊 [${logId}] Email enviado: ${result.emailSent}`);
    }
    
    console.log(`\n🏁 [${logId}] ===== FIN DE PRUEBA =====\n`);
    
    return NextResponse.json({
      success: true,
      message: 'Prueba de backup completada',
      logId,
      backupResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`\n💥 [${logId}] ===== ERROR EN PRUEBA =====`);
    console.error(`❌ [${logId}] Error:`, error);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json({
      success: false,
      message: 'Error en la prueba de backup',
      logId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
