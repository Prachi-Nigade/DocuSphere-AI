import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  FileText,
  FileCode,
  Printer,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
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
        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 transition shadow-xs"
        title="Export Session Transcript & Summaries"
      >
        <Download className="h-3.5 w-3.5 text-indigo-400" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="h-3 w-3 text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-fade-in text-xs">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
            Export Transcript
          </div>

          {/* 1. Markdown Export */}
          <button
            onClick={() => {
              exportSessionToMarkdown(session);
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-300 transition text-left"
          >
            <FileText className="h-4 w-4 text-purple-400" />
            <div>
              <div className="font-medium">Markdown (.md)</div>
              <div className="text-[10px] text-slate-400">
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
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-300 transition text-left"
          >
            <FileCode className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="font-medium">Structured JSON (.json)</div>
              <div className="text-[10px] text-slate-400">
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
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-300 transition text-left"
          >
            <Printer className="h-4 w-4 text-blue-400" />
            <div>
              <div className="font-medium">Print / PDF Report</div>
              <div className="text-[10px] text-slate-400">
                Clean executive briefing layout
              </div>
            </div>
          </button>

          <div className="border-t border-slate-800/80 my-1"></div>

          {/* 4. Copy Slack Summary */}
          <button
            onClick={handleCopySlack}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-indigo-300 transition text-left"
          >
            {copiedSummary ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-amber-400" />
            )}
            <div>
              <div className="font-medium">
                {copiedSummary ? "Copied!" : "Copy for Slack / Teams"}
              </div>
              <div className="text-[10px] text-slate-400">
                Concise executive summary snippet
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
