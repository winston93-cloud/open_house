#!/usr/bin/env node

/**
 * Script para enviar recordatorios automáticos
 * Este script debe ejecutarse diariamente como un cron job
 * 
 * Configuración del cron job (crontab -e):
 * 0 9 * * * /usr/bin/node /ruta/completa/al/proyecto/scripts/send-reminders.js
 * 
 * Esto ejecutará el script todos los días a las 9:00 AM
 */

const https = require('https');
const http = require('http');

// Configuración
const REMINDER_API_URL = process.env.REMINDER_API_URL || 'http://localhost:3000/api/reminders';
const REMINDER_API_TOKEN = process.env.REMINDER_API_TOKEN || 'default-secret-token';

console.log('🕐 Iniciando envío de recordatorios...');
console.log(`📍 URL del API: ${REMINDER_API_URL}`);
console.log(`🔐 Token configurado: ${REMINDER_API_TOKEN.substring(0, 10)}...`);

// Función para hacer la petición HTTP/HTTPS
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Función principal
async function sendReminders() {
  try {
    const url = new URL(REMINDER_API_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REMINDER_API_TOKEN}`,
        'User-Agent': 'ReminderBot/1.0'
      }
    };
    
    console.log('📡 Enviando petición al API de recordatorios...');
    
    const response = await makeRequest(REMINDER_API_URL, options);
    
    console.log(`📊 Respuesta del servidor: ${response.statusCode}`);
    console.log('📋 Resultado:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log('✅ Recordatorios procesados exitosamente');
      
      if (response.data.processed > 0) {
        console.log(`📧 Se procesaron ${response.data.processed} recordatorios`);
        console.log(`✅ Exitosos: ${response.data.successful}`);
        console.log(`❌ Errores: ${response.data.errors}`);
      } else {
        console.log('ℹ️ No había recordatorios pendientes');
      }
    } else {
      console.error('❌ Error en la respuesta del servidor:', response.data);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error al enviar recordatorios:', error.message);
    console.error('🔍 Detalles del error:', error);
    process.exit(1);
  }
}

// Función para verificar el estado del sistema
async function checkSystemStatus() {
  try {
    const url = new URL(REMINDER_API_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': 'ReminderBot/1.0'
      }
    };
    
    console.log('🔍 Verificando estado del sistema...');
    
    const response = await makeRequest(REMINDER_API_URL, options);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`📊 Estado del sistema: ${response.data.count} recordatorios pendientes`);
      if (response.data.pendingReminders && response.data.pendingReminders.length > 0) {
        console.log('📋 Recordatorios pendientes:');
        response.data.pendingReminders.forEach((reminder, index) => {
          const daysSinceRegistration = Math.floor(
            (new Date() - new Date(reminder.created_at)) / (1000 * 60 * 60 * 24)
          );
          console.log(`  ${index + 1}. ${reminder.email} (${reminder.nivel_academico}) - ${daysSinceRegistration} días desde registro`);
        });
      }
    } else {
      console.error('❌ Error al verificar estado:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error al verificar estado del sistema:', error.message);
  }
}

// Función principal del script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status') || args.includes('-s')) {
    await checkSystemStatus();
  } else {
    await sendReminders();
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n⏹️ Script interrumpido por el usuario');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Script terminado por el sistema');
  process.exit(0);
});

// Ejecutar el script principal
main().then(() => {
  console.log('🏁 Script completado exitosamente');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error fatal en el script:', error);
  process.exit(1);
});
