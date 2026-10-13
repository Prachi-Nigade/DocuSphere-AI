import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Bookmark,
  RotateCcw,
  Menu,
  ChevronRight,
  Shield,
  Copy,
  Check,
  FileSpreadsheet,
  FileCode,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
  Share2,
  Plus,
  Edit2,
  Download,
} from "lucide-react";
import {

  getFileFormat,
  getFormatTheme,
  formatCitationLocation,
} from "../utils/documentUtils";

/**
 * Helper to format assistant responses
 */
function FormattedMessageContent({ text }) {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="mt-3 text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("* ") || line.startsWith("- ")) {
          const bulletContent = line.substring(2);
          return (
            <div key={idx} className="ml-3 flex items-start gap-2 text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/80" />
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
        <strong key={i} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * ChatWindow Component
 * Conversation interface with persistent session controls:
 * - Thread title inline rename
 * - Share modal launcher
 * - Export dropdown menu (Markdown, JSON, Print/PDF)
 * - Format-aware citation badges linked to the Side-by-Side Viewer
 */
export default function ChatWindow({
  activeSession,
  onSendMessage,
  onResetChat,
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
}) {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = activeSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isGenerating) return;

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

  return (
    <main className="relative flex flex-1 flex-col h-full overflow-hidden bg-slate-950 min-w-0">
      {/* 1. Header Toolbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 md:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
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
                    className="rounded border border-indigo-500 bg-slate-900 px-2 py-0.5 text-xs text-slate-100 outline-none font-semibold"
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="rounded p-1 text-emerald-400 hover:bg-slate-800"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group/title">
                  <h2
                    className="text-sm font-semibold text-slate-100 tracking-tight truncate max-w-[260px] md:max-w-md cursor-pointer hover:text-indigo-300 transition"
                    onClick={() => {
                      setTempTitle(activeSession?.title || "");
                      setIsEditingTitle(true);
                    }}
                    title="Click to rename thread"
                  >
                    {activeSession?.title || "DocuSphere Intelligence Hub"}
                  </h2>
                  <button
                    onClick={() => {
                      setTempTitle(activeSession?.title || "");
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5 text-slate-500 hover:text-slate-300"
                    title="Rename thread"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Persistent RAG
              </span>
            </div>

            <p className="text-xs text-slate-400 truncate">
              {messages.length} messages • Querying {indexedDocsCount} multi-format documents
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Share Insights Button */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/30 hover:text-indigo-200 transition"
            title="Share Insights & Summary with Team"
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Export Button (Launches Clear Export Modal) */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/30 hover:text-indigo-200 transition"
            title="Export Conversation Transcript & Evidence"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Export</span>
          </button>


          {/* New Chat Button */}
          <button
            onClick={onCreateNewSession}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Create New Chat Thread"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>New Thread</span>
          </button>

          {/* Toggle Side-by-Side Document Viewer */}
          <button
            onClick={onToggleViewer}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              isViewerOpen
                ? "border-indigo-500/60 bg-indigo-500/20 text-indigo-300"
                : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800"
            }`}
            title="Toggle Side-by-Side Document Viewer"
          >
            {isViewerOpen ? (
              <>
                <PanelRightClose className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden md:inline">Close Viewer</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden md:inline">Split Viewer</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="mx-auto max-w-4xl space-y-6">
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
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/15">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] md:max-w-[78%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl p-4 transition-shadow ${
                      isUser
                        ? "rounded-tr-none bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/40"
                        : "rounded-tl-none border border-slate-800/90 bg-slate-900/90 text-slate-200 shadow-lg shadow-black/20"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal">
                        {message.content}
                      </p>
                    ) : (
                      <div>
                        <FormattedMessageContent text={message.content} />

                        {/* Suggested Questions */}
                        {message.suggestedQueries &&
                          message.suggestedQueries.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-800/80">
                              <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-indigo-400" />
                                Recommended Inquiries:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggestedQueries.map(
                                  (query, qIdx) => (
                                    <button
                                      key={qIdx}
                                      onClick={() => onSendMessage(query)}
                                      className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200 transition text-left flex items-center gap-1.5"
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
                          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                              <Bookmark className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Verified Citations (Click to Inspect in Viewer)</span>
                              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
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
                                    className={`group/badge inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98] ${theme.badgeBg} ${theme.badgeBorder} hover:border-indigo-400 hover:bg-slate-800/80`}
                                    title="Click to view & highlight in Side-by-Side Document Viewer"
                                  >
                                    {format === "excel" ? (
                                      <FileSpreadsheet
                                        className={`h-3.5 w-3.5 ${theme.iconColor}`}
                                      />
                                    ) : format === "markdown" ? (
                                      <FileCode
                                        className={`h-3.5 w-3.5 ${theme.iconColor}`}
                                      />
                                    ) : (
                                      <FileText
                                        className={`h-3.5 w-3.5 ${theme.iconColor}`}
                                      />
                                    )}

                                    <span className="font-medium text-slate-200 max-w-[170px] truncate">
                                      {citation.docName}
                                    </span>

                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${theme.pillBg} ${theme.badgeText}`}
                                    >
                                      {location}
                                    </span>

                                    {citation.similarity && (
                                      <span className="text-[10px] text-emerald-400 font-mono">
                                        {Math.round(citation.similarity * 100)}%
                                      </span>
                                    )}

                                    <ExternalLink className="h-3 w-3 text-slate-500 group-hover/badge:text-slate-300" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Copy */}
                  <div
                    className={`mt-1.5 flex items-center gap-2 px-1 text-[11px] text-slate-500 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{message.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() =>
                          handleCopyMessage(message.id, message.content)
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-300 flex items-center gap-1"
                        title="Copy answer"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-slate-800 text-slate-300 ring-1 ring-slate-700">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex gap-3 md:gap-4 justify-start items-start animate-pulse">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>
                    Searching multi-format vector embeddings & generating citations...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input Text Box */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 md:p-5 backdrop-blur-md">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-2 shadow-xl shadow-black/30 transition focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40"
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
              placeholder="Ask anything across your PDFs, Excel sheets, Word docs, or Markdown files..."
              className="flex-1 max-h-36 resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                !inputText.trim() || isGenerating
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-105 active:scale-95"
              }`}
              title="Send message (Enter)"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-indigo-400" />
              <span>
                Saved automatically to persistent session storage.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <span>Press</span>
              <kbd className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[10px] text-slate-400">
                Enter ↵
              </kbd>
              <span>to send</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
