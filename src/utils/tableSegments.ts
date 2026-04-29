import type { TemplateColumn, TableSegment } from '../types';

const MAX_LEAF_COLS = 14;

/**
 * Count visible leaf columns for a TemplateColumn.
 * A "leaf" is either a column with no children, or each visible child.
 */
const leafCount = (col: TemplateColumn): number => {
  const vis = col.children.filter((ch) => ch.visible);
  return vis.length > 0 ? vis.length : 1;
};

/**
 * Splits the visible template columns into segments of at most MAX_LEAF_COLS leaves.
 * Each segment is a standalone table (same rows, different columns).
 *
 * Strategy: greedily fill each segment. If a single group column has more leaves
 * than MAX_LEAF_COLS, it gets its own segment (truncated display is avoided by
 * letting TanStack Table scroll horizontally within that segment).
 */
export const buildTableSegments = (columns: TemplateColumn[]): TableSegment[] => {
  const visCols = columns.filter((c) => c.visible);
  if (visCols.length === 0) return [];

  const segments: TableSegment[] = [];
  let currentCols: TemplateColumn[] = [];
  let currentLeaves = 0;

  for (const col of visCols) {
    const leaves = leafCount(col);

    if (currentLeaves + leaves > MAX_LEAF_COLS && currentCols.length > 0) {
      // Flush current segment
      segments.push({ columns: currentCols, leafCount: currentLeaves });
      currentCols = [];
      currentLeaves = 0;
    }

    currentCols.push(col);
    currentLeaves += leaves;
  }

  if (currentCols.length > 0) {
    segments.push({ columns: currentCols, leafCount: currentLeaves });
  }

  return segments;
};
