import type { InsForgeClient } from '@insforge/sdk';
import { normalizeCampamentoRow, type CampamentoRegistro } from './campamento-admin';
import { ensureCampamentoFolio } from './campamento-folio';

export async function assignFolioToRegistro(
  client: InsForgeClient,
  registro: CampamentoRegistro
): Promise<CampamentoRegistro> {
  if (registro.folio) return registro;

  const folio = await ensureCampamentoFolio(client, {
    nombreParticipante: registro.nombre_participante,
    fechaNacimiento: registro.fecha_nacimiento,
    registroId: registro.id,
  });

  const { data, error } = await client.database
    .from('campamento_verano')
    .update({ folio })
    .eq('id', registro.id)
    .select()
    .single();

  if (error) throw error;
  return normalizeCampamentoRow(data);
}

export async function loadRegistroById(
  client: InsForgeClient,
  id: string
): Promise<CampamentoRegistro | null> {
  const { data, error } = await client.database
    .from('campamento_verano')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return normalizeCampamentoRow(data);
}
