import {
  CAMPAMENTO_CONTACTO,
  CAMPAMENTO_INSTITUCION,
  CAMPAMENTO_SUBTITULO,
  CAMPAMENTO_TITULO,
  getBannerCampamentoUrl,
  getPlanCampamento,
  calcularTotalCampamento,
  KIT_BIENVENIDA_NOMBRE,
  KIT_BIENVENIDA_PRECIO_FORMATEADO,
  type PlanCampamento,
} from './campamento-verano';
import { getSemanasCampamentoLabels } from './campamento-semanas';

export interface CampamentoEmailData {
  folio: string;
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
  planId: string;
  semanasSeleccionadas: string[];
  fechaFirma: string;
  kitBienvenida: boolean;
}

function formatFecha(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function createCampamentoConfirmacionEmail(
  data: CampamentoEmailData
): { subject: string; html: string } {
  const plan = getPlanCampamento(data.planId) as PlanCampamento;
  const totales = calcularTotalCampamento(data.planId, data.kitBienvenida);
  const bannerUrl = getBannerCampamentoUrl();
  const semanasLabels = getSemanasCampamentoLabels(data.semanasSeleccionadas);
  const semanasHtml = semanasLabels
    .map((s) => `<li style="margin:6px 0;">${s}</li>`)
    .join('');
  const alergiasTexto = data.tieneAlergias
    ? data.alergiasDetalle || 'Sí (sin detalle)'
    : 'No';

  const subject = `✅ Inscripción confirmada — ${CAMPAMENTO_TITULO} ${CAMPAMENTO_SUBTITULO}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4ff;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(30,58,138,0.15);">
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${bannerUrl}" alt="${CAMPAMENTO_TITULO} — ${CAMPAMENTO_SUBTITULO}" width="620" style="width:100%;max-width:620px;height:auto;display:block;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 50%,#f59e0b 100%);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">¡Inscripción confirmada!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.95);font-size:16px;">${CAMPAMENTO_INSTITUCION}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;line-height:1.6;">
                Estimado(a) <strong style="color:#1e40af;">${data.nombreTutor}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
                Hemos recibido correctamente la inscripción de <strong>${data.nombreParticipante}</strong> al campamento <strong>${CAMPAMENTO_TITULO}</strong> (${CAMPAMENTO_SUBTITULO}). A continuación el resumen:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fffbeb" style="margin-bottom:28px;border:3px solid #1e40af;border-radius:16px;background-color:#fffbeb;">
                <tr>
                  <td bgcolor="#fffbeb" style="padding:28px 20px;text-align:center;background-color:#fffbeb;">
                    <p style="margin:0 0 12px;color:#1e40af;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.14em;">Folio de inscripción</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 16px;">
                      <tr>
                        <td bgcolor="#ffffff" style="padding:14px 22px;background-color:#ffffff;border:3px dashed #2563eb;border-radius:12px;">
                          <p style="margin:0;color:#0f172a;font-size:34px;font-weight:900;letter-spacing:0.22em;font-family:Consolas,'Courier New',monospace;line-height:1.2;">${data.folio}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;color:#334155;font-size:15px;line-height:1.55;font-weight:700;">
                      Presente este folio al momento de pagar la inscripción al campamento.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#fef3c7 0%,#fde68a 100%);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:22px;text-align:center;">
                    <p style="margin:0 0 6px;color:#92400e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Plan seleccionado</p>
                    <p style="margin:0;color:#1e3a8a;font-size:22px;font-weight:800;">${plan.label} — ${plan.precioFormateado}</p>
                    ${
                      data.kitBienvenida
                        ? `<p style="margin:12px 0 0;color:#0f172a;font-size:15px;font-weight:700;">+ ${KIT_BIENVENIDA_NOMBRE}: ${KIT_BIENVENIDA_PRECIO_FORMATEADO}.00 MXN</p>
                    <p style="margin:8px 0 0;color:#1e40af;font-size:18px;font-weight:800;">Total estimado: $${totales.total.toLocaleString('es-MX')} MXN</p>`
                        : ''
                    }
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 14px;color:#1e40af;font-size:18px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">📅 Semanas de participación</h2>
              <ul style="margin:0 0 22px;padding-left:20px;color:#0f172a;font-size:14px;line-height:1.65;font-weight:600;">
                ${semanasHtml}
              </ul>

              <h2 style="margin:0 0 14px;color:#1e40af;font-size:18px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">👤 Participante</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;font-size:14px;">
                ${row('Nombre', data.nombreParticipante)}
                ${row('Fecha de nacimiento', formatFecha(data.fechaNacimiento))}
                ${row('Edad', `${data.edad} años`)}
                ${row('Grado escolar', data.gradoEscolar)}
              </table>

              <h2 style="margin:0 0 14px;color:#1e40af;font-size:18px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">👨‍👩‍👧 Tutor de contacto</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;font-size:14px;">
                ${row('Nombre', data.nombreTutor)}
                ${row('Teléfono principal', data.telefonoPrincipal)}
                ${row('Teléfono emergencia', data.telefonoEmergencia)}
                ${row('Correo', data.email)}
              </table>

              <h2 style="margin:0 0 14px;color:#1e40af;font-size:18px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">🏥 Información médica</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:22px;font-size:14px;">
                ${row('Alergias', alergiasTexto)}
              </table>

              <p style="margin:0 0 8px;color:#64748b;font-size:13px;">Autorizaciones registradas el ${formatFecha(data.fechaFirma)}:</p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:14px;line-height:1.7;">
                <li>Primeros auxilios autorizados</li>
                <li>Uso de fotos y videos con fines educativos y promocionales</li>
                <li>Aceptación de normas y reglamento del campamento</li>
              </ul>

              <p style="margin:0;padding:16px;background:#eff6ff;border-radius:12px;color:#1e40af;font-size:14px;line-height:1.6;text-align:center;">
                📞 Para dudas: <strong>${CAMPAMENTO_CONTACTO.telefono}</strong><br/>
                📧 ${CAMPAMENTO_CONTACTO.email}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#1e293b;padding:20px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} ${CAMPAMENTO_INSTITUCION}</p>
              <p style="margin:6px 0 0;color:#64748b;font-size:11px;">${CAMPAMENTO_CONTACTO.web}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#64748b;width:42%;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:600;">${value}</td>
    </tr>`;
}
