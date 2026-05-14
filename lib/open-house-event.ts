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
