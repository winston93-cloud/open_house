require('dotenv').config({ path: '.env.local' });
const { createAdminClient } = require('@insforge/sdk');
const fs = require('fs');
const path = require('path');

const project = JSON.parse(fs.readFileSync('.insforge/project.json', 'utf8'));
const admin = createAdminClient({
  baseUrl: project.oss_host,
  apiKey: project.api_key,
});

async function main() {
  const db = admin.database;
  const ids = process.argv.slice(2);
  if (ids.length === 0) {
    console.error('Uso: node delete-test-records.js <uuid-inscripcion> [uuid-sesion...]');
    process.exit(1);
  }

  for (const id of ids) {
    const { error: inscErr } = await db.from('inscripciones').delete().eq('id', id);
    if (inscErr) console.log('inscripciones', id, inscErr.message);
    else console.log('Eliminado de inscripciones:', id);

    const { error: sesErr } = await db.from('sesiones').delete().eq('id', id);
    if (sesErr) console.log('sesiones', id, sesErr.message);
    else console.log('Eliminado de sesiones:', id);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
