import type { Template, TableSection } from '../types';

const KEY = 'cpds_templates';
const uid = () => Math.random().toString(36).substr(2, 9);

/** Migrate old flat-columns templates to the new sections model */
const migrate = (raw: unknown): Template => {
  const t = raw as Record<string, unknown>;
  // Already new format
  if (Array.isArray(t['sections'])) return t as unknown as Template;
  // Old format had top-level 'columns' array — wrap in one section
  const sections: TableSection[] = [
    {
      id: uid(),
      name: 'Table 1',
      columns: (t['columns'] as Template['sections'][0]['columns']) ?? [],
    },
  ];
  return { ...(t as unknown as Template), sections };
};

export const loadTemplates = (): Template[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as unknown[]).map(migrate);
  } catch {
    return [];
  }
};

export const saveTemplates = (templates: Template[]): void => {
  localStorage.setItem(KEY, JSON.stringify(templates));
};

export const upsertTemplate = (template: Template): Template[] => {
  const all = loadTemplates();
  const idx = all.findIndex((t) => t.id === template.id);
  if (idx >= 0) all[idx] = template;
  else all.push(template);
  saveTemplates(all);
  return all;
};

export const deleteTemplate = (id: string): Template[] => {
  const updated = loadTemplates().filter((t) => t.id !== id);
  saveTemplates(updated);
  return updated;
};
