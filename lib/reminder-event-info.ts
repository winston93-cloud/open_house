import { getOpenHouseEventConfig } from './open-house-event';

export interface ReminderEventInfo {
  fechaEvento: string;
  horaEvento: string;
  institucionNombre: string;
}

/** Datos del evento para plantillas de recordatorio (email/SMS). */
export function getReminderEventInfo(
  nivelAcademico: string,
  isOpenHouse: boolean = true
): ReminderEventInfo {
  if (isOpenHouse) {
    const c = getOpenHouseEventConfig(nivelAcademico);
    if (c) {
      return {
        fechaEvento: c.fechaEventoMail,
        horaEvento: c.horaEventoMail,
        institucionNombre: c.institucionNombre,
      };
    }
  } else if (nivelAcademico === 'maternal' || nivelAcademico === 'kinder') {
    return {
      fechaEvento: 'Lunes 26 de enero de 2026',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Educativo Winston',
    };
  } else if (nivelAcademico === 'primaria') {
    return {
      fechaEvento: 'Lunes 19 de enero de 2026',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Winston Churchill',
    };
  } else if (nivelAcademico === 'secundaria') {
    return {
      fechaEvento: 'Martes 20 de enero de 2026',
      horaEvento: '6:00 PM',
      institucionNombre: 'Instituto Winston Churchill',
    };
  }

  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill',
  };
}
