/**
 * Fechas y horarios del Open House (junio 2026).
 * Fuente única para formulario, correo de confirmación, SMS, CRM (nota) y recordatorios.
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
      fechaEventoMail: 'Sábado 13 de junio de 2026',
      horaEventoMail: '9:00 AM a 11:30 AM',
      institucionNombre: EDU,
      notaKommoBase:
        '🏠 Open House (Maternal/Kinder)\nSábado 13 de junio de 2026, 9:00 AM a 11:30 AM\nInstituto Educativo Winston',
      smsEventoCorto: '13 jun 9:00-11:30',
      reminderDateStr: '2026-06-12',
      fechaRecordatorio: '13 de Junio',
      horaRecordatorio: '9:00 AM - 11:30 AM',
      formTitle: 'Open House Maternal y Kinder',
      formSubtitle: 'Sábado 13 de junio · 9:00 a 11:30 a.m.',
    };
  }
  if (nivelAcademico === 'primaria') {
    return {
      fechaEventoMail: 'Sábado 6 de junio de 2026',
      horaEventoMail: '9:00 AM a 11:30 AM',
      institucionNombre: CHU,
      notaKommoBase:
        '🏠 Open House Primaria\nSábado 6 de junio de 2026, 9:00 AM a 11:30 AM\nInstituto Winston Churchill',
      smsEventoCorto: '6 jun prim 9:00-11:30',
      reminderDateStr: '2026-06-05',
      fechaRecordatorio: '6 de Junio',
      horaRecordatorio: '9:00 AM - 11:30 AM',
      formTitle: 'Open House Primaria',
      formSubtitle: 'Sábado 6 de junio · 9:00 a 11:30 a.m.',
    };
  }
  if (nivelAcademico === 'secundaria') {
    return {
      fechaEventoMail: 'Sábado 6 de junio de 2026',
      horaEventoMail: '12:00 PM a 1:30 PM',
      institucionNombre: CHU,
      notaKommoBase:
        '🏠 Open House Secundaria\nSábado 6 de junio de 2026, 12:00 PM a 1:30 PM\nInstituto Winston Churchill',
      smsEventoCorto: '6 jun sec 12:00-13:30',
      reminderDateStr: '2026-06-05',
      fechaRecordatorio: '6 de Junio',
      horaRecordatorio: '12:00 PM - 1:30 PM',
      formTitle: 'Open House Secundaria',
      formSubtitle: 'Sábado 6 de junio · 12:00 a 1:30 p.m.',
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
export const OPEN_HOUSE_EDICION_ACTUAL = '2026-junio';

/** Metadatos por edición: primera fecha del evento (para orden “próximo”). */
export const OPEN_HOUSE_EDICIONES_META: { id: string; label: string; primeraFechaEvento: string }[] = [
  { id: '2025-dic', label: 'Diciembre 2025', primeraFechaEvento: '2025-12-06' },
  { id: '2026-enero', label: 'Enero 2026', primeraFechaEvento: '2026-01-17' },
  { id: '2026-junio', label: 'Junio 2026', primeraFechaEvento: '2026-06-06' },
];

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
