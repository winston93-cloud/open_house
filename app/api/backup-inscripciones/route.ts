import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import nodemailer from 'nodemailer';

// Función para enviar email de confirmación de backup
async function sendBackupNotification(backupData: any, totalRecords: number) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'isc.escobedo@gmail.com',
    subject: `📊 Backup Automático - Inscripciones ${new Date().toLocaleDateString('es-MX')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; text-align: center;">📊 Backup Automático Completado</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">📈 Resumen del Backup</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-MX')}</li>
              <li><strong>Total de registros:</strong> ${totalRecords} inscripciones</li>
              <li><strong>Estado:</strong> ✅ Backup exitoso</li>
              <li><strong>Repositorio:</strong> winston93-cloud/inscripciones</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">📋 Últimas Inscripciones</h3>
            <div style="max-height: 200px; overflow-y: auto;">
              ${backupData.slice(-5).map((inscripcion: any) => `
                <div style="border-left: 3px solid #667eea; padding-left: 10px; margin-bottom: 10px;">
                  <strong>${inscripcion.nombre_aspirante}</strong><br>
                  <small style="color: #666;">
                    ${inscripcion.nivel_academico} - ${inscripcion.grado_escolar} | 
                    ${new Date(inscripcion.created_at).toLocaleString('es-MX')}
                  </small>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #2d5a2d;">
              <strong>✅ Backup automático completado exitosamente</strong><br>
              Los datos han sido respaldados en el repositorio de GitHub
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>Backup automático - Sistema Winston Churchill</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email de backup enviado exitosamente');
  } catch (error) {
    console.error('❌ Error al enviar email de backup:', error);
  }
}

// Función para crear backup en formato JSON
function createBackupFile(inscripciones: any[]) {
  const backupData = {
    metadata: {
      fecha_backup: new Date().toISOString(),
      total_registros: inscripciones.length,
      version: '1.0',
      sistema: 'Open House Winston Churchill'
    },
    inscripciones: inscripciones.map(inscripcion => ({
      id: inscripcion.id,
      nombre_aspirante: inscripcion.nombre_aspirante,
      nivel_academico: inscripcion.nivel_academico,
      grado_escolar: inscripcion.grado_escolar,
      fecha_nacimiento: inscripcion.fecha_nacimiento,
      nombre_padre: inscripcion.nombre_padre || inscripcion.nombre_completo || 'N/A',
      nombre_madre: inscripcion.nombre_madre || inscripcion.nombre_completo || 'N/A',
      telefono: inscripcion.telefono || inscripcion.whatsapp || 'N/A',
      whatsapp: inscripcion.whatsapp,
      email: inscripcion.email,
      direccion: inscripcion.direccion || 'N/A',
      created_at: inscripcion.created_at,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      updated_at: inscripcion.updated_at,
      reminder_sent: inscripcion.reminder_sent,
      reminder_scheduled_for: inscripcion.reminder_scheduled_for,
      reminder_sent_at: inscripcion.reminder_sent_at,
      confirmacion_asistencia: inscripcion.confirmacion_asistencia,
      fecha_confirmacion: inscripcion.fecha_confirmacion
    }))
  };

  return JSON.stringify(backupData, null, 2);
}

// Función para subir a GitHub usando la GitHub API
async function uploadToGitHub(backupContent: string, fileName: string) {
  console.log(`📤 Subiendo backup a GitHub: ${fileName}`);
  console.log(`📊 Tamaño del archivo: ${backupContent.length} caracteres`);
  
  try {
    // GitHub API endpoint para crear/actualizar archivos
    const githubUrl = `https://api.github.com/repos/winston93-cloud/inscripciones/contents/backups/${fileName}`;
    
    // Codificar el contenido en base64
    const content = Buffer.from(backupContent).toString('base64');
    
    // Preparar el mensaje de commit
    const commitMessage = `Backup automático: ${fileName}`;
    
    // Hacer la petición a la GitHub API
    const response = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: content,
        branch: 'main',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en GitHub API: ${response.status} - ${errorText}`);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`✅ Backup subido exitosamente a GitHub`);
    console.log(`🔗 URL: ${result.content.html_url}`);
    
    return {
      success: true,
      url: result.content.html_url,
      sha: result.content.sha,
      downloadUrl: result.content.download_url
    };
  } catch (error) {
    console.error('❌ Error al subir a GitHub:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const startTime = new Date();
  const logId = `BACKUP_${startTime.getTime()}`;
  
  console.log(`\n🔄 [${logId}] ===== INICIO DE BACKUP AUTOMÁTICO =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  
  try {
    // Verificar si estamos en el horario permitido (8:00 AM - 12:00 AM)
    const currentHour = new Date().getHours();
    if (currentHour < 8 || currentHour >= 24) {
      console.log(`⏰ [${logId}] Fuera del horario de backup (8:00 AM - 12:00 AM). Hora actual: ${currentHour}`);
      return NextResponse.json({
        success: false,
        message: 'Backup solo disponible entre 8:00 AM y 12:00 AM',
        currentHour,
        allowedHours: '8:00 AM - 12:00 AM'
      }, { status: 200 });
    }

    // Obtener todas las inscripciones
    console.log(`🔍 [${logId}] Obteniendo datos de inscripciones...`);
    const { data: inscripciones, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error(`❌ [${logId}] Error al obtener inscripciones:`, dbError);
      return NextResponse.json({
        success: false,
        message: 'Error al obtener datos de inscripciones',
        error: dbError.message
      }, { status: 500 });
    }

    const totalRecords = inscripciones?.length || 0;
    console.log(`📊 [${logId}] Total de inscripciones encontradas: ${totalRecords}`);
    console.log(`📋 [${logId}] IDs de inscripciones:`, inscripciones?.map((i: any) => i.id));

    if (totalRecords === 0) {
      console.log(`⚠️ [${logId}] No hay inscripciones para respaldar`);
      return NextResponse.json({
        success: true,
        message: 'No hay inscripciones para respaldar',
        totalRecords: 0
      });
    }

    // Crear archivo de backup
    console.log(`📝 [${logId}] Creando archivo de backup...`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `inscripciones-backup-${timestamp}.json`;
    const backupContent = createBackupFile(inscripciones);

    // Subir a GitHub
    console.log(`📤 [${logId}] Subiendo a GitHub...`);
    const uploadResult = await uploadToGitHub(backupContent, fileName);

    if (!uploadResult.success) {
      throw new Error('Error al subir backup a GitHub');
    }

    // Enviar email de confirmación
    console.log(`📧 [${logId}] Enviando email de confirmación...`);
    await sendBackupNotification(inscripciones, totalRecords);

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n✅ [${logId}] ===== BACKUP COMPLETADO EXITOSAMENTE =====`);
    console.log(`⏱️ [${logId}] Duración: ${duration}ms`);
    console.log(`📊 [${logId}] Registros respaldados: ${totalRecords}`);
    console.log(`📁 [${logId}] Archivo: ${fileName}`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);

    return NextResponse.json({
      success: true,
      message: 'Backup completado exitosamente',
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      totalRecords,
      fileName,
      githubUrl: uploadResult.url,
      emailSent: true
    });

  } catch (error) {
    const endTime = new Date();
    console.error(`\n💥 [${logId}] ===== ERROR EN BACKUP =====`);
    console.error(`❌ [${logId}] Error:`, error);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json({
      success: false,
      message: 'Error durante el proceso de backup',
      logId,
      timestamp: endTime.toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
