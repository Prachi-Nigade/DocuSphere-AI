import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  Loader2,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Database,
  X,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  Eye,
  MessageSquare,
  Plus,
  Edit2,
  Check,
  Share2,
  Download,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
  SUPPORTED_EXTENSIONS,
} from "../utils/documentUtils";

/**
 * Sidebar Component
 * Supports dual views:
 * 1. "Knowledge Base" (Multi-format PDF, Word, Excel, Markdown uploader & index)
 * 2. "Chat Threads" (Persistent session storage, thread history, rename, delete & new chat)
 */
export default function Sidebar({
  documents = [],
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onRenameSession,
  onDeleteSession,
  onShareSession,
  onExportSession,
  onUploadDocument,
  onDeleteDocument,
  onSelectDocument,
  activeDocumentId,
  isOpen = true,
  onCloseMobile,
}) {
  const [activeSidebarTab, setActiveSidebarTab] = useState("threads"); // "threads" | "documents"
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("all");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const fileInputRef = useRef(null);

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
    e.target.value = "";
  };

  const handleFilesSelected = (fileList) => {
    Array.from(fileList).forEach((file) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        onUploadDocument?.(file);
      } else {
        alert(
          `Unsupported file format: ${ext}. Please upload PDF, Word (.docx), Excel (.xlsx/.csv), Markdown (.md), or Text files.`
        );
      }
    });
  };

  // Inline rename handlers
  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const saveRename = (e, sessionId) => {
    e?.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession?.(sessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const docFormat = doc.format || getFileFormat(doc.name);
    const matchesFormat =
      selectedFormatFilter === "all" || docFormat === selectedFormatFilter;
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  // Filter sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalChunks = documents.reduce(
    (acc, doc) => acc + (doc.chunksCount || 0),
    0
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-80 md:w-88 flex-col border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 1. Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-100 tracking-tight text-base">
                DocuSphere
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise RAG Assistant</p>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
          title="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Top Segmented Navigation: [Chat Threads] vs [Knowledge Base] */}
      <div className="p-3 pb-2 border-b border-slate-800/60">
        <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800/70">
          <button
            onClick={() => {
              setActiveSidebarTab("threads");
              setSearchQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium transition ${
              activeSidebarTab === "threads"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Threads</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeSidebarTab === "threads"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {sessions.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSidebarTab("documents");
              setSearchQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-medium transition ${
              activeSidebarTab === "documents"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Documents</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                activeSidebarTab === "documents"
                  ? "bg-indigo-700/80 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {documents.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="px-3 pt-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeSidebarTab === "threads"
                ? "Search saved threads..."
                : "Search indexed files..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. TAB CONTENT: THREADS VIEW */}
      {activeSidebarTab === "threads" && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 pt-2">
          {/* Create New Chat Button */}
          <button
            onClick={onCreateNewSession}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-950/50 hover:from-indigo-500 hover:to-indigo-600 transition mb-3"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat Thread</span>
          </button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 p-6 text-center">
                <MessageSquare className="mb-2 h-7 w-7 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">
                  {searchQuery ? "No matching threads" : "No saved threads yet"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Start a new inquiry to save insights
                </p>
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const isEditing = editingSessionId === s.id;

                return (
                  <div
                    key={s.id}
                    onClick={() => onSelectSession?.(s.id)}
                    className={`group relative flex flex-col gap-1.5 rounded-xl border p-3 cursor-pointer transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-950/30 shadow-md ring-1 ring-indigo-500/40"
                        : "border-slate-800/70 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(e, s.id);
                              if (e.key === "Escape") setEditingSessionId(null);
                            }}
                            autoFocus
                            className="flex-1 rounded border border-indigo-500 bg-slate-900 px-2 py-0.5 text-xs text-slate-100 outline-none"
                          />
                          <button
                            onClick={(e) => saveRename(e, s.id)}
                            className="rounded p-1 text-emerald-400 hover:bg-slate-800"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h4
                          className={`text-xs font-medium truncate flex-1 ${
                            isActive
                              ? "text-indigo-200 font-semibold"
                              : "text-slate-200 group-hover:text-indigo-200"
                          }`}
                          title={s.title}
                        >
                          {s.title}
                        </h4>
                      )}

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onExportSession?.(s);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-indigo-300"
                            title="Export thread transcript & evidence"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareSession?.(s);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-indigo-300"
                            title="Share thread insights"
                          >
                            <Share2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => startEditing(e, s)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            title="Rename thread"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          {sessions.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession?.(s.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                              title="Delete thread"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview message */}
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {s.preview || s.messages[s.messages.length - 1]?.content}
                    </p>

                    {/* Footer metadata */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(s.updatedAt || s.createdAt).toLocaleDateString()}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-slate-400">
                        {s.messages.length} msgs
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: DOCUMENTS VIEW */}
      {activeSidebarTab === "documents" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Multi-Format Upload Zone */}
          <div className="p-3 pb-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3.5 text-center transition-all duration-200 ${
                isDragging
                  ? "border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-lg shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.md,.txt"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 ${
                  isDragging
                    ? "bg-indigo-500/20 text-indigo-300 scale-110"
                    : "bg-slate-800/80 text-slate-400 group-hover:scale-105 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                }`}
              >
                <UploadCloud className="h-4.5 w-4.5" />
              </div>

              <p className="text-xs font-medium text-slate-200">
                <span className="text-indigo-400 underline-offset-2 group-hover:underline">
                  Click to upload
                </span>{" "}
                or drag & drop
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                PDF, Word, Excel, CSV, MD & TXT (up to 25MB)
              </p>
            </div>
          </div>

          {/* Format Filter Tabs */}
          <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto text-[11px]">
            {[
              { id: "all", label: "All" },
              { id: "pdf", label: "PDF" },
              { id: "excel", label: "Excel" },
              { id: "docx", label: "Word" },
              { id: "markdown", label: "MD" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFormatFilter(tab.id)}
                className={`rounded-lg px-2 py-0.5 font-medium transition shrink-0 ${
                  selectedFormatFilter === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 p-6 text-center">
                <FileText className="mb-2 h-7 w-7 text-slate-600" />
                <p className="text-xs font-medium text-slate-400">
                  {searchQuery ? "No matching documents" : "No documents indexed"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Drop your files above to vectorize
                </p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const format = doc.format || getFileFormat(doc.name);
                const theme = getFormatTheme(format);
                const isSelected = activeDocumentId === doc.id;

                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument?.(doc)}
                    className={`group relative flex flex-col gap-1.5 rounded-xl border p-2.5 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-indigo-500/80 bg-indigo-950/20 shadow-md ring-1 ring-indigo-500/30"
                        : "border-slate-800/70 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 overflow-hidden">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${theme.badgeBg} ${theme.iconColor} ring-1 ${theme.badgeBorder}`}
                        >
                          {format === "excel" ? (
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                          ) : format === "markdown" ? (
                            <FileCode className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4
                            className="truncate text-xs font-medium text-slate-200 group-hover:text-indigo-200"
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span
                              className={`rounded px-1 py-0.2 text-[9px] font-semibold uppercase ${theme.badgeBg} ${theme.badgeText}`}
                            >
                              {theme.label}
                            </span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDocument?.(doc);
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300"
                          title="Inspect in Document Viewer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument?.(doc.id);
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-1 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
                          title="Remove from vector index"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/50 pt-1.5 text-[10px]">
                      {doc.status === "indexed" ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                          </span>
                          <span>Indexed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-indigo-400">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          <span>Vectorizing...</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-400">
                        <Layers className="h-3 w-3 text-slate-500" />
                        <span>{doc.chunksCount || 0} chunks</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. Footer: System Status */}
      <div className="border-t border-slate-800/70 bg-slate-950/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Spring Boot Multi-Doc API</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">v2.1.0</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400 border border-slate-800/60">
          <span>Active Vector Index</span>
          <span className="font-mono font-semibold text-indigo-300">
            {totalChunks} Chunks
          </span>
        </div>
      </div>
    </aside>
  );
}
