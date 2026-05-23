import type { PlanCampamentoId } from './campamento-verano';

export interface SemanaCampamento {
  id: string;
  numero: number;
  inicio: string;
  fin: string;
  label: string;
  labelCorto: string;
  emoji: string;
}

/** Del 13 de julio al 7 de agosto (Verano 2026). */
export const SEMANAS_CAMPAMENTO: SemanaCampamento[] = [
  {
    id: '2026-s1',
    numero: 1,
    inicio: '2026-07-13',
    fin: '2026-07-19',
    label: '13 al 19 de julio',
    labelCorto: '13–19 jul',
    emoji: '☀️',
  },
  {
    id: '2026-s2',
    numero: 2,
    inicio: '2026-07-20',
    fin: '2026-07-26',
    label: '20 al 26 de julio',
    labelCorto: '20–26 jul',
    emoji: '🌊',
  },
  {
    id: '2026-s3',
    numero: 3,
    inicio: '2026-07-27',
    fin: '2026-08-02',
    label: '27 de julio al 2 de agosto',
    labelCorto: '27 jul – 2 ago',
    emoji: '🚀',
  },
  {
    id: '2026-s4',
    numero: 4,
    inicio: '2026-08-03',
    fin: '2026-08-07',
    label: '3 al 7 de agosto',
    labelCorto: '3–7 ago',
    emoji: '🎉',
  },
];

export const CAMPAMENTO_RANGO_LABEL = '13 de julio al 7 de agosto';

export function getSemanasRequeridas(planId: PlanCampamentoId | string): number {
  if (planId === 'semanal') return 1;
  if (planId === '3_semanas') return 3;
  if (planId === '4_semanas') return 4;
  return 0;
}

export function getSemanaCampamento(id: string): SemanaCampamento | undefined {
  return SEMANAS_CAMPAMENTO.find((s) => s.id === id);
}

export function getSemanasCampamentoLabels(ids: string[]): string[] {
  return ids
    .map((id) => getSemanaCampamento(id))
    .filter(Boolean)
    .sort((a, b) => a!.numero - b!.numero)
    .map((s) => `Semana ${s!.numero}: ${s!.label}`);
}

export function validarSemanasSeleccionadas(
  planId: string,
  semanasIds: string[]
): string | null {
  const requeridas = getSemanasRequeridas(planId);
  if (!requeridas) return 'Plan de campamento no válido.';
  if (semanasIds.length !== requeridas) {
    return requeridas === 1
      ? 'Selecciona la semana en la que participará.'
      : `Selecciona exactamente ${requeridas} semanas según tu plan.`;
  }
  const validas = semanasIds.every((id) => SEMANAS_CAMPAMENTO.some((s) => s.id === id));
  if (!validas) return 'Una o más semanas seleccionadas no son válidas.';
  const unicas = new Set(semanasIds);
  if (unicas.size !== semanasIds.length) return 'No repitas la misma semana.';
  return null;
}

export function getTodasSemanasIds(): string[] {
  return SEMANAS_CAMPAMENTO.map((s) => s.id);
}
