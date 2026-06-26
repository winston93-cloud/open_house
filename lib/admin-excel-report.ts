import type { Workbook, Worksheet, Cell, Borders, Fill } from 'exceljs';
import type { CampamentoRegistro } from './campamento-admin';

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

function addSheetBanner(
  sheet: Worksheet,
  title: string,
  subtitle: string,
  colCount: number
) {
  const endCol = String.fromCharCode(64 + colCount);
  sheet.mergeCells(`A1:${endCol}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  styleCell(titleCell, { bold: true, size: 16, color: C.cream, fill: C.navy, align: 'center' });
  sheet.getRow(1).height = 36;

  sheet.mergeCells(`A2:${endCol}2`);
  const subCell = sheet.getCell('A2');
  subCell.value = subtitle;
  styleCell(subCell, { size: 10, color: C.muted, fill: C.rowAlt, align: 'center' });
  sheet.getRow(2).height = 22;
}

function addMetaRows(sheet: Worksheet, rows: [string, string][], startRow = 4) {
  rows.forEach(([label, value], i) => {
    const r = sheet.getRow(startRow + i);
    r.height = 20;
    const labelCell = r.getCell(1);
    labelCell.value = label;
    styleCell(labelCell, { bold: true, color: C.muted, size: 10 });
    sheet.mergeCells(startRow + i, 2, startRow + i, 4);
    const valueCell = r.getCell(2);
    valueCell.value = value;
    styleCell(valueCell, { size: 10 });
  });
}

function addSectionTitle(sheet: Worksheet, rowNum: number, text: string, colCount: number) {
  const endCol = String.fromCharCode(64 + colCount);
  sheet.mergeCells(`A${rowNum}:${endCol}${rowNum}`);
  const cell = sheet.getCell(`A${rowNum}`);
  cell.value = text;
  styleCell(cell, { bold: true, size: 11, color: C.cream, fill: C.surface });
  sheet.getRow(rowNum).height = 24;
}

function addMetricRow(
  sheet: Worksheet,
  rowNum: number,
  label: string,
  value: number | string,
  highlight = false
) {
  const row = sheet.getRow(rowNum);
  row.height = 22;
  const labelCell = row.getCell(1);
  labelCell.value = label;
  styleCell(labelCell, { color: C.muted, size: 10, border: true });
  sheet.mergeCells(rowNum, 2, rowNum, 3);
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
  const endCol = String.fromCharCode(64 + colCount);
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

function buildResumenSheet(wb: Workbook, input: AdminExcelReportInput) {
  const { stats } = input;
  const sheet = wb.addWorksheet('Resumen Ejecutivo', {
    properties: { defaultRowHeight: 20 },
    pageSetup: { orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
  });

  setColumnWidths(sheet, [4, 34, 18, 12, 12, 12]);

  const fecha = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  addSheetBanner(
    sheet,
    'Instituto Winston Churchill',
    'Reporte integral — Open House · Sesiones Informativas · Campamento de Verano',
    6
  );

  addMetaRows(sheet, [
    ['Fecha de generación', fecha],
    ['Filtro Open House', input.filtroOpenHouse],
    ['Filtro Sesiones', input.filtroSesiones],
    ['Campamento de Verano', 'Todas las ediciones'],
  ]);

  let row = 9;
  addSectionTitle(sheet, row++, 'RESUMEN EJECUTIVO', 6);
  addMetricRow(sheet, row++, 'Total Open House', stats.totalOpenHouse);
  addMetricRow(sheet, row++, 'Total Sesiones Informativas', stats.totalSesiones);
  addMetricRow(sheet, row++, 'Total Campamento de Verano', stats.totalCampamento);
  addMetricRow(
    sheet,
    row++,
    'TOTAL GENERAL',
    stats.totalOpenHouse + stats.totalSesiones + stats.totalCampamento,
    true
  );

  row++;
  addSectionTitle(sheet, row++, 'OPEN HOUSE — POR NIVEL', 6);
  addMetricRow(sheet, row++, 'Maternal', stats.maternal);
  addMetricRow(sheet, row++, 'Kinder', stats.kinder);
  addMetricRow(sheet, row++, 'Primaria', stats.primaria);
  addMetricRow(sheet, row++, 'Secundaria', stats.secundaria);

  row++;
  addSectionTitle(sheet, row++, 'OPEN HOUSE — CONFIRMACIONES', 6);
  addMetricRow(sheet, row++, 'Confirmados', stats.confirmados);
  addMetricRow(sheet, row++, 'No confirmados', stats.no_confirmados);
  addMetricRow(sheet, row++, 'Pendientes', stats.pendientes);

  row++;
  addSectionTitle(sheet, row++, 'SESIONES — POR NIVEL', 6);
  addMetricRow(sheet, row++, 'Maternal', stats.sesionesMaternal);
  addMetricRow(sheet, row++, 'Kinder', stats.sesionesKinder);
  addMetricRow(sheet, row++, 'Primaria', stats.sesionesPrimaria);
  addMetricRow(sheet, row++, 'Secundaria', stats.sesionesSecundaria);

  row++;
  addSectionTitle(sheet, row++, 'CAMPAMENTO — POR PLAN', 6);
  addMetricRow(sheet, row++, 'Plan 4 semanas', stats.campamento4Semanas);
  addMetricRow(sheet, row++, 'Plan 3 semanas', stats.campamento3Semanas);
  addMetricRow(sheet, row++, 'Plan semanal', stats.campamentoSemanal);

  sheet.mergeCells(row + 1, 1, row + 1, 6);
  const footer = sheet.getCell(row + 1, 1);
  footer.value = 'Generado desde el Dashboard de Gestión Winston · open-house-chi.vercel.app/admin';
  styleCell(footer, { size: 9, color: C.muted, align: 'center' });
}

function buildOpenHouseSheet(wb: Workbook, input: AdminExcelReportInput) {
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
  addSheetBanner(sheet, 'Open House — Detalle de inscripciones', input.filtroOpenHouse, colCount);

  const headerRow = 4;
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

function buildSesionesSheet(wb: Workbook, input: AdminExcelReportInput) {
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
  addSheetBanner(sheet, 'Sesiones Informativas — Detalle', input.filtroSesiones, colCount);

  const headerRow = 4;
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

function buildCampamentoSheet(wb: Workbook, input: AdminExcelReportInput) {
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
  addSheetBanner(sheet, 'Campamento de Verano — Detalle', 'Todas las ediciones', colCount);

  const headerRow = 4;
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

  buildResumenSheet(wb, input);
  buildOpenHouseSheet(wb, input);
  buildSesionesSheet(wb, input);
  buildCampamentoSheet(wb, input);

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
