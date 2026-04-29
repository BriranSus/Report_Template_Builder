import { useEffect, useRef, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { ColumnLibrary }  from '../components/ColumnLibrary';
import { SectionPanel }   from '../components/BuilderCanvas';
import { TablePreview }   from '../components/TablePreview';
import { ColumnSettings } from '../components/ColumnSettings';

import { useTemplateStore } from '../store/templateStore';
import { generateMockData } from '../utils/mockData';
import { exportAsJPEG, exportAsPDF, exportAsXLSX } from '../utils/exportUtils';
import { loadTemplates } from '../utils/storage';
import { countSectionLeaves, MAX_LEAVES } from '../types';
import type { LibraryItem, TemplateColumn } from '../types';

const uid = () => Math.random().toString(36).substr(2, 9);

const makeColumn = (item: LibraryItem): TemplateColumn => ({
  id: uid(),
  label: item.label,
  key: item.id,
  type: item.type,
  visible: true,
  align: ['plant','material','report_date'].includes(item.id) ? 'center' : 'right',
  width: item.type === 'basic' ? 70 : 80,
  children: (item.children ?? []).map((ch) => ({
    id: uid(), label: ch.label, key: ch.id,
    visible: true, align: 'right' as const, width: 70,
  })),
});

export const BuilderPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const tableRef = useRef<HTMLDivElement>(null);
  const mockData = useMemo(() => generateMockData(), []);

  const {
    activeTemplate, setActiveTemplate, setTemplateName,
    addColumn, removeColumn, reorderColumns,
    addSection, saveActiveTemplate, createNewTemplate,
    selectedColId, selectedSectionId, setSelectedCol,
  } = useTemplateStore();

  const [activeDragItem, setActiveDragItem] = useState<{ label: string; isLib: boolean } | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const found = loadTemplates().find((t) => t.id === id);
      if (found) setActiveTemplate(found);
    } else if (!activeTemplate) {
      createNewTemplate();
    }
  }, [id]); // eslint-disable-line

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current;
    if (data?.type === 'library-item') {
      setActiveDragItem({ label: (data.item as LibraryItem).label, isLib: true });
    } else if (data?.type === 'section-col') {
      setActiveDragItem({ label: '', isLib: false });
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = e;
    if (!over || !activeTemplate) return;

    const activeData = active.data.current;
    const overData   = over.data.current;

    // ── Library item dropped onto a section ──────────────────────────────────
    if (activeData?.type === 'library-item') {
      // Find which section was the drop target (the droppable id is "section-drop::{sectionId}")
      const dropId = String(over.id);
      const sectionId = dropId.startsWith('section-drop::')
        ? dropId.replace('section-drop::', '')
        : overData?.sectionId as string | undefined;

      if (!sectionId) return;

      const section = activeTemplate.sections.find((s) => s.id === sectionId);
      if (!section) return;

      // Enforce leaf-column cap
      const item = activeData.item as LibraryItem;
      const newLeaves = (item.children?.length ?? 0) || 1;
      if (countSectionLeaves(section.columns) + newLeaves > MAX_LEAVES) return; // silently reject (card shows "Full")

      addColumn(sectionId, makeColumn(item));
      return;
    }

    // ── Column card reordered within same section ────────────────────────────
    if (activeData?.type === 'section-col') {
      const fromSectionId = activeData.sectionId as string;
      const fromColId     = activeData.colId as string;

      // Determine target section + column
      const toId = String(over.id); // "sectionId::colId" or "section-drop::sectionId"
      let toSectionId: string;
      let toColId: string | null = null;

      if (toId.startsWith('section-drop::')) {
        toSectionId = toId.replace('section-drop::', '');
      } else {
        // format is "sectionId::colId"
        const parts = toId.split('::');
        toSectionId = parts[0];
        toColId = parts[1] ?? null;
      }

      if (fromSectionId !== toSectionId) return; // cross-section move not supported

      const section = activeTemplate.sections.find((s) => s.id === fromSectionId);
      if (!section) return;

      const fromIdx = section.columns.findIndex((c) => c.id === fromColId);
      const toIdx   = toColId ? section.columns.findIndex((c) => c.id === toColId) : section.columns.length - 1;

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        reorderColumns(fromSectionId, fromIdx, toIdx);
      }
    }
  };

  const handleSave = () => {
    saveActiveTemplate();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async (type: 'jpeg' | 'pdf' | 'xlsx') => {
    if (!tableRef.current || !activeTemplate) return;
    const name = activeTemplate.name || 'report';
    setIsExporting(type);
    try {
      if (type === 'jpeg') await exportAsJPEG(tableRef.current, name);
      else if (type === 'pdf') await exportAsPDF(tableRef.current, name);
      else {
        // Flatten all sections for xlsx
        const allCols = activeTemplate.sections.flatMap((s) => s.columns);
        exportAsXLSX(allCols, mockData, name);
      }
    } catch (err) { console.error(err); }
    finally { setIsExporting(null); }
  };

  const sections = activeTemplate?.sections ?? [];
  const totalCols = sections.reduce((s, sec) => s + sec.columns.length, 0);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

      {/* ── Top bar (fixed height, never scrolls) ── */}
      <div className="h-[52px] shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-20">
        <button onClick={() => navigate('/')}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shrink-0">
          ← Back
        </button>

        <input
          value={activeTemplate?.name ?? ''}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template name..."
          className="text-sm font-bold text-navy-800 border-none outline-none bg-transparent flex-1 min-w-0"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {totalCols > 0 && (
            <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-100 rounded">
              {sections.length} table{sections.length !== 1 ? 's' : ''} · {totalCols} col{totalCols !== 1 ? 's' : ''}
            </span>
          )}
          {(['jpeg','pdf','xlsx'] as const).map((t) => (
            <button key={t} onClick={() => handleExport(t)} disabled={!!isExporting || totalCols === 0}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-colors">
              {isExporting === t ? '⏳' : t === 'jpeg' ? '📷' : t === 'pdf' ? '📑' : '📊'} {t.toUpperCase()}
            </button>
          ))}
          <button onClick={handleSave}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${saved ? 'bg-green-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-700'}`}>
            {saved ? '✓ Saved' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* ── 3-panel body: fills remaining height exactly ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>

        {/* LEFT — Column Library: h-full, own scroll */}
        <div className="flex flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden" style={{ width: 230 }}>
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Column Library</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Drag columns into a table</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ColumnLibrary />
          </div>
        </div>

        {/* CENTER — Builder + Preview: own scroll */}
        <div className="flex-1 overflow-y-auto bg-slate-100 min-w-0">
          <div className="p-4 flex flex-col gap-4">

            {/* ── Builder section label + add button ── */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Table Builder</p>
              <button
                onClick={addSection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 text-white rounded-lg text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm"
              >
                <span className="text-base leading-none">+</span> Add Table
              </button>
            </div>

            {/* ── Per-section drag-and-drop panels ── */}
            <div className="flex flex-col gap-3">
              {sections.map((section, idx) => (
                <SectionPanel
                  key={section.id}
                  section={section}
                  index={idx}
                  isOnlySection={sections.length === 1}
                  selectedColId={selectedColId}
                  selectedSectionId={selectedSectionId}
                  onSelectCol={(colId, secId) => setSelectedCol(colId, secId)}
                  onDeselectCol={() => setSelectedCol(null, null)}
                />
              ))}
            </div>

            {/* ── Live previews for each section ── */}
            {totalCols > 0 && (
              <div className="flex flex-col gap-6 mt-2" ref={tableRef}>
                {sections.filter((s) => s.columns.length > 0).map((section, idx) => (
                  <div key={section.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Preview — {section.name}
                      </p>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">
                        {mockData.length} rows
                      </span>
                    </div>
                    <TablePreview columns={section.columns} data={mockData} />
                  </div>
                ))}
              </div>
            )}

            {totalCols === 0 && (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
                Drag columns from the library into a table above
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Column Settings: h-full, own scroll */}
        <ColumnSettings selectedColId={selectedColId} selectedSectionId={selectedSectionId} />
      </div>

      {/* Drag overlay ghost */}
      <DragOverlay dropAnimation={null}>
        {activeDragItem && (
          <div className={`px-3 py-2 rounded-lg shadow-xl text-xs font-semibold text-white opacity-90 ${
            activeDragItem.isLib ? 'bg-navy-800' : 'bg-navy-700 border-2 border-gold-400'
          }`}>
            {activeDragItem.isLib ? `+ ${activeDragItem.label}` : 'Moving column…'}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
