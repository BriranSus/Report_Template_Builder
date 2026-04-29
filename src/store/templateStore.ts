import { create } from 'zustand';
import type { Template, TableSection, TemplateColumn, ColumnChild } from '../types';
import { loadTemplates, upsertTemplate, deleteTemplate } from '../utils/storage';

const uid = () => Math.random().toString(36).substr(2, 9);

const newSection = (index: number): TableSection => ({
  id: uid(),
  name: `Table ${index + 1}`,
  columns: [],
});

interface TemplateStore {
  templates: Template[];
  activeTemplate: Template | null;
  selectedColId: string | null;        // globally selected column (any section)
  selectedSectionId: string | null;    // which section is active for settings

  // List
  loadAll: () => void;
  setActiveTemplate: (t: Template | null) => void;
  saveActiveTemplate: () => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  createNewTemplate: (name?: string) => Template;

  // Template meta
  setTemplateName: (name: string) => void;

  // Selection
  setSelectedCol: (colId: string | null, sectionId: string | null) => void;

  // Section management
  addSection: () => void;
  removeSection: (sectionId: string) => void;
  renameSection: (sectionId: string, name: string) => void;
  clearSection: (sectionId: string) => void;

  // Column management (scoped to a section)
  addColumn: (sectionId: string, col: TemplateColumn) => void;
  removeColumn: (sectionId: string, colId: string) => void;
  updateColumn: (sectionId: string, colId: string, updates: Partial<TemplateColumn>) => void;
  reorderColumns: (sectionId: string, fromIdx: number, toIdx: number) => void;

  // Child management
  updateChild: (sectionId: string, colId: string, childId: string, updates: Partial<ColumnChild>) => void;
  removeChild: (sectionId: string, colId: string, childId: string) => void;
  addChild: (sectionId: string, colId: string, label: string) => void;
}

const patchSection = (
  template: Template,
  sectionId: string,
  patcher: (s: TableSection) => TableSection
): Template => ({
  ...template,
  sections: template.sections.map((s) => (s.id === sectionId ? patcher(s) : s)),
});

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  activeTemplate: null,
  selectedColId: null,
  selectedSectionId: null,

  loadAll: () => set({ templates: loadTemplates() }),

  setActiveTemplate: (t) => set({ activeTemplate: t, selectedColId: null, selectedSectionId: null }),

  saveActiveTemplate: () => {
    const { activeTemplate } = get();
    if (!activeTemplate) return;
    const updated = { ...activeTemplate, updatedAt: new Date().toISOString() };
    const all = upsertTemplate(updated);
    set({ templates: all, activeTemplate: updated });
  },

  deleteTemplate: (id) => set({ templates: deleteTemplate(id) }),

  duplicateTemplate: (id) => {
    const src = get().templates.find((t) => t.id === id);
    if (!src) return;
    const copy: Template = {
      ...src,
      id: uid(),
      name: src.name + ' (Copy)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ templates: upsertTemplate(copy) });
  },

  createNewTemplate: (name = 'New Template') => {
    const t: Template = {
      id: uid(),
      name,
      sections: [newSection(0)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ activeTemplate: t, selectedColId: null, selectedSectionId: null });
    return t;
  },

  setTemplateName: (name) =>
    set((s) => ({ activeTemplate: s.activeTemplate ? { ...s.activeTemplate, name } : null })),

  setSelectedCol: (colId, sectionId) =>
    set({ selectedColId: colId, selectedSectionId: sectionId }),

  // ── Sections ──
  addSection: () =>
    set((s) => {
      if (!s.activeTemplate) return s;
      const idx = s.activeTemplate.sections.length;
      return {
        activeTemplate: {
          ...s.activeTemplate,
          sections: [...s.activeTemplate.sections, newSection(idx)],
        },
      };
    }),

  removeSection: (sectionId) =>
    set((s) => {
      if (!s.activeTemplate) return s;
      const sections = s.activeTemplate.sections.filter((sec) => sec.id !== sectionId);
      // Always keep at least one section
      const final = sections.length > 0 ? sections : [newSection(0)];
      return {
        activeTemplate: { ...s.activeTemplate, sections: final },
        selectedColId: s.selectedSectionId === sectionId ? null : s.selectedColId,
        selectedSectionId: s.selectedSectionId === sectionId ? null : s.selectedSectionId,
      };
    }),

  renameSection: (sectionId, name) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({ ...sec, name }))
        : null,
    })),

  clearSection: (sectionId) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({ ...sec, columns: [] }))
        : null,
    })),

  // ── Columns ──
  addColumn: (sectionId, col) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({
            ...sec,
            columns: [...sec.columns, col],
          }))
        : null,
    })),

  removeColumn: (sectionId, colId) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({
            ...sec,
            columns: sec.columns.filter((c) => c.id !== colId),
          }))
        : null,
      selectedColId: s.selectedColId === colId ? null : s.selectedColId,
    })),

  updateColumn: (sectionId, colId, updates) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({
            ...sec,
            columns: sec.columns.map((c) => (c.id === colId ? { ...c, ...updates } : c)),
          }))
        : null,
    })),

  reorderColumns: (sectionId, fromIdx, toIdx) =>
    set((s) => {
      if (!s.activeTemplate) return s;
      return {
        activeTemplate: patchSection(s.activeTemplate, sectionId, (sec) => {
          const cols = [...sec.columns];
          const [moved] = cols.splice(fromIdx, 1);
          cols.splice(toIdx, 0, moved);
          return { ...sec, columns: cols };
        }),
      };
    }),

  // ── Children ──
  updateChild: (sectionId, colId, childId, updates) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({
            ...sec,
            columns: sec.columns.map((c) =>
              c.id === colId
                ? { ...c, children: c.children.map((ch) => (ch.id === childId ? { ...ch, ...updates } : ch)) }
                : c
            ),
          }))
        : null,
    })),

  removeChild: (sectionId, colId, childId) =>
    set((s) => ({
      activeTemplate: s.activeTemplate
        ? patchSection(s.activeTemplate, sectionId, (sec) => ({
            ...sec,
            columns: sec.columns.map((c) =>
              c.id === colId ? { ...c, children: c.children.filter((ch) => ch.id !== childId) } : c
            ),
          }))
        : null,
    })),

  addChild: (sectionId, colId, label) =>
    set((s) => {
      if (!s.activeTemplate) return s;
      const child: ColumnChild = {
        id: uid(),
        label,
        key: label.toLowerCase().replace(/\s+/g, '_'),
        visible: true,
        align: 'right',
        width: 70,
      };
      return {
        activeTemplate: patchSection(s.activeTemplate, sectionId, (sec) => ({
          ...sec,
          columns: sec.columns.map((c) =>
            c.id === colId ? { ...c, children: [...c.children, child] } : c
          ),
        })),
      };
    }),
}));
