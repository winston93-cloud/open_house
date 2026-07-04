export const CAMPAMENTO_EDICION = '2026';
export const CAMPAMENTO_INSTITUCION = 'Instituto Winston Churchill';
export const CAMPAMENTO_TITULO = 'Startup Kids Camp';
export const CAMPAMENTO_SUBTITULO = 'Verano 2026';

/** Grados: Educativo Winston (Maternal/Kinder) + Primaria y Secundaria IWC. */
export const GRADOS_CAMPAMENTO = [
  'Maternal A',
  'Maternal B',
  'Kinder-1',
  'Kinder-2',
  'Kinder-3',
  '1° Primaria',
  '2° Primaria',
  '3° Primaria',
  '4° Primaria',
  '5° Primaria',
  '6° Primaria',
  '7mo de Secundaria',
  '8vo de Secundaria',
  '9no de Secundaria',
  'Otro',
] as const;

export type PlanCampamentoId = '4_semanas' | '3_semanas' | 'semanal';

export interface PlanCampamento {
  id: PlanCampamentoId;
  label: string;
  semanas: string;
  precio: number;
  precioFormateado: string;
}

export const PLANES_CAMPAMENTO: PlanCampamento[] = [
  {
    id: '4_semanas',
    label: '4 semanas',
    semanas: '4 semanas',
    precio: 2500,
    precioFormateado: '$2,500',
  },
  {
    id: '3_semanas',
    label: '3 semanas',
    semanas: '3 semanas',
    precio: 1900,
    precioFormateado: '$1,900',
  },
  {
    id: 'semanal',
    label: 'Semanal',
    semanas: 'Por semana',
    precio: 700,
    precioFormateado: '$700',
  },
];

export const CAMPAMENTO_CONTACTO = {
  telefono: '833 437 8743',
  email: 'vinculacionw@winston93.edu.mx',
  web: 'www.winston93.edu.mx',
};

/** Kit de bienvenida — solo disponible en plan de 1 semana. */
export const KIT_BIENVENIDA_NOMBRE = 'Kit de bienvenida';
export const KIT_BIENVENIDA_PRECIO = 280;
export const KIT_BIENVENIDA_PRECIO_FORMATEADO = '$280';

/** El kit solo aplica al plan semanal con exactamente 1 semana elegida. */
export function puedeElegirKitBienvenida(
  planId: string,
  semanasSeleccionadas: number
): boolean {
  return planId === 'semanal' && semanasSeleccionadas === 1;
}

export function calcularTotalCampamento(
  planId: string,
  kitBienvenida: boolean
): { planPrecio: number; kitPrecio: number; total: number } {
  const plan = getPlanCampamento(planId);
  const planPrecio = plan?.precio ?? 0;
  const kitPrecio =
    kitBienvenida && planId === 'semanal' ? KIT_BIENVENIDA_PRECIO : 0;
  return { planPrecio, kitPrecio, total: planPrecio + kitPrecio };
}

export function getPlanCampamento(id: string): PlanCampamento | undefined {
  return PLANES_CAMPAMENTO.find((p) => p.id === id);
}

export function calcularEdad(fechaNacimiento: string): number | null {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento + 'T12:00:00');
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return 'https://open-house-chi.vercel.app';
}

export function getBannerCampamentoUrl(): string {
  return `${getSiteUrl()}/banner-campamento-verano.png`;
}
