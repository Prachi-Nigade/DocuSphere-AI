import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  FileCode,
  Printer,
  FileCheck,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Eye,
  Layers,
} from "lucide-react";
import {
  exportSessionToMarkdown,
  exportSessionToJSON,
  exportSessionToPlainText,
  printSessionReport,
  generateTeamSlackSnippet,
  generateSessionMarkdown,
} from "../utils/sessionManager";

/**
 * ExportModal Component
 * Displays clear, high-visibility export options with working download actions,
 * print report triggers, and live transcript previews.
 */
export default function ExportModal({ session, onClose }) {
  const [activeTab, setActiveTab] = useState("options"); // "options" | "preview"
  const [downloadStatus, setDownloadStatus] = useState({}); // { md: true, json: true, ... }
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [copiedRawMd, setCopiedRawMd] = useState(false);

  if (!session) return null;

  const handleDownload = (type, fn) => {
    const success = fn(session);
    if (success !== false) {
      setDownloadStatus((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setDownloadStatus((prev) => ({ ...prev, [type]: false }));
      }, 2500);
    }
  };

  const handleCopySlack = () => {
    const text = generateTeamSlackSnippet(session);
    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2200);
  };

  const handleCopyRawMd = () => {
    const text = generateSessionMarkdown(session);
    navigator.clipboard.writeText(text);
    setCopiedRawMd(true);
    setTimeout(() => setCopiedRawMd(false), 2200);
  };

  const markdownPreview = generateSessionMarkdown(session);
  const citationsCount = session.messages.reduce(
    (acc, m) => acc + (m.citations?.length || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-indigo-950/50 flex flex-col max-h-[90vh]">
        {/* 1. Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/10">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Export Conversation & Evidence</span>
              </h3>
              <p className="text-xs text-slate-400">
                {session.title} • {session.messages.length} messages •{" "}
                {citationsCount} citations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Close export dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Tab Bar: [Export Options] vs [Live Preview] */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-5 py-2 text-xs">
          <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab("options")}
              className={`rounded-md px-3 py-1 font-medium transition ${
                activeTab === "options"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Export Options
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Preview Transcript</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            Verified Source Ground-Truth
          </span>
        </div>

        {/* 3. Main Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "options" ? (
            <>
              {/* Grid of 4 Clear Export Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Markdown (.md) */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                        Recommended
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Markdown Document (.md)
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Full dialogue transcript, headings, and a consolidated
                      references table with page citations. Ideal for Notion &
                      Obsidian.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload("md", exportSessionToMarkdown)
                    }
                    className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      downloadStatus.md
                        ? "bg-emerald-600 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-500 shadow-md shadow-purple-950/50"
                    }`}
                  >
                    {downloadStatus.md ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Downloaded .MD ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download .MD</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Executive PDF / Print */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                        <Printer className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                        Executive PDF
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Printable Report / PDF
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Clean formatted executive briefing with verified
                      citations. Direct browser print dialog to save as PDF.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload("pdf", printSessionReport)
                    }
                    className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      downloadStatus.pdf
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-950/50"
                    }`}
                  >
                    {downloadStatus.pdf ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Print Dialog Ready ✓</span>
                      </>
                    ) : (
                      <>
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print / Save PDF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Structured JSON (.json) */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                        <FileCode className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        API Data
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Structured JSON (.json)
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Raw machine-readable payload containing message arrays,
                      similarity scores, and vector coordinate metadata.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload("json", exportSessionToJSON)
                    }
                    className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      downloadStatus.json
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/50"
                    }`}
                  >
                    {downloadStatus.json ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Downloaded .JSON ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download .JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 4. Plain Text (.txt) */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-800/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                        Universal
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      Plain Text Transcript (.txt)
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                      Clean plain text transcript with source citations.
                      Effortless to copy or paste into plain email notes.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload("txt", exportSessionToPlainText)
                    }
                    className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      downloadStatus.txt
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-950/50"
                    }`}
                  >
                    {downloadStatus.txt ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Downloaded .TXT ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download .TXT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Copy Section */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 mt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Quick Clipboard Actions
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Instant team sharing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleCopySlack}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition"
                  >
                    {copiedSlack ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                    )}
                    <span>
                      {copiedSlack ? "Copied Slack Summary!" : "Copy for Slack / Teams"}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyRawMd}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition"
                  >
                    {copiedRawMd ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-indigo-400" />
                    )}
                    <span>
                      {copiedRawMd ? "Copied Markdown!" : "Copy Full Markdown"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Live Markdown Preview */
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {markdownPreview}
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 p-4 px-5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Includes verified citations & page numbers</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-1.5 font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
