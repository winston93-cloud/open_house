/**
 * Fechas y horarios de Sesiones Informativas (junio 2026).
 * Fuente única para formulario, correo de confirmación, SMS, CRM (nota) y recordatorios.
 */

export interface SesionesInformativasEventConfig {
  fechaEventoMail: string;
  horaEventoMail: string;
  institucionNombre: string;
  notaKommoBase: string;
  smsEventoCorto: string;
  reminderDateStr: string;
  fechaRecordatorio: string;
  horaRecordatorio: string;
  formTitle: string;
  formSubtitle: string;
}

const EDU = 'Instituto Educativo Winston';
const CHU = 'Instituto Winston Churchill';

export function getSesionesInformativasEventConfig(
  nivelAcademico: string
): SesionesInformativasEventConfig | null {
  if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEventoMail: 'Lunes 15 de junio de 2026',
      horaEventoMail: '6:00 PM',
      institucionNombre: EDU,
      notaKommoBase:
        '📚 Sesión Informativa (Maternal/Kinder)\nLunes 15 de junio de 2026, 6:00 PM\nInstituto Educativo Winston',
      smsEventoCorto: '15 jun 18:00',
      reminderDateStr: '2026-06-14',
      fechaRecordatorio: '15 de Junio',
      horaRecordatorio: '6:00 PM',
      formTitle: 'Sesión Informativa Maternal y Kinder',
      formSubtitle: 'Lunes 15 de junio · 6:00 p.m.',
    };
  }
  if (nivelAcademico === 'primaria') {
    return {
      fechaEventoMail: 'Martes 9 de junio de 2026',
      horaEventoMail: '6:00 PM',
      institucionNombre: CHU,
      notaKommoBase:
        '📚 Sesión Informativa Primaria\nMartes 9 de junio de 2026, 6:00 PM\nInstituto Winston Churchill',
      smsEventoCorto: '9 jun prim 18:00',
      reminderDateStr: '2026-06-08',
      fechaRecordatorio: '9 de Junio',
      horaRecordatorio: '6:00 PM',
      formTitle: 'Sesión Informativa Primaria',
      formSubtitle: 'Martes 9 de junio · 6:00 p.m.',
    };
  }
  if (nivelAcademico === 'secundaria') {
    return {
      fechaEventoMail: 'Lunes 8 de junio de 2026',
      horaEventoMail: '6:00 PM',
      institucionNombre: CHU,
      notaKommoBase:
        '📚 Sesión Informativa Secundaria\nLunes 8 de junio de 2026, 6:00 PM\nInstituto Winston Churchill',
      smsEventoCorto: '8 jun sec 18:00',
      reminderDateStr: '2026-06-07',
      fechaRecordatorio: '8 de Junio',
      horaRecordatorio: '6:00 PM',
      formTitle: 'Sesión Informativa Secundaria',
      formSubtitle: 'Lunes 8 de junio · 6:00 p.m.',
    };
  }
  return null;
}

export function getSesionesFormInfo(nivel: string): { title: string; subtitle: string } | null {
  const c = getSesionesInformativasEventConfig(nivel);
  if (!c) return null;
  return { title: c.formTitle, subtitle: c.formSubtitle };
}

/** Convocatoria que guardan las nuevas inscripciones (formulario público). */
export const SESIONES_EDICION_ACTUAL = '2026-junio';

export const SESIONES_EDICIONES_META: { id: string; label: string; primeraFechaEvento: string }[] = [
  { id: '2026-enero', label: 'Enero 2026', primeraFechaEvento: '2026-01-19' },
  { id: '2026-junio', label: 'Junio 2026', primeraFechaEvento: '2026-06-08' },
];

export function getDefaultSesionesEdicion(): string {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...SESIONES_EDICIONES_META]
    .filter((e) => e.primeraFechaEvento >= today)
    .sort((a, b) => a.primeraFechaEvento.localeCompare(b.primeraFechaEvento));
  if (upcoming.length) return upcoming[0].id;
  const past = [...SESIONES_EDICIONES_META].sort((a, b) =>
    b.primeraFechaEvento.localeCompare(a.primeraFechaEvento)
  );
  return past[0]?.id ?? SESIONES_EDICION_ACTUAL;
}

export function getSesionesEdicionLabel(id: string | null | undefined): string {
  if (!id) return 'Sin etiqueta';
  return SESIONES_EDICIONES_META.find((e) => e.id === id)?.label ?? id;
}
