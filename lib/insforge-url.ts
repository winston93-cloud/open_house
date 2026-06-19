/** Elimina slash final para evitar URLs dobles (//api/...). */
export function normalizeInsforgeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
