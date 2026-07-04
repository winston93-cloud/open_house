import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../lib/insforge-admin';
import {
  CAMPAMENTO_EDICION,
  calcularEdad,
  getPlanCampamento,
} from '../../../lib/campamento-verano';
import { validarSemanasSeleccionadas } from '../../../lib/campamento-semanas';
import { ensureCampamentoFolio } from '../../../lib/campamento-folio';
import {
  registroToCampamentoEmailData,
  sendCampamentoConfirmacionEmail,
} from '../../../lib/campamento-mail';
import { normalizeCampamentoRow, resolveKitBienvenida } from '../../../lib/campamento-admin';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\d\s\-+()]{10,20}$/;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

function parseBody(body: Record<string, unknown>) {
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
    alergiasDetalle: String(body.alergiasDetalle ?? '').trim(),
    autorizaPrimerosAuxilios:
      body.autorizaPrimerosAuxilios === true || body.autorizaPrimerosAuxilios === 'true',
    autorizaFotos: body.autorizaFotos === true || body.autorizaFotos === 'true',
    aceptaReglamento: body.aceptaReglamento === true || body.aceptaReglamento === 'true',
    fechaFirma: String(body.fechaFirma ?? '').trim(),
    planCampamento: String(body.planCampamento ?? '').trim(),
    semanasSeleccionadas: Array.isArray(body.semanasSeleccionadas)
      ? (body.semanasSeleccionadas as unknown[]).map(String)
      : [],
    kitBienvenida: body.kitBienvenida === true || body.kitBienvenida === 'true',
  };
}

function validate(data: ReturnType<typeof parseBody>): string | null {
  if (!data.nombreParticipante || data.nombreParticipante.length < 3) {
    return 'El nombre del participante es obligatorio (mínimo 3 caracteres).';
  }
  if (!data.fechaNacimiento) return 'La fecha de nacimiento es obligatoria.';
  const nac = new Date(data.fechaNacimiento + 'T12:00:00');
  if (Number.isNaN(nac.getTime()) || nac > new Date()) {
    return 'Ingresa una fecha de nacimiento válida.';
  }
  const edadCalculada = calcularEdad(data.fechaNacimiento);
  if (edadCalculada === null || edadCalculada < 0) {
    return 'Ingresa una fecha de nacimiento válida.';
  }
  if (!Number.isInteger(data.edad) || data.edad !== edadCalculada) {
    return 'La edad no coincide con la fecha de nacimiento.';
  }
  if (!data.gradoEscolar) return 'El grado escolar es obligatorio.';
  if (!data.nombreTutor || data.nombreTutor.length < 3) {
    return 'El nombre del padre o tutor es obligatorio.';
  }
  if (!PHONE_REGEX.test(data.telefonoPrincipal) || normalizePhone(data.telefonoPrincipal).length < 10) {
    return 'Ingresa un teléfono principal válido (mínimo 10 dígitos).';
  }
  if (!PHONE_REGEX.test(data.telefonoEmergencia) || normalizePhone(data.telefonoEmergencia).length < 10) {
    return 'Ingresa un teléfono de emergencia válido (mínimo 10 dígitos).';
  }
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    return 'Ingresa un correo electrónico válido.';
  }
  if (data.tieneAlergias && !data.alergiasDetalle) {
    return 'Especifica las alergias del participante.';
  }
  if (!data.autorizaPrimerosAuxilios || !data.autorizaFotos || !data.aceptaReglamento) {
    return 'Debes aceptar todas las autorizaciones para continuar.';
  }
  if (!data.fechaFirma) return 'La fecha de firma es obligatoria.';
  const plan = getPlanCampamento(data.planCampamento);
  if (!plan) return 'Selecciona un plan de campamento válido.';
  const errSem = validarSemanasSeleccionadas(data.planCampamento, data.semanasSeleccionadas);
  if (errSem) return errSem;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const data = parseBody(raw);
    const validationError = validate(data);
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 });
    }

    const plan = getPlanCampamento(data.planCampamento)!;
    const kitBienvenida = resolveKitBienvenida(
      data.planCampamento,
      data.semanasSeleccionadas,
      data.kitBienvenida
    );
    const client = getInsforgeAdmin();
    const db = client.database;

    const folio = await ensureCampamentoFolio(client, {
      nombreParticipante: data.nombreParticipante,
      fechaNacimiento: data.fechaNacimiento,
    });

    const { data: registro, error: dbError } = await db
      .from('campamento_verano')
      .insert([
        {
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
          kit_bienvenida: kitBienvenida,
          edicion: CAMPAMENTO_EDICION,
          folio,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error al guardar campamento:', dbError);
      return NextResponse.json(
        { success: false, message: 'No se pudo guardar la inscripción. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    const normalized = normalizeCampamentoRow(registro);

    try {
      await sendCampamentoConfirmacionEmail(registroToCampamentoEmailData(normalized));
    } catch (mailError) {
      console.error('Inscripción guardada pero falló el correo:', mailError);
      return NextResponse.json({
        success: true,
        warning: 'Inscripción registrada, pero no se pudo enviar el correo de confirmación.',
        folio,
        id: registro?.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscripción registrada correctamente. Revisa tu correo de confirmación.',
      folio,
      id: registro?.id,
    });
  } catch (error) {
    console.error('Error campamento-verano:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
