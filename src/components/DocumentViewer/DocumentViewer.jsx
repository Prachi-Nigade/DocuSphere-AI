import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  ArrowDown,
  Check,
  Share2,
  Copy,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
  formatCitationLocation,
} from "../../utils/documentUtils";
import { useAuthRbac } from "../../context/AuthRbacContext";

/**
 * Interactive Clean & Clear Document Viewer
 * Supports multi-format preview (PDF, Excel, Markdown, Word)
 * Supports Light & Dark themes, Fullscreen / Side-by-side mode,
 * Zoom controls, Citation navigation, and Direct Social/WhatsApp sharing.
 */
export default function DocumentViewer({
  document,
  activeCitation,
  onClose,
  onShareDocument,
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSheetTab, setActiveSheetTab] = useState(0);
  const [showJumpToCitation, setShowJumpToCitation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const { currentRole, ROLES } = useAuthRbac();

  const containerRef = useRef(null);
  const highlightRef = useRef(null);

  const format = document ? getFileFormat(document.name) : "pdf";
  const theme = getFormatTheme(format);

  // Sync current page or sheet when activeCitation changes
  useEffect(() => {
    if (activeCitation) {
      if (activeCitation.page) {
        setCurrentPage(activeCitation.page);
      }
      if (activeCitation.sheet && document?.sheetsData) {
        const sheetIndex = document.sheetsData.findIndex(
          (s) => s.name === activeCitation.sheet
        );
        if (sheetIndex !== -1) {
          setActiveSheetTab(sheetIndex);
        }
      }
    }
  }, [activeCitation, document]);

  // Auto-scroll to cited paragraph or row
  useEffect(() => {
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setShowJumpToCitation(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [activeCitation, currentPage, activeSheetTab]);

  // Scroll listener to toggle "Jump to Citation" button if user scrolls away
  const handleScroll = () => {
    if (!highlightRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const highlightRect = highlightRef.current.getBoundingClientRect();

    const isVisible =
      highlightRect.top >= containerRect.top &&
      highlightRect.bottom <= containerRect.bottom;

    setShowJumpToCitation(!isVisible);
  };

  const jumpToCitation = () => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setShowJumpToCitation(false);
    }
  };

  const handleCopyCitationSnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (!document) {
    return (
      <aside className="flex w-full md:w-[48%] lg:w-[45%] flex-col items-center justify-center border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 text-center text-slate-500 dark:text-slate-400 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          title="Close viewer"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
          <FileText className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Document Selected
        </p>
        <p className="mt-1 text-xs text-slate-500 max-w-xs">
          Click any citation badge in chat or choose/upload a document from the left sidebar to inspect.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className={`relative flex h-full flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 backdrop-blur-xl shadow-2xl transition-all duration-300 z-30 ${
        isFullscreen
          ? "fixed inset-0 w-full z-50"
          : "w-full md:w-[48%] lg:w-[45%]"
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-4 md:px-5">
        {/* Document Metadata */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.badgeBg} ${theme.iconColor} ring-1 ${theme.badgeBorder} shadow-xs`}
          >
            {format === "excel" ? (
              <FileSpreadsheet className="h-5 w-5" />
            ) : format === "markdown" ? (
              <FileCode className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="truncate text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                title={document.name}
              >
                {document.name}
              </h3>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}
              >
                {theme.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono">{document.size}</span>
              <span>•</span>
              {document.pages && <span>{document.pages} Pages</span>}
              {document.sheetsCount && <span>{document.sheetsCount} Sheets</span>}
              {document.sectionsCount && <span>{document.sectionsCount} Sections</span>}
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Indexed
              </span>
              {currentRole === ROLES.AUDITOR && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <ClipboardCheck className="h-3 w-3" />
                    Auditor Oversight
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-1.5">
          {/* Share Document Button */}
          <button
            onClick={() => onShareDocument?.(document)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] transition shadow-xs"
            title="Share document summary via WhatsApp & Socials"
          >
            <Share2 className="h-3.5 w-3.5 text-[#25D366]" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-0.5 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
              className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-medium text-slate-600 dark:text-slate-400 min-w-[42px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
              className="rounded p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Fullscreen / Focus Mode Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus View"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 transition"
            title="Close document viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Header: Active Citation Banner */}
      {activeCitation && (
        <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/40 px-4 py-2 text-xs transition-colors">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Verified Ground-Truth:
            </span>
            <span className="rounded bg-indigo-600/10 dark:bg-indigo-500/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-300/50 dark:border-indigo-500/30">
              {formatCitationLocation(activeCitation)}
            </span>
            {activeCitation.similarity && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                {Math.round(activeCitation.similarity * 100)}% Similarity
              </span>
            )}
          </div>

          <button
            onClick={jumpToCitation}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 text-[11px] font-semibold shadow-xs transition"
          >
            <ArrowDown className="h-3 w-3" />
            <span>Focus Highlight</span>
          </button>
        </div>
      )}

      {/* 3. Document Content Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70 dark:bg-slate-950/90 transition-colors"
      >
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
          }}
          className="mx-auto transition-transform duration-150"
        >
          {/* Format-Specific Renderers */}
          {format === "pdf" && (
            <PdfDocumentRenderer
              document={document}
              activeCitation={activeCitation}
              highlightRef={highlightRef}
              onCopySnippet={handleCopyCitationSnippet}
              copiedSnippet={copiedSnippet}
            />
          )}

          {format === "excel" && (
            <ExcelDocumentRenderer
              document={document}
              activeCitation={activeCitation}
              activeSheetTab={activeSheetTab}
              setActiveSheetTab={setActiveSheetTab}
              highlightRef={highlightRef}
            />
          )}

          {(format === "markdown" || format === "text") && (
            <MarkdownDocumentRenderer
              document={document}
              activeCitation={activeCitation}
              highlightRef={highlightRef}
            />
          )}

          {format === "docx" && (
            <DocxDocumentRenderer
              document={document}
              activeCitation={activeCitation}
              highlightRef={highlightRef}
            />
          )}
        </div>
      </div>

      {/* Floating Jump to Citation Button if scrolled away */}
      {showJumpToCitation && activeCitation && (
        <button
          onClick={jumpToCitation}
          className="absolute bottom-14 right-6 z-30 flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 animate-bounce"
        >
          <Sparkles className="h-4 w-4" />
          <span>Jump to Cited Highlight</span>
        </button>
      )}

      {/* 4. Bottom Footer Metadata */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Multi-Format Vector Engine</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>{document.chunksCount || 0} Chunks</span>
          <span>•</span>
          <span>text-embedding-3-large</span>
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------
// Sub-Renderer 1: PDF Multi-Page Document View (Paper Card Look)
// -------------------------------------------------------------
function PdfDocumentRenderer({
  document,
  activeCitation,
  highlightRef,
  onCopySnippet,
  copiedSnippet,
}) {
  const pages = document.pagesData || [
    {
      pageNumber: activeCitation?.page || 1,
      paragraphs: [
        {
          id: "p-default",
          text: activeCitation?.snippet || "No preview text available.",
          isHighlighted: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {pages.map((page) => {
        const isTargetPage = activeCitation?.page === page.pageNumber;

        return (
          <div
            key={page.pageNumber}
            className={`relative rounded-2xl border bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md dark:shadow-xl transition-all ${
              isTargetPage
                ? "border-indigo-400 dark:border-indigo-500/50 ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-[11px] text-slate-500 font-mono">
              <span className="truncate max-w-[280px] font-medium text-slate-600 dark:text-slate-400">
                {document.name}
              </span>
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                Page {page.pageNumber}
              </span>
            </div>

            {/* Page Paragraphs */}
            <div className="space-y-3.5 text-xs md:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
              {page.paragraphs.map((p, pIdx) => {
                const isCited =
                  isTargetPage &&
                  (p.isHighlighted ||
                    (activeCitation?.snippet &&
                      p.text.includes(activeCitation.snippet.slice(0, 40))));

                return (
                  <div
                    key={p.id || pIdx}
                    ref={isCited ? highlightRef : null}
                    className={`relative rounded-xl p-3.5 transition-all duration-300 ${
                      isCited
                        ? "border-2 border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-100 shadow-md ring-2 ring-indigo-500/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {isCited && (
                      <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-500/40">
                          <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-300" />
                          VERIFIED CITED PASSAGE
                        </span>

                        <div className="flex items-center gap-2">
                          {activeCitation?.similarity && (
                            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              {Math.round(activeCitation.similarity * 100)}% Similarity
                            </span>
                          )}
                          <button
                            onClick={() => onCopySnippet(p.text)}
                            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                            title="Copy cited snippet"
                          >
                            {copiedSnippet ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedSnippet ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                    <p className={isCited ? "font-medium text-slate-900 dark:text-slate-100" : ""}>
                      {p.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Renderer 2: Excel / Spreadsheet Viewer (Clean Data Grid)
// -------------------------------------------------------------
function ExcelDocumentRenderer({
  document,
  activeCitation,
  activeSheetTab,
  setActiveSheetTab,
  highlightRef,
}) {
  const sheets = document.sheetsData || [];
  const currentSheet = sheets[activeSheetTab] || sheets[0];

  return (
    <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md dark:shadow-xl overflow-hidden">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 pt-2.5 overflow-x-auto">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.name}
            onClick={() => setActiveSheetTab(idx)}
            className={`rounded-t-xl px-3.5 py-1.5 text-xs font-semibold transition shrink-0 ${
              activeSheetTab === idx
                ? "border-b-2 border-emerald-500 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Spreadsheet Grid */}
      {currentSheet && (
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-mono">
                <th className="p-2.5 text-slate-500 w-12 text-center font-bold">#</th>
                {currentSheet.headers.map((header, hIdx) => (
                  <th key={hIdx} className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSheet.rows.map((row, rIdx) => {
                const isTargetRow =
                  activeCitation?.row === rIdx + 1 ||
                  row.isHighlighted ||
                  (activeCitation?.sheet === currentSheet.name &&
                    activeCitation?.row === rIdx + 1);

                return (
                  <tr
                    key={row.id || rIdx}
                    ref={isTargetRow ? highlightRef : null}
                    className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                      isTargetRow
                        ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-slate-100 ring-2 ring-emerald-500/20"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-2.5 text-center font-mono text-slate-500">
                      {isTargetRow ? (
                        <span className="flex h-2.5 w-2.5 mx-auto rounded-full bg-emerald-500 animate-ping" />
                      ) : (
                        rIdx + 1
                      )}
                    </td>
                    {Object.keys(row)
                      .filter((k) => k !== "id" && k !== "isHighlighted")
                      .map((key, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2.5 ${
                            isTargetRow
                              ? "font-bold text-emerald-800 dark:text-emerald-200"
                              : ""
                          }`}
                        >
                          {row[key]}
                        </td>
                      ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Renderer 3: Markdown Viewer (Crisp Typography)
// -------------------------------------------------------------
function MarkdownDocumentRenderer({ document, activeCitation, highlightRef }) {
  const content =
    document.content ||
    document.chunks?.map((c) => c.text).join("\n\n") ||
    "No text content available.";
  const lines = content.split("\n");

  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md dark:shadow-xl">
      <div className="space-y-3 text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
        {lines.map((line, idx) => {
          const isCited =
            activeCitation?.snippet &&
            line.includes(activeCitation.snippet.slice(0, 30));

          if (line.startsWith("# ")) {
            return (
              <h2
                key={idx}
                className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 pt-2 pb-1 border-b border-slate-200 dark:border-slate-800"
              >
                {line.replace("# ", "")}
              </h2>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h3
                key={idx}
                className="text-sm md:text-base font-bold text-indigo-600 dark:text-indigo-300 pt-3"
              >
                {line.replace("## ", "")}
              </h3>
            );
          }
          if (line.startsWith("```")) {
            return (
              <div
                key={idx}
                className="text-slate-500 dark:text-slate-400 font-mono text-[11px] bg-slate-100 dark:bg-slate-950 p-2 rounded-lg"
              >
                {line}
              </div>
            );
          }
          return (
            <p
              key={idx}
              ref={isCited ? highlightRef : null}
              className={`p-2 rounded-xl transition ${
                isCited
                  ? "border border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold"
                  : ""
              }`}
            >
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Renderer 4: Word Doc (.docx) Viewer (Executive Brief)
// -------------------------------------------------------------
function DocxDocumentRenderer({ document, activeCitation, highlightRef }) {
  const sections = document.sectionsData || [];

  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-md dark:shadow-xl space-y-6">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-300">
              {section.title}
            </h3>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Page {section.page}
            </span>
          </div>

          <div className="space-y-3 text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {section.paragraphs.map((p, pIdx) => {
              const isCited =
                p.isHighlighted ||
                (activeCitation?.snippet &&
                  p.text.includes(activeCitation.snippet.slice(0, 30)));

              return (
                <div
                  key={p.id || pIdx}
                  ref={isCited ? highlightRef : null}
                  className={`rounded-xl p-3.5 transition ${
                    isCited
                      ? "border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-slate-100 shadow-md ring-2 ring-blue-500/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {isCited && (
                    <div className="mb-1 text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wide">
                      ✦ CITED COMPLIANCE POLICY
                    </div>
                  )}
                  <p className={isCited ? "font-semibold" : ""}>{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
