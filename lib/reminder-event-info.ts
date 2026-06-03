import { getOpenHouseEventConfig } from './open-house-event';
import { getSesionesInformativasEventConfig } from './sesiones-informativas-event';

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
  } else {
    const c = getSesionesInformativasEventConfig(nivelAcademico);
    if (c) {
      return {
        fechaEvento: c.fechaEventoMail,
        horaEvento: c.horaEventoMail,
        institucionNombre: c.institucionNombre,
      };
    }
  }

  return {
    fechaEvento: 'Fecha no especificada',
    horaEvento: 'Hora no especificada',
    institucionNombre: 'Instituto Winston Churchill',
  };
}
