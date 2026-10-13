import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileText,
  Bookmark,
  ExternalLink,
  RotateCcw,
  Menu,
  ChevronRight,
  Shield,
  CornerDownLeft,
  Copy,
  Check,
} from "lucide-react";

/**
 * Lightweight helper to format assistant responses
 * containing headings, bold text, bullet points, and code fragments.
 */
function FormattedMessageContent({ text }) {
  if (!text) return null;

  // Split into paragraphs / lines
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading 3
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

        // Bullet points
        if (line.startsWith("* ") || line.startsWith("- ")) {
          const bulletContent = line.substring(2);
          return (
            <div key={idx} className="ml-3 flex items-start gap-2 text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/80" />
              <span>{renderBoldAndCode(bulletContent)}</span>
            </div>
          );
        }

        // Standard text
        return <p key={idx}>{renderBoldAndCode(line)}</p>;
      })}
    </div>
  );
}

// Helper to parse **bold** and `code` spans
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
 * Main conversation interface with message stream, citation badges,
 * and bottom input composer.
 */
export default function ChatWindow({
  messages = [],
  onSendMessage,
  onResetChat,
  onToggleSidebar,
  onSelectCitation,
  isGenerating = false,
  indexedDocsCount = 0,
}) {
  const [inputText, setInputText] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
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

  return (
    <main className="relative flex flex-1 flex-col h-full overflow-hidden bg-slate-950">
      {/* 1. Top Navbar / Chat Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 md:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
            title="Toggle Document Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
                DocuSphere Intelligence Hub
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                RAG Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Querying {indexedDocsCount} vectorized document
              {indexedDocsCount !== 1 ? "s" : ""} via Spring Boot & Pinecone
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onResetChat}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-100 transition"
            title="Reset Conversation"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </header>

      {/* 2. Chat Message Stream */}
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
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/15">
                    <Bot className="h-5 w-5" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`group relative max-w-[85%] md:max-w-[78%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  {/* Bubble Content */}
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

                        {/* Suggested Prompt Chips (if available) */}
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

                        {/* Source Citations Section */}
                        {message.citations && message.citations.length > 0 && (
                          <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                              <Bookmark className="h-3.5 w-3.5 text-indigo-400" />
                              <span>Verified Citations & Sources</span>
                              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono text-slate-400">
                                {message.citations.length}
                              </span>
                            </div>

                            {/* Rendered Badges */}
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation) => (
                                <button
                                  key={citation.id}
                                  onClick={() => onSelectCitation(citation)}
                                  className="group/badge inline-flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-950/30 px-3 py-1.5 text-xs text-indigo-200 hover:border-indigo-400 hover:bg-indigo-900/40 transition shadow-sm hover:shadow-indigo-900/20"
                                  title="Click to view raw retrieved chunk"
                                >
                                  <FileText className="h-3.5 w-3.5 text-indigo-400 group-hover/badge:text-indigo-300" />
                                  <span className="font-medium text-slate-200 max-w-[190px] truncate">
                                    Source: {citation.docName}
                                  </span>
                                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                                    Page {citation.page}
                                  </span>
                                  {citation.similarity && (
                                    <span className="text-[10px] text-emerald-400 font-mono">
                                      {Math.round(citation.similarity * 100)}%
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp & Copy Action */}
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

                {/* User Avatar */}
                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl bg-slate-800 text-slate-300 ring-1 ring-slate-700">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Assistant Generating State Indicator */}
          {isGenerating && (
            <div className="flex gap-3 md:gap-4 justify-start items-start animate-pulse">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-slate-900/80 px-4 py-3 text-slate-300 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>
                    Searching Pinecone vector database & synthesizing response...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. Input Text Box (Composer) */}
      <div className="border-t border-slate-800/80 bg-slate-900/60 p-4 md:p-5 backdrop-blur-md">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-2 shadow-xl shadow-black/30 transition focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/40"
          >
            {/* Textarea Input */}
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
              placeholder="Ask anything about your uploaded documents (e.g. 'Summarize Section 3.2 on Page 14')..."
              className="flex-1 max-h-36 resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />

            {/* Send Button */}
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

          {/* Micro Helper Text */}
          <div className="mt-2 flex items-center justify-between px-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-indigo-400" />
              <span>
                DocuSphere-AI retrieves citations exclusively from validated PDF
                chunks.
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
