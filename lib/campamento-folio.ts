import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Sin 0/O/1/I para lectura más clara al pagar. */
const FOLIO_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Genera 10 caracteres alfanuméricos a partir del nombre y la fecha de nacimiento. */
export function generateFolioFromSeed(
  nombreParticipante: string,
  fechaNacimiento: string,
  salt = ''
): string {
  const fecha = fechaNacimiento.slice(0, 10).replace(/-/g, '');
  const nombre = normalizeNombre(nombreParticipante);
  const seed = `${nombre}|${fecha}|${salt}`;
  const hash = createHash('sha256').update(seed, 'utf8').digest();
  let folio = '';
  for (let i = 0; i < 10; i++) {
    folio += FOLIO_CHARS[hash[i]! % FOLIO_CHARS.length];
  }
  return folio;
}

export async function folioExists(
  supabase: SupabaseClient,
  folio: string,
  excludeId?: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('campamento_verano')
    .select('id')
    .eq('folio', folio)
    .limit(1);

  if (error) throw error;
  if (!data?.length) return false;
  if (excludeId && data[0].id === excludeId) return false;
  return true;
}

/** Devuelve un folio único; reutiliza el existente si ya tiene. */
export async function ensureCampamentoFolio(
  supabase: SupabaseClient,
  params: {
    nombreParticipante: string;
    fechaNacimiento: string;
    existingFolio?: string | null;
    registroId?: string;
  }
): Promise<string> {
  if (params.existingFolio?.trim()) return params.existingFolio.trim().toUpperCase();

  const fecha = params.fechaNacimiento.slice(0, 10);
  for (let attempt = 0; attempt < 40; attempt++) {
    const salt = attempt === 0 ? '' : String(attempt);
    const folio = generateFolioFromSeed(params.nombreParticipante, fecha, salt);
    const exists = await folioExists(supabase, folio, params.registroId);
    if (!exists) return folio;
  }
  throw new Error('No se pudo generar un folio único');
}
