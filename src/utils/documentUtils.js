/**
 * Utility functions for multi-format document handling
 */

export const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".md",
  ".markdown",
  ".txt",
];

export function getFileFormat(filename = "") {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "pdf";
    case ".doc":
    case ".docx":
      return "docx";
    case ".xls":
    case ".xlsx":
    case ".csv":
      return "excel";
    case ".md":
    case ".markdown":
      return "markdown";
    case ".txt":
      return "text";
    default:
      return "other";
  }
}

export function getFormatTheme(format) {
  switch (format) {
    case "pdf":
      return {
        label: "PDF",
        badgeBg: "bg-rose-500/15",
        badgeText: "text-rose-400",
        badgeBorder: "border-rose-500/30",
        iconColor: "text-rose-400",
        pillBg: "bg-rose-500/10",
        accent: "rose",
      };
    case "docx":
      return {
        label: "Word",
        badgeBg: "bg-blue-500/15",
        badgeText: "text-blue-400",
        badgeBorder: "border-blue-500/30",
        iconColor: "text-blue-400",
        pillBg: "bg-blue-500/10",
        accent: "blue",
      };
    case "excel":
      return {
        label: "Excel",
        badgeBg: "bg-emerald-500/15",
        badgeText: "text-emerald-400",
        badgeBorder: "border-emerald-500/30",
        iconColor: "text-emerald-400",
        pillBg: "bg-emerald-500/10",
        accent: "emerald",
      };
    case "markdown":
      return {
        label: "Markdown",
        badgeBg: "bg-purple-500/15",
        badgeText: "text-purple-400",
        badgeBorder: "border-purple-500/30",
        iconColor: "text-purple-400",
        pillBg: "bg-purple-500/10",
        accent: "purple",
      };
    case "text":
      return {
        label: "Text",
        badgeBg: "bg-amber-500/15",
        badgeText: "text-amber-400",
        badgeBorder: "border-amber-500/30",
        iconColor: "text-amber-400",
        pillBg: "bg-amber-500/10",
        accent: "amber",
      };
    default:
      return {
        label: "Doc",
        badgeBg: "bg-slate-500/15",
        badgeText: "text-slate-400",
        badgeBorder: "border-slate-500/30",
        iconColor: "text-slate-400",
        pillBg: "bg-slate-500/10",
        accent: "slate",
      };
  }
}

export function formatCitationLocation(citation) {
  if (!citation) return "";
  if (citation.page) return `Page ${citation.page}`;
  if (citation.sheet && citation.row) return `${citation.sheet} • Row ${citation.row}`;
  if (citation.sheet) return `Sheet: ${citation.sheet}`;
  if (citation.section) return `Sec: ${citation.section}`;
  if (citation.line) return `Line ${citation.line}`;
  return "Section 1";
}
