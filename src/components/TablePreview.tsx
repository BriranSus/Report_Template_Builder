import { useMemo, forwardRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type CellContext,
} from '@tanstack/react-table';
import type { TemplateColumn, MockDataRow } from '../types';
import { resolveValue } from '../utils/mockData';

const TOTAL_ROWS = new Set(['TOTAL', 'TOTAL FM']);
const HIGHLIGHT_SUFFIXES = new Set(['map','doh','price','date','pct']);

const isHighlightKey = (key: string): boolean =>
  HIGHLIGHT_SUFFIXES.has(key.split('_').pop() ?? '');

type CellMeta = {
  align: string;
  leafKey: string;
  formula?: string;
};

/** Build TanStack columns for ONE segment of template columns */
const buildTanstackCols = (templateCols: TemplateColumn[]): ColumnDef<MockDataRow>[] =>
  templateCols
    .filter((c) => c.visible)
    .map((col) => {
      const visChildren = col.children.filter((ch) => ch.visible);

      if (visChildren.length > 0) {
        return {
          id: col.id,
          header: col.label,
          columns: visChildren.map((ch) => ({
            id: ch.id,
            accessorFn: (row: MockDataRow) => resolveValue(ch.key, ch.formula, row),
            header: ch.label,
            size: ch.width,
            meta: { align: ch.align, leafKey: ch.key, formula: ch.formula } as CellMeta,
          })),
        } as ColumnDef<MockDataRow>;
      }

      return {
        id: col.id,
        accessorFn: (row: MockDataRow) => resolveValue(col.key, col.formula, row),
        header: col.label,
        size: col.width,
        meta: { align: col.align, leafKey: col.key, formula: col.formula } as CellMeta,
      } as ColumnDef<MockDataRow>;
    });

/** Single table segment */
const SegmentTable = ({
  columns,
  data,
}: {
  columns: TemplateColumn[];
  data: MockDataRow[];
}) => {
  const tanstackCols = useMemo(() => buildTanstackCols(columns), [columns]);

  const table = useReactTable({
    data,
    columns: tanstackCols,
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const hasSubHeaders = headerGroups.length > 1;
  const anyGrouped = columns.some((c) => c.children.filter((ch) => ch.visible).length > 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="preview-table">
        <thead>
          {headerGroups.map((hg, hgIdx) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={hgIdx > 0 ? 'sub-header' : ''}
                  style={{ width: header.getSize(), textAlign: 'center' }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
          {/* Ensure 2-row header even for columns that are all basic (no groups) */}
          {!hasSubHeaders && anyGrouped && (
            <tr>
              {table.getLeafHeaders().map((h) => (
                <th key={h.id} className="sub-header" style={{ width: h.getSize() }} />
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isTotal = TOTAL_ROWS.has(String(row.original['plant'] ?? ''));
            return (
              <tr key={row.id} className={isTotal ? 'total-row' : ''}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as CellMeta | undefined;
                  const leafKey = meta?.leafKey ?? '';
                  const formula = meta?.formula;
                  const isText = leafKey === 'plant' || leafKey === 'material' || leafKey === 'report_date';
                  const hl = isHighlightKey(leafKey) && row.index % 3 === 0 && !isTotal;
                  const hasFormula = !!formula;
                  const val = cell.getValue();

                  let display = '-';
                  if (val !== null && val !== undefined && val !== '') {
                    display = String(val);
                  }

                  return (
                    <td
                      key={cell.id}
                      className={[
                        isText ? 'text-col' : '',
                        hl ? 'highlight' : '',
                        hasFormula && display !== '-' ? 'formula-cell' : '',
                      ].filter(Boolean).join(' ')}
                      style={{
                        textAlign: isText ? 'center' : (meta?.align as 'left'|'center'|'right' ?? 'right'),
                        width: cell.column.getSize(),
                      }}
                      title={hasFormula ? `Formula: ${formula}` : undefined}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

interface TablePreviewProps {
  columns: TemplateColumn[];
  data: MockDataRow[];
}

/** Renders the table for a single section */
export const TablePreview = forwardRef<HTMLDivElement, TablePreviewProps>(
  ({ columns, data }, ref) => {
    const visCols = columns.filter((c) => c.visible);

    if (visCols.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 text-slate-400 text-sm rounded-lg border border-dashed border-slate-200">
          No visible columns
        </div>
      );
    }

    return (
      <div ref={ref}>
        <SegmentTable columns={visCols} data={data} />
      </div>
    );
  }
);

TablePreview.displayName = 'TablePreview';
