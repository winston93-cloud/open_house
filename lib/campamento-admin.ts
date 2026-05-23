import type { PlanCampamentoId } from './campamento-verano';
import { getPlanCampamento } from './campamento-verano';
import { validarSemanasSeleccionadas } from './campamento-semanas';

export interface CampamentoRegistro {
  id: string;
  nombre_participante: string;
  fecha_nacimiento: string;
  edad: number;
  grado_escolar: string;
  nombre_tutor: string;
  telefono_principal: string;
  telefono_emergencia: string;
  email: string;
  tiene_alergias: boolean;
  alergias_detalle: string | null;
  autoriza_primeros_auxilios: boolean;
  autoriza_fotos: boolean;
  acepta_reglamento: boolean;
  fecha_firma: string;
  plan_campamento: PlanCampamentoId | string;
  plan_precio: number;
  semanas_seleccionadas: string[];
  edicion: string;
  fecha_inscripcion?: string;
  created_at: string;
  updated_at?: string;
}

export interface CampamentoPayload {
  nombreParticipante: string;
  fechaNacimiento: string;
  edad: number;
  gradoEscolar: string;
  nombreTutor: string;
  telefonoPrincipal: string;
  telefonoEmergencia: string;
  email: string;
  tieneAlergias: boolean;
  alergiasDetalle: string | null;
  autorizaPrimerosAuxilios: boolean;
  autorizaFotos: boolean;
  aceptaReglamento: boolean;
  fechaFirma: string;
  planCampamento: string;
  semanasSeleccionadas: string[];
  edicion?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function parseCampamentoPayload(body: Record<string, unknown>): CampamentoPayload {
  return {
    nombreParticipante: String(body.nombreParticipante ?? '').trim(),
    fechaNacimiento: String(body.fechaNacimiento ?? '').trim(),
    edad: Number(body.edad),
    gradoEscolar: String(body.gradoEscolar ?? '').trim(),
    nombreTutor: String(body.nombreTutor ?? '').trim(),
    telefonoPrincipal: String(body.telefonoPrincipal ?? '').trim(),
    telefonoEmergencia: String(body.telefonoEmergencia ?? '').trim(),
    email: String(body.email ?? '').trim().toLowerCase(),
    tieneAlergias: body.tieneAlergias === true || body.tieneAlergias === 'true',
    alergiasDetalle: body.alergiasDetalle ? String(body.alergiasDetalle).trim() : null,
    autorizaPrimerosAuxilios:
      body.autorizaPrimerosAuxilios === true || body.autorizaPrimerosAuxilios === 'true',
    autorizaFotos: body.autorizaFotos === true || body.autorizaFotos === 'true',
    aceptaReglamento: body.aceptaReglamento === true || body.aceptaReglamento === 'true',
    fechaFirma: String(body.fechaFirma ?? '').trim(),
    planCampamento: String(body.planCampamento ?? '').trim(),
    semanasSeleccionadas: Array.isArray(body.semanasSeleccionadas)
      ? (body.semanasSeleccionadas as unknown[]).map(String)
      : [],
    edicion: body.edicion ? String(body.edicion).trim() : '2025',
  };
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function validateCampamentoPayload(data: CampamentoPayload): string | null {
  if (!data.nombreParticipante || data.nombreParticipante.length < 3) {
    return 'Nombre del participante inválido.';
  }
  if (!data.fechaNacimiento) return 'Fecha de nacimiento requerida.';
  if (!data.gradoEscolar) return 'Grado escolar requerido.';
  if (!data.nombreTutor || data.nombreTutor.length < 3) return 'Nombre del tutor requerido.';
  if (normalizePhone(data.telefonoPrincipal).length < 10) return 'Teléfono principal inválido.';
  if (normalizePhone(data.telefonoEmergencia).length < 10) return 'Teléfono de emergencia inválido.';
  if (!data.email || !EMAIL_REGEX.test(data.email)) return 'Correo inválido.';
  if (data.tieneAlergias && !data.alergiasDetalle) return 'Detalle de alergias requerido.';
  if (!data.autorizaPrimerosAuxilios || !data.autorizaFotos || !data.aceptaReglamento) {
    return 'Todas las autorizaciones deben estar activas.';
  }
  if (!data.fechaFirma) return 'Fecha de firma requerida.';
  const plan = getPlanCampamento(data.planCampamento);
  if (!plan) return 'Plan de campamento inválido.';
  return validarSemanasSeleccionadas(data.planCampamento, data.semanasSeleccionadas);
}

export function payloadToDbRow(data: CampamentoPayload) {
  const plan = getPlanCampamento(data.planCampamento)!;
  return {
    nombre_participante: data.nombreParticipante,
    fecha_nacimiento: data.fechaNacimiento,
    edad: data.edad,
    grado_escolar: data.gradoEscolar,
    nombre_tutor: data.nombreTutor,
    telefono_principal: normalizePhone(data.telefonoPrincipal),
    telefono_emergencia: normalizePhone(data.telefonoEmergencia),
    email: data.email,
    tiene_alergias: data.tieneAlergias,
    alergias_detalle: data.tieneAlergias ? data.alergiasDetalle : null,
    autoriza_primeros_auxilios: data.autorizaPrimerosAuxilios,
    autoriza_fotos: data.autorizaFotos,
    acepta_reglamento: data.aceptaReglamento,
    fecha_firma: data.fechaFirma,
    plan_campamento: plan.id,
    plan_precio: plan.precio,
    semanas_seleccionadas: data.semanasSeleccionadas,
    edicion: data.edicion || '2025',
  };
}

export function registroToPayload(r: CampamentoRegistro): CampamentoPayload {
  return {
    nombreParticipante: r.nombre_participante,
    fechaNacimiento: r.fecha_nacimiento,
    edad: r.edad,
    gradoEscolar: r.grado_escolar,
    nombreTutor: r.nombre_tutor,
    telefonoPrincipal: r.telefono_principal,
    telefonoEmergencia: r.telefono_emergencia,
    email: r.email,
    tieneAlergias: r.tiene_alergias,
    alergiasDetalle: r.alergias_detalle,
    autorizaPrimerosAuxilios: r.autoriza_primeros_auxilios,
    autorizaFotos: r.autoriza_fotos,
    aceptaReglamento: r.acepta_reglamento,
    fechaFirma: r.fecha_firma,
    planCampamento: r.plan_campamento,
    semanasSeleccionadas: Array.isArray(r.semanas_seleccionadas) ? r.semanas_seleccionadas : [],
    edicion: r.edicion,
  };
}

export function normalizeCampamentoRow(row: Record<string, unknown>): CampamentoRegistro {
  const semanas = row.semanas_seleccionadas;
  return {
    ...(row as unknown as CampamentoRegistro),
    semanas_seleccionadas: Array.isArray(semanas) ? (semanas as string[]) : [],
  };
}
