#!/usr/bin/env node
/**
 * Cutover open_house → Winston Servicios en Vercel + .env.local.
 * Lee .insforge de servicios_admin (debe ser g4ta4bfg). No imprime secrets.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OH_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SERVICIOS_ROOT = '/home/mario/Proyectos/servicios_admin'
const cfg = JSON.parse(fs.readFileSync(path.join(SERVICIOS_ROOT, '.insforge/project.json'), 'utf8'))

if (!String(cfg.oss_host || '').includes('g4ta4bfg')) {
  console.error('✗ servicios_admin .insforge no apunta a Winston (g4ta4bfg)')
  process.exit(1)
}

let anonKey = ''
try {
  anonKey = execSync('npx -y @insforge/cli secrets get ANON_KEY', {
    cwd: SERVICIOS_ROOT,
    encoding: 'utf8',
  })
    .trim()
    .replace(/^ANON_KEY\s*=\s*/i, '')
} catch {
  console.warn('⚠ No se pudo leer ANON_KEY; se omite NEXT_PUBLIC_INSFORGE_ANON_KEY')
}

const vars = {
  NEXT_PUBLIC_INSFORGE_URL: cfg.oss_host,
  INSFORGE_URL: cfg.oss_host,
  INSFORGE_API_KEY: cfg.api_key,
}
if (anonKey) vars.NEXT_PUBLIC_INSFORGE_ANON_KEY = anonKey

const envPath = path.join(OH_ROOT, '.env.local')
let envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''
function upsertEnv(text, key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm')
  if (re.test(text)) return text.replace(re, `${key}=${value}`)
  return `${text.trimEnd()}\n${key}=${value}\n`
}
for (const [k, v] of Object.entries(vars)) {
  envText = upsertEnv(envText, k, v)
}
fs.writeFileSync(envPath, envText)
console.log('✓ open_house/.env.local → Winston')

execSync(
  `npx -y @insforge/cli link --project-id 1a769c0a-ab1b-4500-bb6b-1e8bb131980b -y --json`,
  { cwd: OH_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
)
console.log('✓ open_house CLI link → Winston')

const environments = process.argv.includes('--dev-only')
  ? ['development']
  : ['production', 'preview', 'development']

function run(cmd, input) {
  execSync(cmd, {
    cwd: OH_ROOT,
    input: input ?? undefined,
    stdio: input !== undefined ? ['pipe', 'pipe', 'pipe'] : ['inherit', 'pipe', 'pipe'],
    encoding: 'utf8',
  })
}

if (!fs.existsSync(path.join(OH_ROOT, '.vercel/project.json'))) {
  run('npx -y vercel link --yes --project open-house')
  console.log('✓ Enlazado a Vercel project open-house')
}

let ok = 0
let fail = 0
for (const [name, value] of Object.entries(vars)) {
  for (const env of environments) {
    const sensitive = name.includes('KEY') && !name.startsWith('NEXT_PUBLIC_') ? ' --sensitive' : ''
    const typeFlag = name.startsWith('NEXT_PUBLIC_') && name.includes('KEY') ? ' --type config' : ''
    try {
      run(`npx -y vercel env add ${name} ${env} --yes --force${sensitive}${typeFlag}`, value)
      console.log(`✓ ${name} → ${env}`)
      ok++
    } catch (err) {
      const msg = err.stderr || err.message || String(err)
      console.error(`✗ ${name} → ${env}: ${String(msg).slice(0, 200)}`)
      fail++
    }
  }
}

console.log(`\nEnv: ${ok} ok, ${fail} fail`)
if (fail) process.exitCode = 1

if (!process.argv.includes('--no-deploy')) {
  try {
    run('npx -y vercel --prod --yes')
    console.log('✓ Deploy producción disparado')
  } catch (err) {
    console.error('✗ Deploy:', String(err.stderr || err.message || err).slice(0, 300))
    process.exitCode = 1
  }
}
