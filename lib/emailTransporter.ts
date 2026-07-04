import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Misma cuenta que correo masivo en servicios_admin. */
const DEFAULT_MAIL_USER = 'avisos_no-replay@winston93.edu.mx';

/** Copia interna / BCC hacia sistemas. */
export const COPIA_CORREO_SISTEMAS = 'sistemas.desarrollo@winston93.edu.mx';

export function remitenteCorreo(): string {
  return (
    process.env.MAIL_USER?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    DEFAULT_MAIL_USER
  );
}

function claveCorreo(): string {
  const pass = process.env.MAIL_PASS?.trim() || process.env.EMAIL_PASS?.trim();
  if (!pass) {
    throw new Error(
      'Falta MAIL_PASS en variables de entorno (misma clave que servicios_admin).'
    );
  }
  return pass;
}

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: remitenteCorreo(),
        pass: claveCorreo(),
      },
    });
  }
  return transporter;
}

export function remitenteFrom(nombre: string): { name: string; address: string } {
  return { name: nombre, address: remitenteCorreo() };
}

export function remitenteFromString(nombre: string): string {
  return `"${nombre}" <${remitenteCorreo()}>`;
}
