import type { CampamentoRegistro } from './campamento-admin';
import { CAMPAMENTO_INSTITUCION } from './campamento-verano';
import {
  createCampamentoConfirmacionEmail,
  type CampamentoEmailData,
} from './campamento-verano-email';
import { getEmailTransporter, remitenteFrom } from './emailTransporter';

export function registroToCampamentoEmailData(registro: CampamentoRegistro): CampamentoEmailData {
  if (!registro.folio) {
    throw new Error('El registro no tiene folio asignado');
  }
  return {
    folio: registro.folio,
    nombreParticipante: registro.nombre_participante,
    fechaNacimiento: registro.fecha_nacimiento,
    edad: registro.edad,
    gradoEscolar: registro.grado_escolar,
    nombreTutor: registro.nombre_tutor,
    telefonoPrincipal: registro.telefono_principal,
    telefonoEmergencia: registro.telefono_emergencia,
    email: registro.email,
    tieneAlergias: registro.tiene_alergias,
    alergiasDetalle: registro.alergias_detalle,
    planId: registro.plan_campamento,
    semanasSeleccionadas: Array.isArray(registro.semanas_seleccionadas)
      ? registro.semanas_seleccionadas
      : [],
    fechaFirma: registro.fecha_firma,
    kitBienvenida: registro.kit_bienvenida === true,
  };
}

export async function sendCampamentoConfirmacionEmail(
  data: CampamentoEmailData
): Promise<void> {
  const { subject, html } = createCampamentoConfirmacionEmail(data);
  await getEmailTransporter().sendMail({
    from: remitenteFrom(CAMPAMENTO_INSTITUCION),
    to: data.email,
    subject,
    html,
  });
}
