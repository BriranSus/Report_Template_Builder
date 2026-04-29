import { useState } from 'react';
import { useTemplateStore } from '../store/templateStore';
import type { TemplateColumn, Alignment, ColumnChild } from '../types';

const AlignBtn = ({ value, current, onClick }: { value: Alignment; current: Alignment; onClick: () => void }) => {
  const icons: Record<Alignment, string> = { left: '⫷', center: '≡', right: '⫸' };
  return (
    <button onClick={onClick} className={`flex-1 py-1.5 rounded border text-sm transition-all ${
      current === value ? 'bg-navy-800 text-white border-navy-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`}>{icons[value]}</button>
  );
};

const FormulaHelp = () => (
  <details className="mt-1">
    <summary className="text-[10px] text-blue-500 cursor-pointer select-none hover:text-blue-700">
      How to write formulas?
    </summary>
    <div className="mt-1.5 p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-800 space-y-1 leading-relaxed">
      <p>Use any column <strong>key</strong> as a variable:</p>
      <code className="block bg-white px-1.5 py-1 rounded border border-blue-100">mdn_total_receive - mdn_usage</code>
      <code className="block bg-white px-1.5 py-1 rounded border border-blue-100">corn_stock + wheat_stock</code>
      <code className="block bg-white px-1.5 py-1 rounded border border-blue-100">(gp_plan - gp_real) / gp_plan * 100</code>
      <p className="text-blue-600">Formula cells show a green tint + <em>ƒ</em> marker.</p>
    </div>
  </details>
);

const ChildEditor = ({ ch, sectionId, colId }: { ch: ColumnChild; sectionId: string; colId: string }) => {
  const { updateChild, removeChild } = useTemplateStore();
  const [showFormula, setShowFormula] = useState(!!ch.formula);
  return (
    <div className={`border border-slate-200 rounded-md overflow-hidden mb-1.5 ${ch.visible ? '' : 'opacity-40'}`}>
      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5">
        <input type="checkbox" checked={ch.visible}
          onChange={(e) => updateChild(sectionId, colId, ch.id, { visible: e.target.checked })}
          className="w-3 h-3 cursor-pointer accent-navy-800 shrink-0" />
        <input type="text" value={ch.label}
          onChange={(e) => updateChild(sectionId, colId, ch.id, { label: e.target.value })}
          className="flex-1 text-xs bg-transparent border-none outline-none text-navy-800 font-medium min-w-0" />
        <button onClick={() => setShowFormula((s) => !s)}
          className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors shrink-0 ${
            ch.formula ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
          }`} title="Formula">ƒ</button>
        <button onClick={() => removeChild(sectionId, colId, ch.id)}
          className="text-red-400 hover:text-red-600 text-sm leading-none font-bold shrink-0">×</button>
      </div>
      {showFormula && (
        <div className="px-2 pb-2 bg-white border-t border-slate-100">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 mb-1">Formula</label>
          <textarea rows={2} value={ch.formula ?? ''}
            onChange={(e) => updateChild(sectionId, colId, ch.id, { formula: e.target.value || undefined })}
            placeholder="e.g. mdn_total_receive - mdn_usage"
            className="w-full text-[11px] font-mono px-2 py-1 border border-slate-200 rounded resize-none focus:outline-none focus:border-blue-400 bg-slate-50" />
          <FormulaHelp />
        </div>
      )}
    </div>
  );
};

interface ColumnSettingsProps {
  selectedColId: string | null;
  selectedSectionId: string | null;
}

export const ColumnSettings = ({ selectedColId, selectedSectionId }: ColumnSettingsProps) => {
  const { activeTemplate, updateColumn, addChild } = useTemplateStore();
  const [newChildLabel, setNewChildLabel] = useState('');
  const [showFormula, setShowFormula] = useState(false);

  const section = activeTemplate?.sections.find((s) => s.id === selectedSectionId);
  const col: TemplateColumn | undefined = section?.columns.find((c) => c.id === selectedColId);

  if (!col || !section) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-white border-l border-slate-200" style={{ width: 260, minWidth: 260 }}>
        <div className="px-3 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Column Settings</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
          <span className="text-2xl">☰</span>
          <p className="text-xs text-center">Click a column card to edit its settings</p>
        </div>
      </div>
    );
  }

  const handleAddChild = () => {
    const label = newChildLabel.trim();
    if (!label) return;
    addChild(section.id, col.id, label);
    setNewChildLabel('');
  };

  const leafCol = col.children.length === 0;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-l border-slate-200" style={{ width: 260, minWidth: 260 }}>
      {/* Sticky header */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100 shrink-0 bg-white z-10">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Column Settings</p>
        <p className="text-[11px] text-navy-800 font-semibold mt-0.5 truncate">{col.label}</p>
        <p className="text-[10px] text-slate-400 truncate">in {section.name}</p>
      </div>

      {/* Scrollable body */}
      <div className="p-3 flex flex-col gap-4 overflow-y-auto flex-1">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Column Name</label>
          <input type="text" value={col.label}
            onChange={(e) => updateColumn(section.id, col.id, { label: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-navy-800 focus:outline-none focus:border-blue-400 font-medium" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Alignment</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as Alignment[]).map((a) => (
              <AlignBtn key={a} value={a} current={col.align} onClick={() => updateColumn(section.id, col.id, { align: a })} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Width (px)</label>
          <input type="number" min={40} max={300} value={col.width}
            onChange={(e) => updateColumn(section.id, col.id, { width: Math.max(40, parseInt(e.target.value) || 80) })}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs text-navy-800 focus:outline-none focus:border-blue-400" />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visible</label>
          <button onClick={() => updateColumn(section.id, col.id, { visible: !col.visible })}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${col.visible ? 'bg-navy-800' : 'bg-slate-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${col.visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Formula for leaf columns */}
        {leafCol && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formula</label>
              <button onClick={() => setShowFormula((s) => !s)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  col.formula ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}>
                {showFormula ? 'Hide' : col.formula ? 'Edit ƒ' : '+ Add ƒ'}
              </button>
            </div>
            {col.formula && !showFormula && (
              <code className="block text-[10px] bg-emerald-50 border border-emerald-100 rounded px-2 py-1 text-emerald-800 truncate">{col.formula}</code>
            )}
            {showFormula && (
              <div>
                <textarea rows={3} value={col.formula ?? ''}
                  onChange={(e) => updateColumn(section.id, col.id, { formula: e.target.value || undefined })}
                  placeholder="e.g. corn_stock + wheat_stock"
                  className="w-full text-[11px] font-mono px-2 py-1.5 border border-slate-200 rounded resize-none focus:outline-none focus:border-blue-400 bg-slate-50" />
                <FormulaHelp />
              </div>
            )}
          </div>
        )}

        {/* Sub-columns */}
        {col.children.length > 0 && (
          <>
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Sub Columns ({col.children.length})
              </label>
              {col.children.map((ch) => (
                <ChildEditor key={ch.id} ch={ch} sectionId={section.id} colId={col.id} />
              ))}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Add Sub Column</label>
              <div className="flex gap-1.5">
                <input type="text" value={newChildLabel}
                  onChange={(e) => setNewChildLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChild()}
                  placeholder="Label..."
                  className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-blue-400" />
                <button onClick={handleAddChild}
                  className="px-2.5 py-1.5 bg-navy-800 text-white rounded-md text-xs font-medium hover:bg-navy-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
