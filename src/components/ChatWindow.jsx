import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Bookmark,
  Menu,
  ChevronRight,
  Shield,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Edit2,
  Download,
  UploadCloud,
  KeyRound,
  X,
  Share2,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
  formatCitationLocation,
} from "../utils/documentUtils";
import { useAuthRbac } from "../context/AuthRbacContext";
import { openWhatsAppShare } from "../utils/shareUtils";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.5 2 2.016 6.484 2.016 12.016c0 1.766.46 3.492 1.332 5.015L2 22l5.125-1.344A9.974 9.974 0 0012.031 22C17.562 22 22 17.531 22 12.016 22 6.484 17.547 2 12.031 2zm0 18.297c-1.547 0-3.063-.414-4.39-1.203l-.313-.188-3.266.86.875-3.188-.203-.328A8.257 8.257 0 013.75 12.016c0-4.563 3.719-8.281 8.281-8.281 4.547 0 8.266 3.719 8.266 8.281 0 4.563-3.719 8.281-8.266 8.281zm4.531-6.188c-.25-.125-1.469-.719-1.688-.813-.234-.094-.406-.14-.578.14-.172.266-.672.828-.828 1-.156.172-.313.187-.563.062-.25-.125-1.062-.39-2.016-1.234-.75-.672-1.25-1.5-1.39-1.75-.157-.25-.016-.39.109-.516.109-.109.25-.281.375-.422.125-.14.172-.234.25-.39.078-.172.047-.313-.016-.438-.078-.14-.578-1.406-.812-1.922-.219-.516-.438-.438-.61-.438-.156 0-.328-.016-.5-.016s-.453.063-.688.313c-.234.25-.906.875-.906 2.14 0 1.25.922 2.469 1.047 2.641.14.172 1.813 2.766 4.39 3.875.61.266 1.094.422 1.469.547.61.188 1.172.172 1.609.094.484-.078 1.469-.61 1.672-1.188.219-.594.219-1.094.156-1.203-.062-.125-.234-.188-.484-.313z" />
    </svg>
  );
}

/**
 * Helper to format assistant responses
 */
function FormattedMessageContent({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-xs md:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="mt-3 text-xs md:text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("* ") || line.startsWith("- ")) {
          const bulletContent = line.substring(2);
          return (
            <div
              key={idx}
              className="ml-3 flex items-start gap-2 text-slate-700 dark:text-slate-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500/80" />
              <span>{renderBoldAndCode(bulletContent)}</span>
            </div>
          );
        }
        return <p key={idx}>{renderBoldAndCode(line)}</p>;
      })}
    </div>
  );
}

function renderBoldAndCode(str) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * ChatWindow Component - DocuSphere-AI
 * User requirements applied:
 * - Header right side corner: ONLY shows three dots button
 * - In three dots menu: Export and Share options (plus viewer toggle & AI config)
 * - Chat section: prominent Upload Document option, downside as it is
 */
export default function ChatWindow({
  activeSession,
  onSendMessage,
  onCreateNewSession,
  onRenameSession,
  onOpenShareModal,
  onOpenExportModal,
  onToggleSidebar,
  onSelectCitation,
  isViewerOpen = false,
  onToggleViewer,
  isGenerating = false,
  indexedDocsCount = 0,
  activeDocument = null,
  documents = [],
  onSelectDocument,
  onUploadDocument,
  geminiApiKey = "",
  onUpdateApiKey,
}) {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || "");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Three dots dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { logAuditEvent } = useAuthRbac();

  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Click outside listener for three-dots menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    logAuditEvent("RAG_QUERY", "Document Inquiry", inputText.trim().slice(0, 48), "info");
    onSendMessage(inputText.trim());
    setInputText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyMessage = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim() && activeSession) {
      onRenameSession?.(activeSession.id, tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveApiKey = () => {
    onUpdateApiKey?.(apiKeyInput.trim());
    setIsApiKeyModalOpen(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadDocument?.(e.dataTransfer.files[0]);
    }
  };

  const activeDocTheme = activeDocument ? getFormatTheme(activeDocument.format) : null;

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-1 flex-col h-full overflow-hidden bg-slate-50/60 dark:bg-slate-950 min-w-0 transition-colors ${
        isDraggingOver ? "ring-4 ring-indigo-500/50 bg-indigo-50/20" : ""
      }`}
    >
      {/* File input for chat section document upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.md,.markdown,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUploadDocument?.(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {/* 1. HEADER TOOLBAR: CLEAN, ONLY THREE DOTS IN RIGHT CORNER */}
      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 px-4 md:px-6 backdrop-blur-md transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 md:hidden cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            {/* Thread Title with Inline Edit */}
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveTitle();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="rounded-lg border border-indigo-500 bg-white dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-900 dark:text-slate-100 outline-none font-bold"
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="rounded p-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group/title">
                  <h2
                    className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate max-w-[200px] md:max-w-md cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                    onClick={() => {
                      setTempTitle(activeSession?.title || "");
                      setIsEditingTitle(true);
                    }}
                    title="Click to rename thread"
                  >
                    {activeSession?.title || "Document Intelligence Workspace"}
                  </h2>
                  <button
                    onClick={() => {
                      setTempTitle(activeSession?.title || "");
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Rename thread"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Status Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time RAG
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
              <span>{messages.length} messages</span>
              <span>•</span>
              {activeDocument ? (
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                  Active: <strong className="font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[150px]">{activeDocument.name}</strong>
                </span>
              ) : (
                <span>{indexedDocsCount} uploaded documents</span>
              )}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT SIDE TOP CORNER: PROPER, CLEAN & WORKING THREE DOTS     */}
        {/* ------------------------------------------------------------- */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition shadow-xs cursor-pointer ${
              isMenuOpen
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="Options & Actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Three Dots Dropdown Menu: Clean, Clear & Fully Working */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-400/30 dark:shadow-black/80 backdrop-blur-xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Category Header */}
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Workspace Actions
                </span>
                <span className="text-[10px] font-mono text-indigo-500 font-bold">
                  DocuSphere
                </span>
              </div>

              {/* 1. Share Option */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenShareModal?.();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Share Insights
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    WhatsApp, socials & web link
                  </span>
                </div>
              </button>

              {/* 2. Export Option */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenExportModal?.();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Export Transcript
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    Download PDF, Markdown or JSON
                  </span>
                </div>
              </button>

              {/* 3. Document Split Viewer Option */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleViewer?.();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer group"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                  {isViewerOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {isViewerOpen ? "Close Document Viewer" : "Open Document Viewer"}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {isViewerOpen ? "Hide split-screen view" : "Inspect document citations"}
                  </span>
                </div>
              </button>

              {/* 4. AI Engine Configuration */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setApiKeyInput(geminiApiKey || "");
                  setIsApiKeyModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer group border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-1.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    AI Engine Setup
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    {geminiApiKey ? "Gemini 1.5/2.0 Key Active" : "Local RAG Active"}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MESSAGE HISTORY AREA                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Empty State Banner if no documents are uploaded yet */}
          {indexedDocsCount === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/30 dark:to-slate-900/40 p-6 md:p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Upload a Document to Begin
              </h3>
              <p className="mt-1.5 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                DocuSphere-AI directly parses and analyzes your real files in <strong>PDF, Word (.docx), Excel (.xlsx/.csv), Markdown, and Text (.txt)</strong>. Ask any question and receive verified answers with interactive citations.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Choose Document File</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Stream */}
          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex gap-3 md:gap-4 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/20">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[88%] md:max-w-[80%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl p-4 transition-shadow ${
                      isUser
                        ? "rounded-tr-none bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20"
                        : "rounded-tl-none border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 shadow-sm dark:shadow-lg dark:shadow-black/20"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                        {message.content}
                      </p>
                    ) : (
                      <div>
                        <FormattedMessageContent text={message.content} />

                        {/* Suggested Questions */}
                        {message.suggestedQueries &&
                          message.suggestedQueries.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-indigo-500" />
                                Recommended Inquiries:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestedQueries.map(
                                  (query, qIdx) => (
                                    <button
                                      key={qIdx}
                                      onClick={() => onSendMessage(query)}
                                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition text-left flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>{query}</span>
                                      <ChevronRight className="h-3 w-3 opacity-60" />
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Citations Badges */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                              <Bookmark className="h-3.5 w-3.5 text-indigo-500" />
                              <span>Verified Citations (Click to Inspect in Viewer)</span>
                              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {message.citations.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation) => {
                                const format =
                                  citation.format ||
                                  getFileFormat(citation.docName);
                                const theme = getFormatTheme(format);
                                const location =
                                  formatCitationLocation(citation);

                                return (
                                  <button
                                    key={citation.id}
                                    onClick={() => onSelectCitation(citation)}
                                    className={`group/badge inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition shadow-xs hover:scale-[1.02] active:scale-[0.98] ${theme.badgeBg} ${theme.badgeBorder} hover:border-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer`}
                                    title="Click to view & highlight in Side-by-Side Document Viewer"
                                  >
                                    {format === "excel" ? (
                                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : format === "code" ||
                                      format === "markdown" ? (
                                      <FileCode className="h-3.5 w-3.5 text-amber-500" />
                                    ) : (
                                      <FileText className={`h-3.5 w-3.5 ${theme.iconColor}`} />
                                    )}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                      {citation.docName}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                      {location}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Message Actions */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 text-xs text-slate-400">
                          <span className="text-[10px]">
                            {message.timestamp}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleCopyMessage(message.id, message.content)
                              }
                              className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Copy Answer"
                            >
                              {copiedId === message.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-[10px] text-emerald-500 font-semibold">
                                    Copied
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span className="text-[10px]">Copy</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => openWhatsAppShare(message.content)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition"
                              title="Share Answer to WhatsApp"
                            >
                              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
                              <span className="text-[10px]">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Real-time Typing / Inference Indicator */}
          {isGenerating && (
            <div className="flex gap-3 md:gap-4 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md animate-pulse">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>
                    Analyzing document semantic chunks & synthesizing verified answer...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CHAT INPUT SECTION WITH UPLOAD DOCUMENT OPTION             */}
      {/* ------------------------------------------------------------- */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 p-4 md:p-5 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-4xl">
          {/* Target Document & In-Chat Document Upload Bar */}
          <div className="mb-2.5 flex items-center justify-between px-1 gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 min-w-0">
              <span className="text-[11px] font-semibold text-slate-400">Target Document:</span>
              {activeDocument ? (
                <div className={`flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-medium text-xs border ${activeDocTheme?.badgeBg} ${activeDocTheme?.badgeBorder}`}>
                  <FileText className={`h-3 w-3 ${activeDocTheme?.iconColor}`} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {activeDocument.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-500">
                    {activeDocument.format}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No document selected</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* UPLOAD DOCUMENT OPTION IN CHAT SECTION */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition shadow-2xs cursor-pointer"
                title="Upload and ingest a new document (PDF, Word, Excel, Markdown)"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Upload Document</span>
              </button>

              {activeDocument && (
                <button
                  type="button"
                  onClick={onToggleViewer}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {isViewerOpen ? "Hide Viewer" : "Inspect Document →"}
                </button>
              )}
            </div>
          </div>

          {/* DOWNSIDE AS IT IS: INPUT TEXTAREA, SEND BUTTON, ENGINE NOTE */}
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-2 shadow-lg shadow-slate-200/50 dark:shadow-black/30 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  160
                )}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                activeDocument
                  ? `Ask anything about "${activeDocument.name}"...`
                  : "Ask any question or upload a document to get started..."
              }
              className="flex-1 max-h-36 resize-none bg-transparent px-3 py-2 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                !inputText.trim() || isGenerating
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              title="Send message (Enter)"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-indigo-500" />
              <span>
                {geminiApiKey
                  ? "Powered by Google Gemini RAG Intelligence"
                  : "Powered by High-Precision Semantic RAG Engine"}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span>Press</span>
              <kbd className="rounded bg-slate-200 dark:bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-700 dark:text-slate-300">
                Enter
              </kbd>
              <span>to send</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Engine / Gemini API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  AI Provider Configuration
                </h3>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                DocuSphere-AI works <strong>100% locally and offline</strong> using its built-in high-precision semantic RAG engine.
              </p>
              <p>
                Optionally, you can connect your <strong>Google Gemini API Key</strong> for enhanced multi-paragraph synthesis:
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Keys are stored safely in your local browser storage. Leave empty to use the built-in local engine.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setApiKeyInput("");
                  onUpdateApiKey?.("");
                  setIsApiKeyModalOpen(false);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Use Local Engine
              </button>
              <button
                onClick={handleSaveApiKey}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 text-xs font-semibold shadow-sm cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
