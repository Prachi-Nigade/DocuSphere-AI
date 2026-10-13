import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Table,
  FileCode,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowDown,
  RotateCcw,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getFileFormat, getFormatTheme, formatCitationLocation } from "../../utils/documentUtils";

/**
 * Interactive Side-by-Side Document Viewer
 * Supports multi-format preview (PDF, Excel, Markdown, Word)
 * and automatically scrolls to and highlights the cited page & paragraph.
 */
export default function DocumentViewer({
  document,
  activeCitation,
  onClose,
}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSheetTab, setActiveSheetTab] = useState(0);
  const [showJumpToCitation, setShowJumpToCitation] = useState(false);

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

  // Auto-scroll to cited paragraph or row whenever activeCitation or page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setShowJumpToCitation(false);
      }
    }, 250);

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

  if (!document) {
    return (
      <aside className="hidden md:flex w-full md:w-1/2 flex-col items-center justify-center border-l border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
        <FileText className="mb-3 h-10 w-10 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">
          No Document Selected
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Click any citation badge in the chat or choose a document from the sidebar to inspect.
        </p>
      </aside>
    );
  }

  return (
    <aside className="relative flex h-full w-full md:w-[48%] lg:w-[45%] flex-col border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-all duration-300 z-30">
      {/* 1. Header Toolbar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4">
        {/* Document Metadata */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.badgeBg} ${theme.iconColor} ring-1 ${theme.badgeBorder}`}
          >
            {format === "excel" ? (
              <FileSpreadsheet className="h-4.5 w-4.5" />
            ) : format === "markdown" ? (
              <FileCode className="h-4.5 w-4.5" />
            ) : (
              <FileText className="h-4.5 w-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="truncate text-xs font-semibold text-slate-200"
                title={document.name}
              >
                {document.name}
              </h3>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} ring-1 ${theme.badgeBorder}`}
              >
                {theme.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{document.size}</span>
              <span>•</span>
              {document.pages && <span>{document.pages} Pages</span>}
              {document.sheetsCount && <span>{document.sheetsCount} Sheets</span>}
              {document.sectionsCount && <span>{document.sectionsCount} Sections</span>}
            </div>
          </div>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-slate-950/60 p-0.5 text-xs text-slate-300">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 15, 70))}
              className="rounded p-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-400">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
              className="rounded p-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Close document viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Sub-Header: Active Citation Banner */}
      {activeCitation && (
        <div className="flex items-center justify-between border-b border-indigo-500/20 bg-indigo-950/30 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Target Citation:
            </span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-mono text-indigo-300">
              {formatCitationLocation(activeCitation)}
            </span>
            {activeCitation.similarity && (
              <span className="text-[11px] text-emerald-400 font-mono">
                {Math.round(activeCitation.similarity * 100)}% Match
              </span>
            )}
          </div>

          <button
            onClick={jumpToCitation}
            className="flex items-center gap-1 rounded bg-indigo-600/80 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-indigo-500 transition"
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
        className="relative flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/90"
      >
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          className="mx-auto transition-transform duration-150"
        >
          {/* Format-Specific Renderers */}
          {format === "pdf" && (
            <PdfDocumentRenderer
              document={document}
              activeCitation={activeCitation}
              highlightRef={highlightRef}
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

          {format === "markdown" && (
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
          className="absolute bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all duration-200 animate-bounce"
        >
          <Sparkles className="h-4 w-4" />
          <span>Jump to Cited Highlight</span>
        </button>
      )}

      {/* 4. Bottom Footer Metadata */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-slate-800/80 bg-slate-900/80 px-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Interactive Document Ground Truth Inspector</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          Model: text-embedding-3-large
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------
// Sub-Renderer 1: PDF Multi-Page Document View
// -------------------------------------------------------------
function PdfDocumentRenderer({ document, activeCitation, highlightRef }) {
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
            className={`relative rounded-xl border bg-slate-900/90 p-6 md:p-8 shadow-xl transition-all ${
              isTargetPage
                ? "border-indigo-500/50 ring-1 ring-indigo-500/30"
                : "border-slate-800"
            }`}
          >
            {/* Page Header */}
            <div className="flex items-center justify-between border-b border-slate-800/70 pb-3 mb-4 text-[11px] text-slate-500 font-mono">
              <span>{document.name}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-semibold">
                Page {page.pageNumber}
              </span>
            </div>

            {/* Page Paragraphs */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              {page.paragraphs.map((p) => {
                const isCited =
                  isTargetPage &&
                  (p.isHighlighted ||
                    (activeCitation?.snippet &&
                      p.text.includes(activeCitation.snippet.slice(0, 40))));

                return (
                  <div
                    key={p.id}
                    ref={isCited ? highlightRef : null}
                    className={`relative rounded-lg p-3.5 transition-all duration-300 ${
                      isCited
                        ? "border-2 border-indigo-500 bg-indigo-950/40 text-slate-100 shadow-lg shadow-indigo-950/60 ring-2 ring-indigo-500/20"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    {isCited && (
                      <div className="mb-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-indigo-500/40">
                          <Sparkles className="h-3 w-3 text-indigo-300 animate-spin" />
                          VERIFIED CITED PASSAGE
                        </span>
                        {activeCitation?.similarity && (
                          <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                            {Math.round(activeCitation.similarity * 100)}% Similarity
                          </span>
                        )}
                      </div>
                    )}
                    <p className={isCited ? "font-medium text-slate-100" : ""}>
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
// Sub-Renderer 2: Excel / Spreadsheet Viewer
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
    <div className="max-w-3xl mx-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-950/80 px-3 pt-2">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.name}
            onClick={() => setActiveSheetTab(idx)}
            className={`rounded-t-lg px-3 py-1.5 text-xs font-medium transition ${
              activeSheetTab === idx
                ? "border-b-2 border-emerald-500 bg-slate-900 text-emerald-300"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Spreadsheet Grid */}
      {currentSheet && (
        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono">
                <th className="p-2.5 text-slate-600 w-12 text-center">#</th>
                {currentSheet.headers.map((header, hIdx) => (
                  <th key={hIdx} className="p-2.5 font-semibold text-slate-300">
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
                    key={row.id}
                    ref={isTargetRow ? highlightRef : null}
                    className={`border-b border-slate-800/60 transition-colors ${
                      isTargetRow
                        ? "border-2 border-emerald-500/70 bg-emerald-950/30 text-slate-100 ring-2 ring-emerald-500/20"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="p-2.5 text-center font-mono text-slate-500">
                      {isTargetRow ? (
                        <span className="flex h-2 w-2 mx-auto rounded-full bg-emerald-400 animate-ping" />
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
                            isTargetRow ? "font-semibold text-emerald-200" : ""
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
// Sub-Renderer 3: Markdown Viewer
// -------------------------------------------------------------
function MarkdownDocumentRenderer({ document, activeCitation, highlightRef }) {
  const content = document.content || "";
  const lines = content.split("\n");

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl">
      <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-mono">
        {lines.map((line, idx) => {
          const isCited =
            activeCitation?.snippet &&
            line.includes(activeCitation.snippet.slice(0, 30));

          if (line.startsWith("# ")) {
            return (
              <h2 key={idx} className="text-base font-bold text-slate-100 pt-2 pb-1 border-b border-slate-800">
                {line.replace("# ", "")}
              </h2>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h3 key={idx} className="text-sm font-semibold text-indigo-300 pt-3">
                {line.replace("## ", "")}
              </h3>
            );
          }
          if (line.startsWith("```")) {
            return (
              <div key={idx} className="text-slate-500 text-[10px]">
                {line}
              </div>
            );
          }
          return (
            <p
              key={idx}
              ref={isCited ? highlightRef : null}
              className={`p-1.5 rounded transition ${
                isCited
                  ? "border border-purple-500 bg-purple-950/40 text-purple-200 font-semibold"
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
// Sub-Renderer 4: Word Doc (.docx) Viewer
// -------------------------------------------------------------
function DocxDocumentRenderer({ document, activeCitation, highlightRef }) {
  const sections = document.sectionsData || [];

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl space-y-6">
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-blue-300">
              {section.title}
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Page {section.page}
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            {section.paragraphs.map((p) => {
              const isCited =
                p.isHighlighted ||
                (activeCitation?.snippet &&
                  p.text.includes(activeCitation.snippet.slice(0, 30)));

              return (
                <div
                  key={p.id}
                  ref={isCited ? highlightRef : null}
                  className={`rounded-lg p-3 transition ${
                    isCited
                      ? "border-2 border-blue-500 bg-blue-950/40 text-slate-100 shadow-md ring-2 ring-blue-500/20"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  {isCited && (
                    <div className="mb-1 text-[10px] font-semibold text-blue-300">
                      ✦ CITED COMPLIANCE POLICY
                    </div>
                  )}
                  <p className={isCited ? "font-medium text-slate-100" : ""}>
                    {p.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
