import type { Workbook, Worksheet, Cell, Borders, Fill } from 'exceljs';
import type { CampamentoRegistro } from './campamento-admin';

/** IDs de imágenes embebidas en el workbook. */
export interface ReportLogoIds {
  winston: number;
  educativo: number;
}

/** Paleta Winston / Totality adaptada a Excel (fondo claro, acentos marca). */
const C = {
  navy: 'FF1A1B21',
  surface: 'FF292A2F',
  gold: 'FFFFD700',
  cream: 'FFFFF6DF',
  cyan: 'FF00B8D4',
  white: 'FFFFFFFF',
  rowAlt: 'FFF4F6F9',
  border: 'FFD8DCE3',
  text: 'FF1F2937',
  muted: 'FF6B7280',
  greenBg: 'FFD1FAE5',
  greenText: 'FF065F46',
  redBg: 'FFFEE2E2',
  redText: 'FF991B1B',
  amberBg: 'FFFEF3C7',
  amberText: 'FF92400E',
  blueBg: 'FFDBEAFE',
  blueText: 'FF1E40AF',
} as const;

const FONT = 'Calibri';

const thinBorder: Partial<Borders> = {
  top: { style: 'thin', color: { argb: C.border } },
  left: { style: 'thin', color: { argb: C.border } },
  bottom: { style: 'thin', color: { argb: C.border } },
  right: { style: 'thin', color: { argb: C.border } },
};

function solidFill(argb: string): Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function styleCell(
  cell: Cell,
  opts: {
    bold?: boolean;
    size?: number;
    color?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    border?: boolean;
    numFmt?: string;
  } = {}
) {
  cell.font = {
    name: FONT,
    size: opts.size ?? 11,
    bold: opts.bold ?? false,
    color: opts.color ? { argb: opts.color } : { argb: C.text },
  };
  if (opts.fill) cell.fill = solidFill(opts.fill);
  cell.alignment = { vertical: 'middle', horizontal: opts.align ?? 'left', wrapText: true };
  if (opts.border) cell.border = thinBorder;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
}

function colLetter(colCount: number): string {
  return String.fromCharCode(64 + colCount);
}

async function loadReportLogos(wb: Workbook): Promise<ReportLogoIds> {
  const fetchAsBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo cargar logo: ${url}`);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
  };

  const [winstonB64, educativoB64] = await Promise.all([
    fetchAsBase64('/logos/logo_winston.png'),
    fetchAsBase64('/logos/educativo%20hd.png'),
  ]);

  return {
    winston: wb.addImage({ base64: winstonB64, extension: 'png' }),
    educativo: wb.addImage({ base64: educativoB64, extension: 'png' }),
  };
}

function paintRowBackground(sheet: Worksheet, rowNum: number, colCount: number, fill: string) {
  for (let c = 1; c <= colCount; c++) {
    styleCell(sheet.getCell(rowNum, c), { fill });
  }
}

/** Encabezado con logos embebidos + título institucional. Devuelve la fila donde empieza el contenido. */
function addBrandedBanner(
  sheet: Worksheet,
  logos: ReportLogoIds,
  title: string,
  subtitle: string,
  colCount: number
): number {
  const endCol = colLetter(colCount);

  paintRowBackground(sheet, 1, colCount, C.navy);
  paintRowBackground(sheet, 2, colCount, C.navy);
  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 30;

  sheet.addImage(logos.winston, {
    tl: { col: 0.2, row: 0.15 },
    ext: { width: 190, height: 46 },
  });

  sheet.addImage(logos.educativo, {
    tl: { col: colCount - 1.05, row: 0.08 },
    ext: { width: 42, height: 54 },
  });

  const titleStartCol = 2;
  const titleEndCol = Math.max(titleStartCol, colCount - 1);
  sheet.mergeCells(1, titleStartCol, 2, titleEndCol);
  const titleCell = sheet.getCell(1, titleStartCol);
  titleCell.value = title;
  styleCell(titleCell, {
    bold: true,
    size: 15,
    color: C.cream,
    fill: C.navy,
    align: 'center',
  });

  sheet.mergeCells(`A3:${endCol}3`);
  const subCell = sheet.getCell('A3');
  subCell.value = subtitle;
  styleCell(subCell, { size: 10, color: C.muted, fill: C.rowAlt, align: 'center' });
  sheet.getRow(3).height = 24;

  return 5;
}

function addSheetBanner(
  sheet: Worksheet,
  logos: ReportLogoIds,
  title: string,
  subtitle: string,
  colCount: number
): number {
  return addBrandedBanner(sheet, logos, title, subtitle, colCount);
}

function addMetaRows(
  sheet: Worksheet,
  rows: [string, string][],
  startRow: number,
  colCount: number
) {
  rows.forEach(([label, value], i) => {
    const r = sheet.getRow(startRow + i);
    r.height = 22;
    const labelCell = r.getCell(1);
    labelCell.value = label;
    styleCell(labelCell, { bold: true, color: C.muted, size: 10, border: true });
    sheet.mergeCells(startRow + i, 2, startRow + i, colCount);
    const valueCell = r.getCell(2);
    valueCell.value = value;
    styleCell(valueCell, { size: 10, border: true });
  });
}

function addSectionTitle(sheet: Worksheet, rowNum: number, text: string, colCount: number) {
  const endCol = colLetter(colCount);
  sheet.mergeCells(`A${rowNum}:${endCol}${rowNum}`);
  const cell = sheet.getCell(`A${rowNum}`);
  cell.value = text;
  styleCell(cell, { bold: true, size: 11, color: C.cream, fill: C.surface });
  sheet.getRow(rowNum).height = 26;
}

function addMetricRow(
  sheet: Worksheet,
  rowNum: number,
  label: string,
  value: number | string,
  colCount: number,
  highlight = false
) {
  const row = sheet.getRow(rowNum);
  row.height = 24;
  const labelCell = row.getCell(1);
  labelCell.value = label;
  styleCell(labelCell, {
    color: C.text,
    size: 10,
    border: true,
    bold: highlight,
  });
  sheet.mergeCells(rowNum, 2, rowNum, colCount);
  const valueCell = row.getCell(2);
  valueCell.value = value;
  styleCell(valueCell, {
    bold: true,
    size: highlight ? 14 : 12,
    color: highlight ? C.navy : C.text,
    fill: highlight ? C.gold : C.white,
    align: 'center',
    border: true,
    numFmt: typeof value === 'number' ? '#,##0' : undefined,
  });
}

function addTableHeader(sheet: Worksheet, rowNum: number, headers: string[]) {
  const row = sheet.getRow(rowNum);
  row.height = 28;
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1);
    cell.value = h;
    styleCell(cell, { bold: true, size: 10, color: C.cream, fill: C.navy, align: 'center', border: true });
  });
}

function addDataRow(
  sheet: Worksheet,
  rowNum: number,
  values: (string | number)[],
  stripe: boolean,
  statusCol?: { index: number; status: string }
) {
  const row = sheet.getRow(rowNum);
  row.height = 20;
  const baseFill = stripe ? C.rowAlt : C.white;

  values.forEach((v, i) => {
    const cell = row.getCell(i + 1);
    cell.value = v;
    let fill: string = baseFill;
    let color: string = C.text;

    if (statusCol && i === statusCol.index) {
      const s = statusCol.status.toLowerCase();
      if (s.includes('confirmado') && !s.includes('no')) {
        fill = C.greenBg;
        color = C.greenText;
      } else if (s.includes('no confirmado') || s.includes('cancelado') || s.includes('deneg')) {
        fill = C.redBg;
        color = C.redText;
      } else if (s.includes('pendiente') || s.includes('enviado')) {
        fill = C.amberBg;
        color = C.amberText;
      }
    }

    styleCell(cell, {
      size: 10,
      fill,
      color,
      border: true,
      align: i === 0 ? 'center' : 'left',
    });
  });
}

function applyAutoFilter(sheet: Worksheet, headerRow: number, colCount: number) {
  const endCol = colLetter(colCount);
  sheet.autoFilter = {
    from: `A${headerRow}`,
    to: `${endCol}${headerRow}`,
  };
  sheet.views = [{ state: 'frozen', ySplit: headerRow, activeCell: `A${headerRow + 1}` }];
}

function setColumnWidths(sheet: Worksheet, widths: number[]) {
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });
}

export interface AdminExcelInscripcion {
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  telefono: string;
  created_at: string;
  confirmacion_asistencia: string;
  ciclo_escolar: string;
  edicion_open_house?: string | null;
}

export interface AdminExcelSesion {
  nombre_aspirante: string;
  nivel_academico: string;
  grado_escolar: string;
  email: string;
  telefono: string;
  created_at: string;
  confirmacion_asistencia: string;
  ciclo_escolar: string;
  edicion_sesiones?: string | null;
  reminder_sent: boolean;
}

export interface AdminExcelStats {
  totalOpenHouse: number;
  totalSesiones: number;
  totalCampamento: number;
  maternal: number;
  kinder: number;
  primaria: number;
  secundaria: number;
  sesionesMaternal: number;
  sesionesKinder: number;
  sesionesPrimaria: number;
  sesionesSecundaria: number;
  campamento4Semanas: number;
  campamento3Semanas: number;
  campamentoSemanal: number;
  confirmados: number;
  no_confirmados: number;
  pendientes: number;
}

export interface AdminExcelReportInput {
  stats: AdminExcelStats;
  openHouse: AdminExcelInscripcion[];
  sesiones: AdminExcelSesion[];
  campamento: CampamentoRegistro[];
  filtroOpenHouse: string;
  filtroSesiones: string;
  formatNivel: (nivel: string) => string;
  labelOpenHouseEdicion: (id?: string | null) => string;
  labelSesionesEdicion: (id?: string | null) => string;
  formatPlan: (planId: string) => string;
  ordenarPorNivelYNombre: <T extends { nivel_academico: string; nombre_aspirante: string }>(
    items: T[]
  ) => T[];
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatGrado(grado: string): string {
  return grado
    .replace(/([a-zA-Z]+)(\d+)/, '$1-$2')
    .replace(/(\d+)([a-zA-Z]+)/, '$1-$2')
    .replace(/([a-zA-Z]+)([A-Z])$/, '$1-$2');
}

function labelConfirmacionOH(status: string): string {
  if (status === 'confirmado') return 'Confirmado';
  if (status === 'no_confirmado') return 'No confirmado';
  return 'Pendiente';
}

function labelConfirmacionSesion(item: AdminExcelSesion): string {
  if (item.confirmacion_asistencia === 'confirmado') return 'Confirmado';
  if (item.confirmacion_asistencia === 'cancelado') return 'Cancelado';
  if (item.reminder_sent) return 'Recordatorio enviado';
  return 'Pendiente';
}

function buildResumenSheet(wb: Workbook, input: AdminExcelReportInput, logos: ReportLogoIds) {
  const { stats } = input;
  const colCount = 6;
  const sheet = wb.addWorksheet('Resumen Ejecutivo', {
    properties: { defaultRowHeight: 20 },
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
  });

  // Col A ancha para etiquetas largas; B–F para valores y espacio visual
  setColumnWidths(sheet, [38, 14, 14, 14, 14, 14]);

  const fecha = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contentStart = addBrandedBanner(
    sheet,
    logos,
    'Instituto Winston Churchill',
    'Reporte integral — Open House · Sesiones Informativas · Campamento de Verano',
    colCount
  );

  addMetaRows(
    sheet,
    [
      ['Fecha de generación', fecha],
      ['Filtro Open House', input.filtroOpenHouse],
      ['Filtro Sesiones', input.filtroSesiones],
      ['Campamento de Verano', 'Todas las ediciones'],
    ],
    contentStart,
    colCount
  );

  let row = contentStart + 5;
  addSectionTitle(sheet, row++, 'RESUMEN EJECUTIVO', colCount);
  addMetricRow(sheet, row++, 'Total Open House', stats.totalOpenHouse, colCount);
  addMetricRow(sheet, row++, 'Total Sesiones Informativas', stats.totalSesiones, colCount);
  addMetricRow(sheet, row++, 'Total Campamento de Verano', stats.totalCampamento, colCount);
  addMetricRow(
    sheet,
    row++,
    'TOTAL GENERAL',
    stats.totalOpenHouse + stats.totalSesiones + stats.totalCampamento,
    colCount,
    true
  );

  row++;
  addSectionTitle(sheet, row++, 'OPEN HOUSE — POR NIVEL', colCount);
  addMetricRow(sheet, row++, 'Maternal', stats.maternal, colCount);
  addMetricRow(sheet, row++, 'Kinder', stats.kinder, colCount);
  addMetricRow(sheet, row++, 'Primaria', stats.primaria, colCount);
  addMetricRow(sheet, row++, 'Secundaria', stats.secundaria, colCount);

  row++;
  addSectionTitle(sheet, row++, 'OPEN HOUSE — CONFIRMACIONES', colCount);
  addMetricRow(sheet, row++, 'Confirmados', stats.confirmados, colCount);
  addMetricRow(sheet, row++, 'No confirmados', stats.no_confirmados, colCount);
  addMetricRow(sheet, row++, 'Pendientes', stats.pendientes, colCount);

  row++;
  addSectionTitle(sheet, row++, 'SESIONES — POR NIVEL', colCount);
  addMetricRow(sheet, row++, 'Maternal', stats.sesionesMaternal, colCount);
  addMetricRow(sheet, row++, 'Kinder', stats.sesionesKinder, colCount);
  addMetricRow(sheet, row++, 'Primaria', stats.sesionesPrimaria, colCount);
  addMetricRow(sheet, row++, 'Secundaria', stats.sesionesSecundaria, colCount);

  row++;
  addSectionTitle(sheet, row++, 'CAMPAMENTO — POR PLAN', colCount);
  addMetricRow(sheet, row++, 'Plan 4 semanas', stats.campamento4Semanas, colCount);
  addMetricRow(sheet, row++, 'Plan 3 semanas', stats.campamento3Semanas, colCount);
  addMetricRow(sheet, row++, 'Plan semanal', stats.campamentoSemanal, colCount);

  sheet.mergeCells(row + 1, 1, row + 1, colCount);
  const footer = sheet.getCell(row + 1, 1);
  footer.value = 'Generado desde el Dashboard de Gestión Winston · open-house-chi.vercel.app/admin';
  styleCell(footer, { size: 9, color: C.muted, align: 'center' });
}

function buildOpenHouseSheet(wb: Workbook, input: AdminExcelReportInput, logos: ReportLogoIds) {
  const sheet = wb.addWorksheet('Open House');
  const headers = [
    '#',
    'Nombre del aspirante',
    'Nivel',
    'Grado',
    'Email',
    'Teléfono',
    'Fecha inscripción',
    'Edición OH',
    'Confirmación',
    'Año',
  ];
  const colCount = headers.length;

  setColumnWidths(sheet, [5, 32, 14, 14, 34, 16, 20, 18, 16, 8]);
  const headerRow = addSheetBanner(
    sheet,
    logos,
    'Open House — Detalle de inscripciones',
    input.filtroOpenHouse,
    colCount
  ) + 1;

  addTableHeader(sheet, headerRow, headers);

  const items = input.ordenarPorNivelYNombre(input.openHouse);
  items.forEach((item, idx) => {
    const rowNum = headerRow + 1 + idx;
    addDataRow(
      sheet,
      rowNum,
      [
        idx + 1,
        item.nombre_aspirante,
        input.formatNivel(item.nivel_academico),
        formatGrado(item.grado_escolar),
        item.email,
        item.telefono || '—',
        formatFecha(item.created_at),
        input.labelOpenHouseEdicion(item.edicion_open_house),
        labelConfirmacionOH(item.confirmacion_asistencia),
        item.ciclo_escolar || '—',
      ],
      idx % 2 === 1,
      { index: 8, status: labelConfirmacionOH(item.confirmacion_asistencia) }
    );
  });

  applyAutoFilter(sheet, headerRow, colCount);
}

function buildSesionesSheet(wb: Workbook, input: AdminExcelReportInput, logos: ReportLogoIds) {
  const sheet = wb.addWorksheet('Sesiones Informativas');
  const headers = [
    '#',
    'Nombre del aspirante',
    'Nivel',
    'Grado',
    'Email',
    'Teléfono',
    'Fecha inscripción',
    'Convocatoria',
    'Estado',
    'Año',
  ];
  const colCount = headers.length;

  setColumnWidths(sheet, [5, 32, 14, 14, 34, 16, 20, 20, 18, 8]);
  const headerRow = addSheetBanner(
    sheet,
    logos,
    'Sesiones Informativas — Detalle',
    input.filtroSesiones,
    colCount
  ) + 1;

  addTableHeader(sheet, headerRow, headers);

  const items = input.ordenarPorNivelYNombre(input.sesiones);
  items.forEach((item, idx) => {
    const rowNum = headerRow + 1 + idx;
    const estado = labelConfirmacionSesion(item);
    addDataRow(
      sheet,
      rowNum,
      [
        idx + 1,
        item.nombre_aspirante,
        input.formatNivel(item.nivel_academico),
        formatGrado(item.grado_escolar),
        item.email,
        item.telefono || '—',
        formatFecha(item.created_at),
        input.labelSesionesEdicion(item.edicion_sesiones),
        estado,
        item.ciclo_escolar || '—',
      ],
      idx % 2 === 1,
      { index: 8, status: estado }
    );
  });

  applyAutoFilter(sheet, headerRow, colCount);
}

function buildCampamentoSheet(wb: Workbook, input: AdminExcelReportInput, logos: ReportLogoIds) {
  const sheet = wb.addWorksheet('Campamento de Verano');
  const headers = [
    '#',
    'Folio',
    'Participante',
    'Grado',
    'Plan',
    'Email',
    'Teléfono',
    'Tutor',
    'Fecha inscripción',
    'Edición',
    'Semanas',
  ];
  const colCount = headers.length;

  setColumnWidths(sheet, [5, 14, 30, 16, 14, 32, 16, 26, 20, 10, 28]);
  const headerRow = addSheetBanner(
    sheet,
    logos,
    'Campamento de Verano — Detalle',
    'Todas las ediciones',
    colCount
  ) + 1;

  addTableHeader(sheet, headerRow, headers);

  const items = [...input.campamento].sort((a, b) =>
    a.nombre_participante.localeCompare(b.nombre_participante, 'es', { sensitivity: 'base' })
  );

  items.forEach((item, idx) => {
    const rowNum = headerRow + 1 + idx;
    const row = sheet.getRow(rowNum);
    row.height = 20;
    const stripe = idx % 2 === 1;
    const baseFill = stripe ? C.rowAlt : C.white;

    const values: (string | number)[] = [
      idx + 1,
      item.folio || 'Sin folio',
      item.nombre_participante,
      item.grado_escolar,
      input.formatPlan(item.plan_campamento),
      item.email,
      item.telefono_principal || '—',
      item.nombre_tutor || '—',
      formatFecha(item.created_at),
      item.edicion || '—',
      item.semanas_seleccionadas?.length ? item.semanas_seleccionadas.join(', ') : '—',
    ];

    values.forEach((v, i) => {
      const cell = row.getCell(i + 1);
      cell.value = v;
      const isFolio = i === 1;
      styleCell(cell, {
        size: 10,
        fill: isFolio && item.folio ? C.blueBg : baseFill,
        color: isFolio && item.folio ? C.blueText : C.text,
        bold: isFolio && !!item.folio,
        border: true,
        align: i <= 1 ? 'center' : 'left',
      });
    });
  });

  applyAutoFilter(sheet, headerRow, colCount);
}

export async function generateAdminExcelReport(input: AdminExcelReportInput): Promise<void> {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Dashboard Winston';
  wb.created = new Date();
  wb.modified = new Date();

  const logos = await loadReportLogos(wb);

  buildResumenSheet(wb, input, logos);
  buildOpenHouseSheet(wb, input, logos);
  buildSesionesSheet(wb, input, logos);
  buildCampamentoSheet(wb, input, logos);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const fileName = `Reporte_Winston_${new Date().toISOString().split('T')[0]}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
