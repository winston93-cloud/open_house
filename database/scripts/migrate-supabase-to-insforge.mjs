#!/usr/bin/env node
/**
 * Fase 2: exporta datos de Supabase e importa en InsForge Open_House.
 * Uso: node database/scripts/migrate-supabase-to-insforge.mjs [--export-only] [--import-only]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const EXPORT_DIR = path.join(ROOT, 'database/export');
const TABLES = [
  'inscripciones',
  'sesiones',
  'taller_ia',
  'kommo_lead_tracking',
  'campamento_verano',
];
const BATCH_SIZE = 200;

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) throw new Error('Missing .env.local');
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

function loadInsforgeConfig() {
  const cfgPath = path.join(ROOT, '.insforge/project.json');
  if (!fs.existsSync(cfgPath)) throw new Error('Missing .insforge/project.json — run insforge link first');
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

async function fetchAllRows(baseUrl, apiKey, table) {
  const rows = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Range: `${from}-${from + pageSize - 1}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Export ${table} failed (${res.status}): ${text}`);
    }
    const chunk = await res.json();
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    rows.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

async function insertBatch(baseUrl, apiKey, table, batch) {
  const res = await fetch(`${baseUrl}/api/database/records/${table}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Import ${table} batch failed (${res.status}): ${text}`);
  }
}

async function countRows(baseUrl, apiKey, table) {
  const res = await fetch(`${baseUrl}/api/database/records/${table}?select=id&limit=0`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const total = res.headers.get('x-total-count');
  if (total && total !== '*') return total;
  // Fallback: paginate count
  let count = 0;
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const page = await fetch(
      `${baseUrl}/api/database/records/${table}?select=id&limit=${pageSize}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!page.ok) throw new Error(`Count ${table} failed (${page.status})`);
    const rows = await page.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    count += rows.length;
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return String(count);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function exportTables(supabaseUrl, supabaseKey) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  const summary = {};

  for (const table of TABLES) {
    process.stdout.write(`Exportando ${table}... `);
    const rows = await fetchAllRows(supabaseUrl, supabaseKey, table);
    const file = path.join(EXPORT_DIR, `${table}.json`);
    fs.writeFileSync(file, JSON.stringify(rows, null, 2));
    summary[table] = rows.length;
    console.log(`${rows.length} filas → ${path.relative(ROOT, file)}`);
  }
  return summary;
}

async function importTables(insforgeUrl, insforgeKey, sourceSummary) {
  const summary = {};

  for (const table of TABLES) {
    const file = path.join(EXPORT_DIR, `${table}.json`);
    if (!fs.existsSync(file)) throw new Error(`Missing export file: ${file}`);
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    process.stdout.write(`Importando ${table} (${rows.length} filas)... `);

    if (rows.length === 0) {
      console.log('sin datos');
      summary[table] = 0;
      continue;
    }

    const batches = chunk(rows, BATCH_SIZE);
    for (let i = 0; i < batches.length; i++) {
      await insertBatch(insforgeUrl, insforgeKey, table, batches[i]);
    }
    const count = await countRows(insforgeUrl, insforgeKey, table);
    summary[table] = { exported: rows.length, imported: count };
    console.log(`OK (${count} en destino)`);
  }
  return summary;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const exportOnly = args.has('--export-only');
  const importOnly = args.has('--import-only');

  const env = loadEnvLocal();
  const insforge = loadInsforgeConfig();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const insforgeUrl = insforge.oss_host;
  const insforgeKey = insforge.api_key;

  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env vars');
  if (!insforgeUrl || !insforgeKey) throw new Error('Missing InsForge config');

  console.log('=== Fase 2: migración de datos Supabase → InsForge ===\n');

  if (!importOnly) {
    console.log('-- EXPORT --');
    const exported = await exportTables(supabaseUrl, supabaseKey);
    console.log('\nResumen export:', exported);
    if (exportOnly) return;
  }

  console.log('\n-- IMPORT --');
  const imported = await importTables(insforgeUrl, insforgeKey);
  console.log('\nResumen import:', JSON.stringify(imported, null, 2));

  console.log('\n-- VERIFICACIÓN --');
  let ok = true;
  for (const table of TABLES) {
    const src = importOnly
      ? JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, `${table}.json`), 'utf8')).length
      : (await fetchAllRows(supabaseUrl, supabaseKey, table)).length;
    const dst = await countRows(insforgeUrl, insforgeKey, table);
    const match = String(src) === String(dst);
    console.log(`${table}: supabase=${src} insforge=${dst} ${match ? '✓' : '✗ MISMATCH'}`);
    if (!match) ok = false;
  }

  if (!ok) {
    console.error('\n❌ Verificación fallida — revisar errores arriba');
    process.exit(1);
  }
  console.log('\n✅ Migración de datos completada');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
