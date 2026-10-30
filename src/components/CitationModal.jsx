import React from "react";
import { X, FileText, Bookmark, ShieldCheck } from "lucide-react";

/**
 * CitationModal Component
 * Shows a focused modal displaying the exact raw chunk passage,
 * page number, document name, and vector similarity score.
 * Fully supports Light and Dark modes.
 */
export default function CitationModal({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl shadow-slate-300/60 dark:shadow-indigo-950/50 transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-500/30">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{citation.docName}</span>
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Page {citation.page}
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {Math.round(citation.similarity * 100)}% Similarity Match
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Passage */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Retrieved Semantic Chunk
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Vector ID: {citation.id}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap">
            {citation.snippet}
          </div>
        </div>

        {/* Metadata & Actions */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verified Ground Truth from Knowledge Index</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
