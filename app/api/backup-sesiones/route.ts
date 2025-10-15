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
    subject: `📊 Backup Automático - Sesiones Informativas ${new Date().toLocaleDateString('es-MX')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FA9D00 0%, #E88D00 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; text-align: center;">📊 Backup Automático Completado</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">📈 Resumen del Backup</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-MX')}</li>
              <li><strong>Total de registros:</strong> ${totalRecords} sesiones informativas</li>
              <li><strong>Estado:</strong> ✅ Backup exitoso</li>
              <li><strong>Repositorio:</strong> winston93-cloud/sesiones-informativas</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0;">📋 Últimas Sesiones Informativas</h3>
            <div style="max-height: 200px; overflow-y: auto;">
              ${backupData.slice(-5).map((sesion: any) => `
                <div style="border-left: 3px solid #FA9D00; padding-left: 10px; margin-bottom: 10px;">
                  <strong>${sesion.nombre_aspirante}</strong><br>
                  <small style="color: #666;">
                    ${sesion.nivel_academico} - ${sesion.grado_escolar} | 
                    ${new Date(sesion.created_at).toLocaleString('es-MX')}
                  </small>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="background: #fff7ed; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #c2410c;">
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
function createBackupFile(sesiones: any[]) {
  const backupData = {
    metadata: {
      fecha_backup: new Date().toISOString(),
      total_registros: sesiones.length,
      version: '1.0',
      sistema: 'Sesiones Informativas Winston Churchill'
    },
    sesiones: sesiones.map(sesion => ({
      id: sesion.id,
      nombre_aspirante: sesion.nombre_aspirante,
      nivel_academico: sesion.nivel_academico,
      grado_escolar: sesion.grado_escolar,
      fecha_nacimiento: sesion.fecha_nacimiento,
      nombre_padre: sesion.nombre_padre || sesion.nombre_completo || 'N/A',
      nombre_madre: sesion.nombre_madre || sesion.nombre_completo || 'N/A',
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

  return JSON.stringify(backupData, null, 2);
}

// Función para subir backup a GitHub
async function uploadToGitHub(backupContent: string, fileName: string) {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GITHUB_TOKEN no configurado');
  }

  console.log('📤 Subiendo backup a GitHub:', fileName);
  console.log('📊 Tamaño del archivo:', backupContent.length, 'caracteres');

  const owner = 'winston93-cloud';
  const repo = 'sesiones-informativas';
  const path = `backups/${fileName}`;
  
  // Crear el contenido en base64
  const content = Buffer.from(backupContent).toString('base64');

  try {
    // Verificar si el archivo ya existe
    const checkUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const checkResponse = await fetch(checkUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let sha = null;
    if (checkResponse.ok) {
      const existingFile = await checkResponse.json();
      sha = existingFile.sha;
    }

    // Subir o actualizar el archivo
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
        sha: sha,
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Error al subir a GitHub:', errorText);
      throw new Error(`Error al subir a GitHub: ${uploadResponse.status} - ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('✅ Backup subido exitosamente a GitHub');
    console.log('🔗 URL:', result.content.html_url);

    return result.content.html_url;
  } catch (error) {
    console.error('❌ Error en uploadToGitHub:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const logId = `BACKUP_SESIONES_${Date.now()}`;
  
  try {
    console.log(`🔄 [${logId}] ===== INICIO DE BACKUP AUTOMÁTICO =====`);
    console.log(`📅 [${logId}] Fecha y hora: ${new Date().toLocaleString('es-MX')}`);
    
    // Obtener datos de sesiones
    console.log(`🔍 [${logId}] Obteniendo datos de sesiones...`);
    const { data: sesiones, error } = await supabase
      .from('sesiones')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ [${logId}] Error al obtener sesiones:`, error);
      throw error;
    }

    console.log(`📊 [${logId}] Total de sesiones encontradas: ${sesiones?.length || 0}`);

    // Crear archivo de backup
    console.log(`📝 [${logId}] Creando archivo de backup...`);
    const backupContent = createBackupFile(sesiones || []);
    
    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `sesiones-backup-${timestamp}.json`;

    // Subir a GitHub
    console.log(`📤 [${logId}] Subiendo a GitHub...`);
    const githubUrl = await uploadToGitHub(backupContent, fileName);

    // Enviar email de confirmación
    console.log(`📧 [${logId}] Enviando email de confirmación...`);
    await sendBackupNotification(sesiones || [], sesiones?.length || 0);

    console.log(`✅ [${logId}] ===== BACKUP COMPLETADO EXITOSAMENTE =====`);
    console.log(`⏱️ [${logId}] Duración: ${Date.now() - parseInt(logId.split('_')[2])}ms`);
    console.log(`📊 [${logId}] Registros respaldados: ${sesiones?.length || 0}`);
    console.log(`📁 [${logId}] Archivo: ${fileName}`);
    console.log(`🎯 [${logId}] ===== FIN DEL LOG =====`);

    return NextResponse.json({
      success: true,
      message: 'Backup completado exitosamente',
      totalRecords: sesiones?.length || 0,
      fileName: fileName,
      githubUrl: githubUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ [${logId}] Error en backup:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

