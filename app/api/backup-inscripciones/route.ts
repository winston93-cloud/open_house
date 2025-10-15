import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import nodemailer from 'nodemailer';

// Función para enviar email de confirmación de backup consolidado
async function sendBackupNotification(
  inscripcionesData: any, 
  inscripcionesTotal: number,
  sesionesData: any,
  sesionesTotal: number
) {
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
    subject: `📊 Backup Automático Completo - ${new Date().toLocaleDateString('es-MX')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; text-align: center; font-size: 24px;">📊 Backup Automático Completado</h2>
          <p style="margin: 10px 0 0 0; text-align: center; opacity: 0.9;">Sistema Winston Churchill</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 0 0 10px 10px;">
          <!-- Resumen General -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📈 Resumen General</h3>
            <ul style="color: #666; line-height: 1.8; font-size: 14px;">
              <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-MX')}</li>
              <li><strong>Total de backups:</strong> 2 (Inscripciones + Sesiones)</li>
              <li><strong>Estado:</strong> ✅ Todos los backups exitosos</li>
            </ul>
          </div>

          <!-- Open House -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0; display: flex; align-items: center; gap: 10px;">
              🎓 Open House
            </h3>
            <div style="background: #f0f4ff; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${inscripcionesTotal} inscripciones</p>
              <p style="margin: 5px 0;"><strong>Repositorio:</strong> winston93-cloud/inscripciones</p>
            </div>
            ${inscripcionesTotal > 0 ? `
              <h4 style="color: #555; margin: 15px 0 10px 0; font-size: 14px;">📋 Últimas 3 inscripciones:</h4>
              <div style="max-height: 150px; overflow-y: auto;">
                ${inscripcionesData.slice(-3).map((inscripcion: any) => `
                  <div style="border-left: 3px solid #667eea; padding: 8px 0 8px 12px; margin-bottom: 8px; background: #fafbff;">
                    <strong style="color: #333;">${inscripcion.nombre_aspirante}</strong><br>
                    <small style="color: #666; font-size: 12px;">
                      ${inscripcion.nivel_academico} - ${inscripcion.grado_escolar} | 
                      ${new Date(inscripcion.created_at).toLocaleString('es-MX')}
                    </small>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: #999; font-style: italic; margin: 0;">No hay inscripciones registradas aún.</p>'}
          </div>

          <!-- Sesiones Informativas -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #FA9D00;">
            <h3 style="color: #FA9D00; margin-top: 0; display: flex; align-items: center; gap: 10px;">
              📋 Sesiones Informativas
            </h3>
            <div style="background: #fff7ed; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
              <p style="margin: 5px 0;"><strong>Total de registros:</strong> ${sesionesTotal} sesiones</p>
              <p style="margin: 5px 0;"><strong>Repositorio:</strong> winston93-cloud/sesiones-informativas</p>
            </div>
            ${sesionesTotal > 0 ? `
              <h4 style="color: #555; margin: 15px 0 10px 0; font-size: 14px;">📋 Últimas 3 sesiones:</h4>
              <div style="max-height: 150px; overflow-y: auto;">
                ${sesionesData.slice(-3).map((sesion: any) => `
                  <div style="border-left: 3px solid #FA9D00; padding: 8px 0 8px 12px; margin-bottom: 8px; background: #fffbf5;">
                    <strong style="color: #333;">${sesion.nombre_aspirante}</strong><br>
                    <small style="color: #666; font-size: 12px;">
                      ${sesion.nivel_academico} - ${sesion.grado_escolar} | 
                      ${new Date(sesion.created_at).toLocaleString('es-MX')}
                    </small>
                  </div>
                `).join('')}
              </div>
            ` : '<p style="color: #999; font-style: italic; margin: 0;">No hay sesiones registradas aún.</p>'}
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #2d5a2d; font-weight: 600;">
              ✅ Backup automático completado exitosamente<br>
              <span style="font-size: 13px; font-weight: normal;">Los datos han sido respaldados en los repositorios de GitHub</span>
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
    console.log('✅ Email de backup consolidado enviado exitosamente');
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
      telefono: inscripcion.telefono || 'N/A',
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
  const logId = `BACKUP_CONSOLIDADO_${startTime.getTime()}`;
  
  console.log(`\n🔄 [${logId}] ===== INICIO DE BACKUP CONSOLIDADO =====`);
  console.log(`📅 [${logId}] Fecha y hora: ${startTime.toLocaleString('es-MX')}`);
  
  try {
    // ========== BACKUP 1: INSCRIPCIONES (OPEN HOUSE) ==========
    console.log(`\n📦 [${logId}] === INICIANDO BACKUP DE INSCRIPCIONES ===`);
    
    const { data: inscripciones, error: inscripcionesError } = await supabase
      .from('inscripciones')
      .select('*')
      .order('created_at', { ascending: false });

    if (inscripcionesError) {
      console.error(`❌ [${logId}] Error al obtener inscripciones:`, inscripcionesError);
      throw new Error(`Error al obtener inscripciones: ${inscripcionesError.message}`);
    }

    const totalInscripciones = inscripciones?.length || 0;
    console.log(`📊 [${logId}] Total de inscripciones: ${totalInscripciones}`);

    let inscripcionesBackupResult = null;
    if (totalInscripciones > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `inscripciones-backup-${timestamp}.json`;
      const backupContent = createBackupFile(inscripciones);
      
      inscripcionesBackupResult = await uploadToGitHub(backupContent, fileName);
      console.log(`✅ [${logId}] Backup de inscripciones completado`);
    } else {
      console.log(`⚠️ [${logId}] No hay inscripciones para respaldar`);
    }

    // ========== BACKUP 2: SESIONES INFORMATIVAS ==========
    console.log(`\n📦 [${logId}] === INICIANDO BACKUP DE SESIONES ===`);
    
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesiones')
      .select('*')
      .order('created_at', { ascending: false });

    if (sesionesError) {
      console.error(`❌ [${logId}] Error al obtener sesiones:`, sesionesError);
      throw new Error(`Error al obtener sesiones: ${sesionesError.message}`);
    }

    const totalSesiones = sesiones?.length || 0;
    console.log(`📊 [${logId}] Total de sesiones: ${totalSesiones}`);

    let sesionesBackupResult = null;
    if (totalSesiones > 0) {
      // Crear backup de sesiones
      const backupData = {
        metadata: {
          fecha_backup: new Date().toISOString(),
          total_registros: sesiones.length,
          version: '1.0',
          sistema: 'Sesiones Informativas Winston Churchill'
        },
        sesiones: sesiones.map((sesion: any) => ({
          id: sesion.id,
          nombre_aspirante: sesion.nombre_aspirante,
          nivel_academico: sesion.nivel_academico,
          grado_escolar: sesion.grado_escolar,
          fecha_nacimiento: sesion.fecha_nacimiento,
          nombre_padre: sesion.nombre_padre || 'N/A',
          nombre_madre: sesion.nombre_madre || 'N/A',
          telefono: sesion.telefono || 'N/A',
          email: sesion.email,
          direccion: sesion.direccion || 'N/A',
          created_at: sesion.created_at,
          fecha_inscripcion: sesion.fecha_inscripcion,
          updated_at: sesion.updated_at,
          reminder_sent: sesion.reminder_sent,
          reminder_scheduled_for: sesion.reminder_scheduled_for,
          reminder_sent_at: sesion.reminder_sent_at,
          confirmacion_asistencia: sesion.confirmacion_asistencia,
          fecha_confirmacion: sesion.fecha_confirmacion,
          parentesco: sesion.parentesco,
          personas_asistiran: sesion.personas_asistiran,
          medio_entero: sesion.medio_entero
        }))
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `sesiones-backup-${timestamp}.json`;
      const backupContent = JSON.stringify(backupData, null, 2);
      
      // Subir a GitHub (repo diferente)
      const token = process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error('GITHUB_TOKEN no configurado');
      }

      const owner = 'winston93-cloud';
      const repo = 'sesiones-informativas';
      const path = `backups/${fileName}`;
      const content = Buffer.from(backupContent).toString('base64');

      const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Backup automático de sesiones informativas - ${new Date().toISOString()}`,
          content: content,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error(`Error al subir backup de sesiones: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      sesionesBackupResult = { success: true, url: result.content.html_url };
      console.log(`✅ [${logId}] Backup de sesiones completado`);
    } else {
      console.log(`⚠️ [${logId}] No hay sesiones para respaldar`);
    }

    // ========== ENVIAR EMAIL CONSOLIDADO ==========
    console.log(`\n📧 [${logId}] Enviando email consolidado...`);
    await sendBackupNotification(
      inscripciones || [],
      totalInscripciones,
      sesiones || [],
      totalSesiones
    );

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log(`\n✅ [${logId}] ===== BACKUP CONSOLIDADO COMPLETADO =====`);
    console.log(`⏱️ [${logId}] Duración total: ${duration}ms`);
    console.log(`📊 [${logId}] Inscripciones respaldadas: ${totalInscripciones}`);
    console.log(`📊 [${logId}] Sesiones respaldadas: ${totalSesiones}`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====\n`);

    return NextResponse.json({
      success: true,
      message: 'Backup consolidado completado exitosamente',
      logId,
      timestamp: endTime.toISOString(),
      duration: `${duration}ms`,
      inscripciones: {
        totalRecords: totalInscripciones,
        backupSuccess: inscripcionesBackupResult?.success || false,
        githubUrl: inscripcionesBackupResult?.url || null
      },
      sesiones: {
        totalRecords: totalSesiones,
        backupSuccess: sesionesBackupResult?.success || false,
        githubUrl: sesionesBackupResult?.url || null
      },
      emailSent: true
    });

  } catch (error) {
    const endTime = new Date();
    console.error(`\n💥 [${logId}] ===== ERROR EN BACKUP CONSOLIDADO =====`);
    console.error(`❌ [${logId}] Error:`, error);
    console.error(`🎯 [${logId}] ===== FIN DEL LOG DE ERROR =====\n`);
    
    return NextResponse.json({
      success: false,
      message: 'Error durante el proceso de backup consolidado',
      logId,
      timestamp: endTime.toISOString(),
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
