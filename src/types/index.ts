export type Alignment = 'left' | 'center' | 'right';

export interface ColumnChild {
  id: string;
  label: string;
  key: string;
  visible: boolean;
  align: Alignment;
  width: number;
  formula?: string;
}

export interface TemplateColumn {
  id: string;
  label: string;
  key: string;
  type: 'basic' | 'group';
  visible: boolean;
  align: Alignment;
  width: number;
  children: ColumnChild[];
  formula?: string;
}

/** A single table section — has its own ordered list of columns, max 14 leaf cols */
export interface TableSection {
  id: string;
  name: string;           // e.g. "Table 1", "Table 2"
  columns: TemplateColumn[];
}

export interface Template {
  id: string;
  name: string;
  sections: TableSection[];
  createdAt: string;
  updatedAt: string;
}

export interface LibraryColumnChild {
  id: string;
  label: string;
}

export interface LibraryItem {
  id: string;
  label: string;
  type: 'basic' | 'group';
  children?: LibraryColumnChild[];
}

export interface LibraryGroup {
  group: string;
  items: LibraryItem[];
}

export type MockDataRow = Record<string, string | number>;

/** Count visible leaf columns in a section */
export const countSectionLeaves = (columns: TemplateColumn[]): number =>
  columns.filter((c) => c.visible).reduce((sum, c) => {
    const vis = c.children.filter((ch) => ch.visible);
    return sum + (vis.length > 0 ? vis.length : 1);
  }, 0);

export const MAX_LEAVES = 14;
