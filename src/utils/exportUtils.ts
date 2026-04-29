import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { TemplateColumn, MockDataRow } from '../types';

/** Flatten visible leaf columns into an ordered list with their parent ref */
export interface FlatCol {
  col: TemplateColumn;
  child: TemplateColumn['children'][0] | null;
  key: string;
}

export const flattenColumns = (columns: TemplateColumn[]): FlatCol[] => {
  const result: FlatCol[] = [];
  columns.filter((c) => c.visible).forEach((c) => {
    const visCh = c.children.filter((ch) => ch.visible);
    if (visCh.length > 0) {
      visCh.forEach((ch) => result.push({ col: c, child: ch, key: ch.key }));
    } else {
      result.push({ col: c, child: null, key: c.key });
    }
  });
  return result;
};

export const exportAsJPEG = async (element: HTMLElement, filename: string): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  link.download = `${filename}.jpg`;
  link.click();
};

export const exportAsPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = (canvas.height / canvas.width) * pageW;
  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
  pdf.save(`${filename}.pdf`);
};

export const exportAsXLSX = (
  columns: TemplateColumn[],
  data: MockDataRow[],
  filename: string
): void => {
  const visCols = columns.filter((c) => c.visible);
  const flatCols = flattenColumns(visCols);

  // Build two header rows mirroring the merged-cell layout
  const header1: string[] = [];
  const header2: string[] = [];
  visCols.forEach((c) => {
    const visCh = c.children.filter((ch) => ch.visible);
    if (visCh.length > 0) {
      visCh.forEach((ch, i) => {
        header1.push(i === 0 ? c.label : '');
        header2.push(ch.label);
      });
    } else {
      header1.push(c.label);
      header2.push('');
    }
  });

  const rows = data.map((row) => flatCols.map(({ key }) => row[key] ?? '-'));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header1, header2, ...rows]);

  // Merge cells in header1 for groups
  const merges: XLSX.Range[] = [];
  let colIdx = 0;
  visCols.forEach((c) => {
    const visCh = c.children.filter((ch) => ch.visible);
    const span = visCh.length > 0 ? visCh.length : 1;
    if (span > 1) {
      merges.push({ s: { r: 0, c: colIdx }, e: { r: 0, c: colIdx + span - 1 } });
    }
    colIdx += span;
  });
  if (merges.length > 0) ws['!merges'] = merges;

  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
