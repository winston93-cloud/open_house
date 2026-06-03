import { getOpenHouseEventConfig } from './open-house-event';
import { getSesionesInformativasEventConfig } from './sesiones-informativas-event';

export interface ProximoEnvioProgramado {
  fecha: string;
  hora: string;
  tipo: 'Open House' | 'Sesión Informativa';
  niveles: string[];
  institucion: string;
  recordatorio: string;
  reminderDateStr: string;
}

const SESIONES_SLOTS: { nivel: string; niveles: string[] }[] = [
  { nivel: 'secundaria', niveles: ['Secundaria'] },
  { nivel: 'primaria', niveles: ['Primaria'] },
  { nivel: 'maternal', niveles: ['Maternal', 'Kinder'] },
];

const OPEN_HOUSE_SLOTS: { nivel: string; niveles: string[] }[] = [
  { nivel: 'primaria', niveles: ['Primaria'] },
  { nivel: 'secundaria', niveles: ['Secundaria'] },
  { nivel: 'maternal', niveles: ['Maternal', 'Kinder'] },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatReminderSendLabel(reminderDateStr: string): string {
  const [y, m, d] = reminderDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 9, 0, 0);
  const weekday = date.toLocaleDateString('es-MX', { weekday: 'long' });
  const rest = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap} ${rest}, 9:00 AM`;
}

function capitalizeEventDate(fecha: string): string {
  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

/** Solo envíos cuyo recordatorio (1 día antes) aún no ha pasado. */
export function getProximosEnviosProgramados(): ProximoEnvioProgramado[] {
  const today = todayIso();
  const items: ProximoEnvioProgramado[] = [];

  for (const slot of OPEN_HOUSE_SLOTS) {
    const c = getOpenHouseEventConfig(slot.nivel);
    if (!c || c.reminderDateStr < today) continue;
    items.push({
      tipo: 'Open House',
      niveles: slot.niveles,
      fecha: capitalizeEventDate(c.fechaEventoMail),
      hora: c.horaEventoMail.replace(/\s+a\s+/gi, ' - '),
      institucion: c.institucionNombre,
      recordatorio: formatReminderSendLabel(c.reminderDateStr),
      reminderDateStr: c.reminderDateStr,
    });
  }

  for (const slot of SESIONES_SLOTS) {
    const c = getSesionesInformativasEventConfig(slot.nivel);
    if (!c || c.reminderDateStr < today) continue;
    items.push({
      tipo: 'Sesión Informativa',
      niveles: slot.niveles,
      fecha: capitalizeEventDate(c.fechaEventoMail),
      hora: c.horaEventoMail,
      institucion: c.institucionNombre,
      recordatorio: formatReminderSendLabel(c.reminderDateStr),
      reminderDateStr: c.reminderDateStr,
    });
  }

  return items.sort((a, b) => a.reminderDateStr.localeCompare(b.reminderDateStr));
}

export function getReminderCalendarSummary(): {
  openHouseEventos: number;
  openHouseEnviosLabel: string;
  sesionesEventos: number;
  sesionesEnviosLabel: string;
  primerRecordatorioLabel: string;
  primerRecordatorioSub: string;
} {
  const proximos = getProximosEnviosProgramados();
  const oh = proximos.filter((p) => p.tipo === 'Open House');
  const ses = proximos.filter((p) => p.tipo === 'Sesión Informativa');

  const ohReminderDays = Array.from(new Set(oh.map((p) => p.reminderDateStr))).sort();
  const sesReminderDays = Array.from(new Set(ses.map((p) => p.reminderDateStr))).sort();

  const formatDayShort = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDate();
    const month = date.toLocaleDateString('es-MX', { month: 'short' });
    return `${day} ${month}`;
  };

  const formatDayLong = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = date.toLocaleDateString('es-MX', { weekday: 'long' });
    const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${cap} 9:00 AM`;
  };

  const primer = proximos[0]?.reminderDateStr;

  return {
    openHouseEventos: oh.length,
    openHouseEnviosLabel:
      ohReminderDays.length > 0
        ? ohReminderDays.map(formatDayShort).join(' y ') + ', 9:00 AM'
        : 'Sin envíos programados',
    sesionesEventos: ses.length,
    sesionesEnviosLabel:
      sesReminderDays.length > 0
        ? sesReminderDays.map(formatDayShort).join(', ')
        : 'Sin envíos programados',
    primerRecordatorioLabel: primer ? formatDayShort(primer) : '—',
    primerRecordatorioSub: primer ? formatDayLong(primer) : 'Sin recordatorios próximos',
  };
}
