import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  ExternalLink,
  Sparkles,
  Bookmark,
  Check,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
  formatCitationLocation,
} from "../utils/documentUtils";

/**
 * CitationBadge Component
 * Displays a format-aware citation badge with an interactive hover tooltip
 * and keyboard-accessible inspection in the Side-by-Side Document Viewer.
 */
export default function CitationBadge({ citation, onSelectCitation }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const badgeRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  const format = citation.format || getFileFormat(citation.docName);
  const theme = getFormatTheme(format);
  const location = formatCitationLocation(citation);

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 8,
        left: Math.max(16, rect.left + rect.width / 2),
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
    onSelectCitation?.(citation);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
    if (e.key === "Escape") {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <button
        ref={badgeRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onKeyDown={handleKeyDown}
        aria-haspopup="dialog"
        aria-expanded={showTooltip}
        aria-label={`Source citation from ${citation.docName}, ${location}. Click to open document viewer.`}
        className={`group/badge relative inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 shadow-xs hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-hidden ${theme.badgeBg} ${theme.badgeBorder} hover:border-indigo-400 hover:bg-slate-800/90 text-slate-200`}
      >
        {/* Format Icon */}
        {format === "excel" ? (
          <FileSpreadsheet
            className={`h-3.5 w-3.5 ${theme.iconColor} shrink-0`}
            aria-hidden="true"
          />
        ) : format === "markdown" ? (
          <FileCode
            className={`h-3.5 w-3.5 ${theme.iconColor} shrink-0`}
            aria-hidden="true"
          />
        ) : (
          <FileText
            className={`h-3.5 w-3.5 ${theme.iconColor} shrink-0`}
            aria-hidden="true"
          />
        )}

        {/* Truncated File Name */}
        <span className="font-medium text-slate-100 max-w-[160px] sm:max-w-[200px] truncate">
          {citation.docName}
        </span>

        {/* Location Tag */}
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${theme.pillBg} ${theme.badgeText} border border-white/5`}
        >
          {location}
        </span>

        {/* Similarity Score */}
        {citation.similarity && (
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
            {Math.round(citation.similarity * 100)}%
          </span>
        )}

        <ExternalLink
          className="h-3 w-3 text-slate-400 group-hover/badge:text-slate-200 transition-colors"
          aria-hidden="true"
        />
      </button>

      {/* Hover Preview Tooltip Popover */}
      {showTooltip && (
        <div
          role="tooltip"
          onMouseEnter={() => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className="fixed z-50 w-80 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl animate-fade-in pointer-events-auto"
          style={{
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
              >
                {theme.label}
              </span>
              <span className="font-semibold text-xs text-slate-100 truncate max-w-[160px]">
                {citation.docName}
              </span>
            </div>

            {citation.similarity && (
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300 border border-emerald-500/20">
                {Math.round(citation.similarity * 100)}% Match
              </span>
            )}
          </div>

          {/* Location & Chunk Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-2 font-mono">
            <span className="text-indigo-300 font-semibold">{location}</span>
            <span>•</span>
            <span className="text-slate-400">pgvector Chunk</span>
          </div>

          {/* Verbatim Excerpt Snippet */}
          <div className="relative rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 text-[11px] leading-relaxed text-slate-300 font-sans italic line-clamp-3">
            "{citation.snippet || "Verified chunk excerpt from document index."}"
          </div>

          {/* Action Hint */}
          <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-indigo-300">
              <Sparkles className="h-3 w-3" />
              <span>Click to inspect full document</span>
            </span>
            <span className="font-mono text-slate-400">Press Enter ↵</span>
          </div>

          {/* Tooltip Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
