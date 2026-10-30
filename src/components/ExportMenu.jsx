import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  FileText,
  FileCode,
  Printer,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  exportSessionToMarkdown,
  exportSessionToJSON,
  printSessionReport,
  generateTeamSlackSnippet,
} from "../utils/sessionManager";

/**
 * ExportMenu Component
 * Provides clean dropdown options to export session transcripts,
 * summaries, JSON feeds, or trigger executive PDF reports.
 * Fully supports Light and Dark modes.
 */
export default function ExportMenu({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopySlack = () => {
    const text = generateTeamSlackSnippet(session);
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => {
      setCopiedSummary(false);
      setIsOpen(false);
    }, 1800);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition shadow-xs cursor-pointer"
        title="Export Session Transcript & Summaries"
      >
        <Download className="h-3.5 w-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-1.5 shadow-2xl shadow-slate-300/60 dark:shadow-indigo-950/60 backdrop-blur-xl z-50 animate-fade-in text-xs transition-colors">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Export Transcript
          </div>

          {/* 1. Markdown Export */}
          <button
            onClick={() => {
              exportSessionToMarkdown(session);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-300 transition text-left cursor-pointer"
          >
            <FileText className="h-4 w-4 text-purple-500" />
            <div>
              <div className="font-semibold">Markdown (.md)</div>
              <div className="text-[10px] text-slate-500">
                Full transcript & citations table
              </div>
            </div>
          </button>

          {/* 2. JSON Export */}
          <button
            onClick={() => {
              exportSessionToJSON(session);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-300 transition text-left cursor-pointer"
          >
            <FileCode className="h-4 w-4 text-emerald-500" />
            <div>
              <div className="font-semibold">Structured JSON (.json)</div>
              <div className="text-[10px] text-slate-500">
                Machine-readable Q&A data
              </div>
            </div>
          </button>

          {/* 3. Print / PDF Executive Report */}
          <button
            onClick={() => {
              printSessionReport(session);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-300 transition text-left cursor-pointer"
          >
            <Printer className="h-4 w-4 text-blue-500" />
            <div>
              <div className="font-semibold">Print / PDF Report</div>
              <div className="text-[10px] text-slate-500">
                Clean executive briefing layout
              </div>
            </div>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800/80 my-1"></div>

          {/* 4. Copy Slack Summary */}
          <button
            onClick={handleCopySlack}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300 transition text-left cursor-pointer"
          >
            {copiedSummary ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-amber-500" />
            )}
            <div>
              <div className="font-semibold">
                {copiedSummary ? "Copied!" : "Copy for Slack / Teams"}
              </div>
              <div className="text-[10px] text-slate-500">
                Concise executive summary snippet
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
