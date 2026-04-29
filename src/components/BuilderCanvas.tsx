import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useTemplateStore } from '../store/templateStore';
import type { TableSection, TemplateColumn } from '../types';
import { countSectionLeaves, MAX_LEAVES } from '../types';

// ── Sortable column card ──────────────────────────────────────────────────────
interface ColCardProps {
  col: TemplateColumn;
  sectionId: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const ColCard = ({ col, sectionId, isSelected, onSelect, onRemove }: ColCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${sectionId}::${col.id}`,
    data: { type: 'section-col', sectionId, colId: col.id },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const visChildren = col.children.filter((c) => c.visible);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`rounded-lg border-2 cursor-pointer transition-all duration-150 select-none text-white
        ${isSelected ? 'border-gold-400 bg-navy-700' : 'border-transparent bg-navy-800 hover:border-gold-400/50'}
        ${isDragging ? 'opacity-40 shadow-2xl z-50' : ''}
        ${col.visible ? '' : 'opacity-40'}`}
    >
      <div
        className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-navy-700 rounded-t-lg"
        {...listeners}
        {...attributes}
      >
        <span className="text-[11px] font-bold tracking-wide truncate max-w-[110px]">{col.label}</span>
        <button
          className="text-white/30 hover:text-red-400 text-base leading-none font-bold shrink-0 transition-colors"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >×</button>
      </div>
      {visChildren.length > 0 && (
        <div className="flex flex-wrap gap-1 p-1.5 rounded-b-lg">
          {visChildren.map((ch) => (
            <span key={ch.id} className="px-1.5 py-0.5 bg-navy-600 text-slate-300 rounded text-[10px] font-medium">
              {ch.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Single section drop zone ──────────────────────────────────────────────────
interface SectionPanelProps {
  section: TableSection;
  index: number;
  isOnlySection: boolean;
  selectedColId: string | null;
  selectedSectionId: string | null;
  onSelectCol: (colId: string, sectionId: string) => void;
  onDeselectCol: () => void;
}

export const SectionPanel = ({
  section,
  index,
  isOnlySection,
  selectedColId,
  selectedSectionId,
  onSelectCol,
  onDeselectCol,
}: SectionPanelProps) => {
  const { removeColumn, removeSection, renameSection, clearSection } = useTemplateStore();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(section.name);

  const { setNodeRef, isOver } = useDroppable({
    id: `section-drop::${section.id}`,
    data: { type: 'section-drop', sectionId: section.id },
  });

  const leafCount = countSectionLeaves(section.columns);
  const isFull = leafCount >= MAX_LEAVES;
  const remaining = MAX_LEAVES - leafCount;

  const handleRename = () => {
    renameSection(section.id, nameVal.trim() || section.name);
    setEditingName(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Section header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        {/* Table number badge */}
        <div className="w-5 h-5 rounded bg-navy-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          {index + 1}
        </div>

        {/* Editable name */}
        {editingName ? (
          <input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false); }}
            className="flex-1 text-xs font-semibold text-navy-800 border border-blue-300 rounded px-1.5 py-0.5 outline-none bg-white"
          />
        ) : (
          <span
            className="flex-1 text-xs font-semibold text-navy-800 cursor-pointer hover:text-blue-600 transition-colors"
            onDoubleClick={() => { setNameVal(section.name); setEditingName(true); }}
            title="Double-click to rename"
          >
            {section.name}
          </span>
        )}

        {/* Leaf counter pill */}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
          isFull
            ? 'bg-red-100 text-red-600 border border-red-200'
            : leafCount > 10
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-100 text-slate-500'
        }`}>
          <span>{leafCount}/{MAX_LEAVES}</span>
          {isFull && <span>· Full</span>}
          {!isFull && leafCount > 0 && <span className="text-slate-400">· {remaining} left</span>}
        </div>

        {/* Actions */}
        {section.columns.length > 0 && (
          <button
            onClick={() => clearSection(section.id)}
            className="text-[10px] text-slate-400 hover:text-red-500 transition-colors px-1"
            title="Clear all columns"
          >
            Clear
          </button>
        )}
        {!isOnlySection && (
          <button
            onClick={() => removeSection(section.id)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold shrink-0"
            title="Remove this table"
          >×</button>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`p-3 min-h-[90px] transition-all duration-150 ${
          isOver && !isFull
            ? 'bg-blue-50 border-blue-200'
            : isOver && isFull
            ? 'bg-red-50'
            : ''
        }`}
      >
        {section.columns.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-16 rounded-lg border-2 border-dashed transition-all ${
            isOver && !isFull ? 'border-blue-400 text-blue-500' : 'border-slate-200 text-slate-300'
          }`}>
            <span className="text-2xl mb-0.5">⊕</span>
            <span className="text-[11px] font-medium">Drop columns here</span>
          </div>
        ) : (
          <SortableContext
            items={section.columns.map((c) => `${section.id}::${c.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {section.columns.map((col) => (
                <ColCard
                  key={col.id}
                  col={col}
                  sectionId={section.id}
                  isSelected={selectedColId === col.id && selectedSectionId === section.id}
                  onSelect={() => {
                    if (selectedColId === col.id && selectedSectionId === section.id) onDeselectCol();
                    else onSelectCol(col.id, section.id);
                  }}
                  onRemove={() => {
                    removeColumn(section.id, col.id);
                    if (selectedColId === col.id) onDeselectCol();
                  }}
                />
              ))}
              {/* End ghost */}
              {!isFull && (
                <div className={`w-12 h-10 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-300 text-lg transition-all ${
                  isOver ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200'
                }`}>+</div>
              )}
            </div>
          </SortableContext>
        )}

        {/* Full warning overlay */}
        {isOver && isFull && (
          <div className="mt-2 text-center text-[11px] text-red-500 font-medium">
            ⚠ Table is full ({MAX_LEAVES} columns max) — create a new table below
          </div>
        )}
      </div>
    </div>
  );
};
