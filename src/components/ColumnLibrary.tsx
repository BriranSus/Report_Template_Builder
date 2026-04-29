import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { COLUMN_LIBRARY } from '../data/columnLibrary';
import type { LibraryItem } from '../types';

const DraggableItem = ({ item }: { item: LibraryItem }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${item.id}`,
    data: { type: 'library-item', item },
  });

  return (
    <div
      ref={setNodeRef}
      style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 rounded cursor-grab
        border border-transparent hover:bg-blue-50 hover:border-blue-200 hover:text-navy-800
        transition-all duration-100 select-none ${isDragging ? 'opacity-30' : ''}`}
    >
      <span className="flex-1 font-medium">{item.label}</span>
      {item.children && item.children.length > 0 && (
        <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded font-medium shrink-0">
          {item.children.length} cols
        </span>
      )}
    </div>
  );
};

// Exported as just the scrollable list — the panel wrapper lives in BuilderPage
export const ColumnLibrary = () => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (g: string) => setCollapsed((s) => ({ ...s, [g]: !s[g] }));

  return (
    <div className="p-2">
      {COLUMN_LIBRARY.map((grp) => (
        <div key={grp.group} className="mb-1.5">
          <button
            onClick={() => toggle(grp.group)}
            className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-navy-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            <span>{grp.group}</span>
            <span className="text-slate-400 text-[10px]">{collapsed[grp.group] ? '▶' : '▼'}</span>
          </button>
          {!collapsed[grp.group] && (
            <div className="mt-0.5 pl-1">
              {grp.items.map((item) => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
