#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmxrccrbnoenkahefrrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0'
);

async function checkInscripcion() {
  // Buscar en inscripciones
  const { data: inscripcion, error: errorInscripcion } = await supabase
    .from('inscripciones')
    .select('*')
    .eq('email', 'isc.escobedo@gmail.com')
    .single();

  if (inscripcion) {
    console.log('\n📧 INSCRIPCIÓN ENCONTRADA EN "inscripciones":');
    console.log('ID:', inscripcion.id);
    console.log('Email:', inscripcion.email);
    console.log('Nombre Aspirante:', inscripcion.nombre_aspirante);
    console.log('Reminder Scheduled For:', inscripcion.reminder_scheduled_for);
    console.log('Reminder Sent:', inscripcion.reminder_sent);
    console.log('Reminder Sent At:', inscripcion.reminder_sent_at);
    console.log('Created At:', inscripcion.created_at);
  } else {
    console.log('\n❌ No encontrado en "inscripciones"');
    if (errorInscripcion) console.log('Error:', errorInscripcion.message);
  }

  // Buscar en sesiones
  const { data: sesion, error: errorSesion } = await supabase
    .from('sesiones')
    .select('*')
    .eq('email', 'isc.escobedo@gmail.com')
    .single();

  if (sesion) {
    console.log('\n📧 INSCRIPCIÓN ENCONTRADA EN "sesiones":');
    console.log('ID:', sesion.id);
    console.log('Email:', sesion.email);
    console.log('Nombre Aspirante:', sesion.nombre_aspirante);
    console.log('Reminder Scheduled For:', sesion.reminder_scheduled_for);
    console.log('Reminder Sent:', sesion.reminder_sent);
    console.log('Reminder Sent At:', sesion.reminder_sent_at);
    console.log('Created At:', sesion.created_at);
  } else {
    console.log('\n❌ No encontrado en "sesiones"');
    if (errorSesion) console.log('Error:', errorSesion.message);
  }

  // Ver qué registros tenían reminder_scheduled_for para hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log('\n📅 Buscando recordatorios programados para hoy (18 nov 2025):');
  console.log('Rango:', today.toISOString(), 'a', tomorrow.toISOString());

  const { data: todayReminders, error: todayError } = await supabase
    .from('inscripciones')
    .select('id, email, nombre_aspirante, reminder_scheduled_for, reminder_sent')
    .gte('reminder_scheduled_for', today.toISOString())
    .lt('reminder_scheduled_for', tomorrow.toISOString());

  if (todayReminders && todayReminders.length > 0) {
    console.log(`\n✅ Encontrados ${todayReminders.length} recordatorios para hoy:`);
    todayReminders.forEach(r => {
      console.log(`  - ${r.email} | ${r.nombre_aspirante} | Sent: ${r.reminder_sent} | Scheduled: ${r.reminder_scheduled_for}`);
    });
  } else {
    console.log('\n❌ No hay recordatorios programados para hoy');
  }
}

checkInscripcion().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

