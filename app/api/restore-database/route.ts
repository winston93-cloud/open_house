import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Función para obtener archivos de backup desde GitHub
async function getBackupFilesFromGitHub() {
  try {
    // URL de la API de GitHub para listar archivos del repositorio
    const githubApiUrl = 'https://api.github.com/repos/winston93-cloud/inscripciones/contents/backups';
    
    const response = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Winston-Churchill-Backup-System'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const files = await response.json();
    
    // Filtrar solo archivos JSON de backup
    const backupFiles = files
      .filter((file: any) => file.type === 'file' && file.name.endsWith('.json'))
      .sort((a: any, b: any) => new Date(b.name).getTime() - new Date(a.name).getTime()); // Más reciente primero

    return backupFiles;
  } catch (error) {
    console.error('Error al obtener archivos de GitHub:', error);
    throw error;
  }
}

// Función para descargar contenido de un archivo desde GitHub
async function downloadBackupFile(downloadUrl: string) {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'Winston-Churchill-Backup-System'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al descargar archivo: ${response.status}`);
    }

    const content = await response.text();
    return JSON.parse(content);
  } catch (error) {
    console.error('Error al descargar y parsear archivo:', error);
    throw error;
  }
}

// Función para crear la tabla si no existe
async function ensureTableExists() {
  try {
    // Verificar si la tabla existe
    const { data: tables, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inscripciones');

    if (tableCheckError) {
      console.log('No se pudo verificar la existencia de la tabla, continuando...');
    }

    // Si la tabla no existe, crearla
    if (!tables || tables.length === 0) {
      console.log('Tabla inscripciones no existe, creándola...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS inscripciones (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre_aspirante VARCHAR(255) NOT NULL,
          nivel_academico VARCHAR(50) NOT NULL,
          grado_escolar VARCHAR(50) NOT NULL,
          fecha_nacimiento DATE NOT NULL,
          genero VARCHAR(20) NOT NULL,
          escuela_procedencia VARCHAR(255) NOT NULL,
          nombre_completo VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          whatsapp VARCHAR(20) NOT NULL,
          parentesco VARCHAR(50) NOT NULL,
          personas_asistiran VARCHAR(20) NOT NULL,
          medio_entero VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          reminder_sent BOOLEAN DEFAULT FALSE,
          reminder_scheduled_for TIMESTAMP WITH TIME ZONE,
          reminder_sent_at TIMESTAMP WITH TIME ZONE,
          confirmacion_asistencia VARCHAR(20) DEFAULT 'pendiente',
          fecha_confirmacion TIMESTAMP WITH TIME ZONE
        );
      `;

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error al crear tabla:', createError);
        throw createError;
      }
      
      console.log('✅ Tabla inscripciones creada exitosamente');
    } else {
      console.log('✅ Tabla inscripciones ya existe');
    }
  } catch (error) {
    console.error('Error al verificar/crear tabla:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = new Date();
  const logId = `RESTORE_${startTime.getTime()}`;
  
  console.log(`\n🔄 [${logId}] ===== INICIO DE RESTAURACIÓN DE BASE DE DATOS =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  
  try {
    const { backupFile } = await request.json();
    
    // Asegurar que la tabla existe
    console.log(`🔧 [${logId}] Verificando/creando tabla inscripciones...`);
    await ensureTableExists();

    let backupData;
    
    if (backupFile && backupFile !== 'latest') {
      // Restaurar desde archivo específico
      console.log(`📁 [${logId}] Descargando archivo específico: ${backupFile}`);
      backupData = await downloadBackupFile(backupFile);
    } else {
      // Obtener el backup más reciente
      console.log(`📁 [${logId}] Obteniendo lista de archivos de backup...`);
      const backupFiles = await getBackupFilesFromGitHub();
      
      if (backupFiles.length === 0) {
        throw new Error('No se encontraron archivos de backup en GitHub');
      }
      
      const latestFile = backupFiles[0];
      console.log(`📁 [${logId}] Archivo más reciente: ${latestFile.name}`);
      
      backupData = await downloadBackupFile(latestFile.download_url);
    }

    if (!backupData || !backupData.inscripciones) {
      throw new Error('Formato de archivo de backup inválido');
    }

    const inscripciones = backupData.inscripciones;
    console.log(`📊 [${logId}] Total de inscripciones a restaurar: ${inscripciones.length}`);

    // Limpiar tabla actual (opcional - comentado para seguridad)
    // console.log(`🗑️ [${logId}] Limpiando tabla actual...`);
    // await supabase.from('inscripciones').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insertar inscripciones
    console.log(`💾 [${logId}] Insertando inscripciones en la base de datos...`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Insertar en lotes de 100 para mejor rendimiento
    const batchSize = 100;
    for (let i = 0; i < inscripciones.length; i += batchSize) {
      const batch = inscripciones.slice(i, i + batchSize);
      
      try {
        const { error: insertError } = await supabase
          .from('inscripciones')
          .upsert(batch, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error(`❌ [${logId}] Error en lote ${i}-${i + batchSize}:`, insertError);
          errorCount += batch.length;
          errors.push(`Lote ${i}-${i + batchSize}: ${insertError.message}`);
        } else {
          successCount += batch.length;
          console.log(`✅ [${logId}] Lote ${i}-${i + batchSize} insertado exitosamente`);
        }
      } catch (batchError) {
        console.error(`❌ [${logId}] Error en lote ${i}-${i + batchSize}:`, batchError);
        errorCount += batch.length;
        errors.push(`Lote ${i}-${i + batchSize}: ${batchError instanceof Error ? batchError.message : 'Error desconocido'}`);
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n✅ [${logId}] ===== RESTAURACIÓN COMPLETADA =====`);
    console.log(`⏱️ [${logId}] Duración: ${duration}ms`);
    console.log(`📊 [${logId}] Inscripciones restauradas: ${successCount}`);
    console.log(`❌ [${logId}] Errores: ${errorCount}`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);

    return NextResponse.json({
      success: true,
      message: 'Restauración completada',
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      totalRecords: inscripciones.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Solo los primeros 10 errores
      backupMetadata: backupData.metadata
    });

  } catch (error) {
    const endTime = new Date();
    console.error(`\n💥 [${logId}] ===== ERROR EN RESTAURACIÓN =====`);
    console.error(`❌ [${logId}] Error:`, error);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json({
      success: false,
      message: 'Error durante la restauración',
      logId,
      timestamp: endTime.toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET endpoint para listar archivos de backup disponibles
export async function GET() {
  try {
    console.log('📋 Obteniendo lista de archivos de backup...');
    const backupFiles = await getBackupFilesFromGitHub();
    
    return NextResponse.json({
      success: true,
      files: backupFiles.map((file: any) => ({
        name: file.name,
        size: file.size,
        downloadUrl: file.download_url,
        lastModified: file.name.split('-')[2] + '-' + file.name.split('-')[3] // Extraer fecha del nombre
      })),
      totalFiles: backupFiles.length
    });
  } catch (error) {
    console.error('Error al obtener archivos de backup:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener archivos de backup',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
