/**
 * Fechas y horarios del Open House (edición vigente: noviembre 2026).
 * Fuente única para formulario, correo de confirmación, SMS, CRM (nota/etiqueta) y recordatorios.
 * Nueva edición: actualizar los 3 bloques de nivel, OPEN_HOUSE_EDICION_ACTUAL,
 * OPEN_HOUSE_EDICIONES_META y OPEN_HOUSE_KOMMO_TAGS.
 */

export interface OpenHouseEventConfig {
  fechaEventoMail: string;
  horaEventoMail: string;
  institucionNombre: string;
  /** Texto para nota en Kommo (sin datos del aspirante; se concatena en la ruta). */
  notaKommoBase: string;
  /** Fragmento corto para SMS (sin nombre). */
  smsEventoCorto: string;
  /** Día en que debe enviarse el recordatorio (un día antes del evento). */
  reminderDateStr: string;
  fechaRecordatorio: string;
  horaRecordatorio: string;
  formTitle: string;
  formSubtitle: string;
}

const EDU = 'Instituto Educativo Winston';
const CHU = 'Instituto Winston Churchill';

export function getOpenHouseEventConfig(nivelAcademico: string): OpenHouseEventConfig | null {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEventoMail: 'Sábado 28 de noviembre de 2026',
      horaEventoMail: '9:00 AM a 11:00 AM',
      institucionNombre: EDU,
      notaKommoBase:
        '🏠 Open House (Maternal/Kinder)\nSábado 28 de noviembre de 2026, 9:00 AM a 11:00 AM\nInstituto Educativo Winston',
      smsEventoCorto: '28 nov 9:00-11:00',
      reminderDateStr: '2026-11-27',
      fechaRecordatorio: '28 de Noviembre',
      horaRecordatorio: '9:00 AM - 11:00 AM',
      formTitle: 'Open House Maternal y Kinder',
      formSubtitle: 'Sábado 28 de noviembre · 9:00 a 11:00 a.m.',
    };
  }
  if (nivelAcademico === 'primaria') {
    return {
      fechaEventoMail: 'Sábado 21 de noviembre de 2026',
      horaEventoMail: '9:00 AM',
      institucionNombre: CHU,
      notaKommoBase:
        '🏠 Open House Primaria\nSábado 21 de noviembre de 2026, 9:00 AM\nInstituto Winston Churchill',
      smsEventoCorto: '21 nov prim 9:00',
      reminderDateStr: '2026-11-20',
      fechaRecordatorio: '21 de Noviembre',
      horaRecordatorio: '9:00 AM',
      formTitle: 'Open House Primaria',
      formSubtitle: 'Sábado 21 de noviembre · 9:00 a.m.',
    };
  }
  if (nivelAcademico === 'secundaria') {
    return {
      fechaEventoMail: 'Sábado 21 de noviembre de 2026',
      horaEventoMail: '11:00 AM',
      institucionNombre: CHU,
      notaKommoBase:
        '🏠 Open House Secundaria\nSábado 21 de noviembre de 2026, 11:00 AM\nInstituto Winston Churchill',
      smsEventoCorto: '21 nov sec 11:00',
      reminderDateStr: '2026-11-20',
      fechaRecordatorio: '21 de Noviembre',
      horaRecordatorio: '11:00 AM',
      formTitle: 'Open House Secundaria',
      formSubtitle: 'Sábado 21 de noviembre · 11:00 a.m.',
    };
  }
  return null;
}

export function getOpenHouseFormInfo(nivel: string): { title: string; subtitle: string } | null {
  const c = getOpenHouseEventConfig(nivel);
  if (!c) return null;
  return { title: c.formTitle, subtitle: c.formSubtitle };
}

/** Convocatoria que guardan las nuevas inscripciones (formulario público). */
export const OPEN_HOUSE_EDICION_ACTUAL = '2026-noviembre';

/** Etiquetas Kommo de la edición vigente (distintas por edición y por plantel). */
export const OPEN_HOUSE_KOMMO_TAGS: Record<'winston' | 'educativo', string> = {
  winston: 'Open House Winston Noviembre 2026',
  educativo: 'Open House Educativo Noviembre 2026',
};

/** Metadatos por edición: primera fecha del evento (para orden “próximo”). */
export const OPEN_HOUSE_EDICIONES_META: { id: string; label: string; primeraFechaEvento: string }[] = [
  { id: '2025-diciembre', label: 'Diciembre 2025', primeraFechaEvento: '2025-12-06' },
  { id: '2026-enero', label: 'Enero 2026', primeraFechaEvento: '2026-01-17' },
  { id: '2026-junio', label: 'Junio 2026', primeraFechaEvento: '2026-06-06' },
  { id: '2026-noviembre', label: 'Noviembre 2026', primeraFechaEvento: '2026-11-21' },
];

/** Año (ciclo_escolar en BD) de una edición «AAAA-mes». */
export function cicloDeEdicion(id: string): string | null {
  const m = /^(\d{4})-/.exec(id);
  return m ? m[1] : null;
}

/** Edición Open House por defecto en admin: la convocatoria con evento más próximo hacia adelante. */
export function getDefaultOpenHouseEdicion(): string {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...OPEN_HOUSE_EDICIONES_META]
    .filter((e) => e.primeraFechaEvento >= today)
    .sort((a, b) => a.primeraFechaEvento.localeCompare(b.primeraFechaEvento));
  if (upcoming.length) return upcoming[0].id;
  const past = [...OPEN_HOUSE_EDICIONES_META].sort((a, b) =>
    b.primeraFechaEvento.localeCompare(a.primeraFechaEvento)
  );
  return past[0]?.id ?? OPEN_HOUSE_EDICION_ACTUAL;
}

export function getOpenHouseEdicionLabel(id: string | null | undefined): string {
  if (!id) return 'Sin etiqueta';
  return OPEN_HOUSE_EDICIONES_META.find((e) => e.id === id)?.label ?? id;
}
