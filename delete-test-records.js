const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmxrccrbnoenkahefrrw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5teHJjY3Jibm9lbmthaGVmcnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE1MTg0OCwiZXhwIjoyMDY5NzI3ODQ4fQ._SIR3rmq7TWukuym30cCP4BAKGe-dhnillDV0Bz6Hf0'
);

async function deleteTestRecords() {
  console.log('🗑️  Eliminando registros de prueba...\n');
  
  const email = 'isc.escobedo@gmail.com';
  
  // Eliminar de inscripciones
  console.log('📋 Eliminando de INSCRIPCIONES...');
  const { data: inscDeleted, error: errorInsc } = await supabase
    .from('inscripciones')
    .delete()
    .eq('email', email)
    .select();
  
  if (errorInsc) {
    console.error('❌ Error:', errorInsc.message);
  } else {
    console.log(`✅ Eliminados ${inscDeleted?.length || 0} registros de inscripciones`);
    if (inscDeleted && inscDeleted.length > 0) {
      inscDeleted.forEach((r, idx) => {
        console.log(`   ${idx + 1}. ${r.nombre_aspirante} (ID: ${r.id})`);
      });
    }
  }
  
  console.log('');
  
  // Eliminar de sesiones
  console.log('📚 Eliminando de SESIONES...');
  const { data: sesDeleted, error: errorSes } = await supabase
    .from('sesiones')
    .delete()
    .eq('email', email)
    .select();
  
  if (errorSes) {
    console.error('❌ Error:', errorSes.message);
  } else {
    console.log(`✅ Eliminados ${sesDeleted?.length || 0} registros de sesiones`);
    if (sesDeleted && sesDeleted.length > 0) {
      sesDeleted.forEach((r, idx) => {
        console.log(`   ${idx + 1}. ${r.nombre_aspirante} (ID: ${r.id})`);
      });
    }
  }
  
  console.log('');
  console.log('🎉 Registros de prueba eliminados');
}

deleteTestRecords().catch(console.error);

