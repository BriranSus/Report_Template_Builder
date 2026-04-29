import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTemplateStore } from '../store/templateStore';
import type { Template } from '../types';

const ConfirmModal = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div
    className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-xl p-7 w-[380px] max-w-[90vw] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-lg font-bold text-navy-800 mb-2">Delete Template?</h2>
      <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export const TemplateListPage = () => {
  const navigate = useNavigate();
  const { templates, loadAll, deleteTemplate, duplicateTemplate, setActiveTemplate, createNewTemplate } =
    useTemplateStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleNew = () => {
    createNewTemplate();
    navigate('/builder');
  };

  const handleEdit = (tpl: Template) => {
    setActiveTemplate(tpl);
    navigate(`/builder/${tpl.id}`);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTemplate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-7 py-5 flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and export reports</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-7 flex-1 overflow-y-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy-800">Export Templates</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {templates.length}
            </span>
          </div>
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New Template
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {/* New card */}
          <div
            onClick={handleNew}
            className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center min-h-[120px] cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 p-6"
          >
            <span className="text-3xl text-slate-300 mb-2">+</span>
            <span className="text-sm text-slate-400 font-medium">Create New Template</span>
          </div>

          {/* Template cards */}
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-navy-800 leading-tight">{tpl.name}</h3>
                <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                  {tpl.sections?.reduce((s, sec) => s + sec.columns.length, 0) ?? 0} cols
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Created {new Date(tpl.createdAt).toLocaleDateString()}
                {tpl.updatedAt !== tpl.createdAt && (
                  <> · Updated {new Date(tpl.updatedAt).toLocaleDateString()}</>
                )}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tpl)}
                  className="flex-1 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => duplicateTemplate(tpl.id)}
                  className="flex-1 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  ⎘ Duplicate
                </button>
                <button
                  onClick={() => setDeleteId(tpl.id)}
                  className="flex-1 py-1.5 text-xs font-medium bg-white border border-red-100 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium mb-1">No templates yet</p>
            <p className="text-xs">Click &quot;New Template&quot; to get started</p>
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </>
  );
};
