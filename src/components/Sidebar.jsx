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
  FileSpreadsheet,
  FileCode,
  Eye,
  MessageSquare,
  Plus,
  Edit2,
  Check,
  Share2,
  Download,
  Sun,
  Moon,
  Lock,
  Shield,
  LogOut,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
  SUPPORTED_EXTENSIONS,
} from "../utils/documentUtils";
import { useTheme } from "../context/ThemeContext";
import { useAuthRbac } from "../context/AuthRbacContext";
import RoleSelector from "./RoleSelector";

/**
 * Sidebar Component - DocuSphere-AI
 * Supports dual views:
 * 1. "Knowledge Base" (Multi-format PDF, Word, Excel, Markdown uploader & index)
 * 2. "Chat Threads" (Persistent session storage, thread history, rename, delete & new chat)
 * Fully styled for Clean White (Light) and Dark themes with direct WhatsApp/social share triggers.
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
  onShareDocument,
  activeDocumentId,
  isOpen = true,
  onCloseMobile,
  onLogout,
}) {
  const [activeSidebarTab, setActiveSidebarTab] = useState("threads"); // "threads" | "documents"
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("all");
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const fileInputRef = useRef(null);

  const { toggleTheme, isDark } = useTheme();
  const { currentRole, permissions, openRbacModal } = useAuthRbac();

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
      className={`fixed inset-y-0 left-0 z-40 flex w-80 md:w-88 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 1. Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-md shadow-indigo-600/25 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base">
                DocuSphere
              </span>
              <span className="rounded bg-indigo-500/15 dark:bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enterprise RAG Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Theme Toggle in Header */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition"
            title={`Switch to ${isDark ? "Light (White)" : "Dark"} Theme`}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </button>

          {/* RBAC Security & Matrix Trigger */}
          <button
            onClick={() => openRbacModal("matrix")}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            title="View Role-Based Access Control (RBAC) & Governance"
          >
            <Shield className="h-4.5 w-4.5 text-indigo-500" />
          </button>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 md:hidden"
            title="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 2. Top Segmented Navigation: [Chat Threads] vs [Documents] */}
      <div className="p-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950/80 p-1 border border-slate-200 dark:border-slate-800/70">
          <button
            onClick={() => {
              setActiveSidebarTab("threads");
              setSearchQuery("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeSidebarTab === "threads"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Threads</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeSidebarTab === "threads"
                  ? "bg-indigo-700/90 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition ${
              activeSidebarTab === "documents"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Documents</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                activeSidebarTab === "documents"
                  ? "bg-indigo-700/90 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={
              activeSidebarTab === "threads"
                ? "Search saved threads..."
                : "Search documents & files..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-1.5 pl-8 pr-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] transition mb-3"
          >
            <Plus className="h-4 w-4" />
            <span>New Chat Thread</span>
          </button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 p-6 text-center">
                <MessageSquare className="mb-2 h-7 w-7 text-slate-400 dark:text-slate-600" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
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
                        ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 shadow-sm ring-1 ring-indigo-500/30"
                        : "border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30"
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
                            className="flex-1 rounded border border-indigo-500 bg-white dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                          />
                          <button
                            onClick={(e) => saveRename(e, s.id)}
                            className="rounded p-1 text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h4
                          className={`text-xs font-semibold truncate flex-1 ${
                            isActive
                              ? "text-indigo-950 dark:text-indigo-200"
                              : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-200"
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
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300"
                            title="Export transcript"
                          >
                            <Download className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onShareSession?.(s);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#25D366]"
                            title="Share via WhatsApp & Socials"
                          >
                            <Share2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => startEditing(e, s)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Rename thread"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          {sessions.length > 1 && permissions.canDeleteThreads && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession?.(s.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
                              title="Delete thread"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preview message */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {s.preview || s.messages[s.messages.length - 1]?.content}
                    </p>

                    {/* Footer metadata */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-mono">
                      <span>{new Date(s.updatedAt || s.createdAt).toLocaleDateString()}</span>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-slate-600 dark:text-slate-400 font-medium">
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

      {/* 5. TAB CONTENT: DOCUMENTS VIEW (CLEAN & CLEAR UI/UX) */}
      {activeSidebarTab === "documents" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Multi-Format Upload Zone (RBAC Protected) */}
          <div className="p-3 pb-2">
            {permissions.canUploadDocuments ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3.5 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-lg shadow-indigo-500/10"
                    : "border-slate-300 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:border-slate-700 dark:hover:bg-slate-800/30"
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
                      ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 scale-110"
                      : "bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 group-hover:scale-105 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }`}
                >
                  <UploadCloud className="h-4.5 w-4.5" />
                </div>

                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span className="text-indigo-600 dark:text-indigo-400 underline-offset-2 group-hover:underline">
                    Click to upload
                  </span>{" "}
                  or drag & drop
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  PDF, Word (.docx), Excel (.xlsx/.csv), Markdown & Text
                </p>
              </div>
            ) : (
              <div
                onClick={() => openRbacModal("matrix")}
                className="group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 text-center hover:border-amber-400 transition"
                title="Document ingestion restricted by RBAC role. Click to view permissions."
              >
                <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Ingestion Locked</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {currentRole}
                  </span>
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  Requires Editor or Admin role to ingest documents
                </p>
                <span className="mt-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  Switch Role / View Matrix →
                </span>
              </div>
            )}
          </div>

          {/* Format Filter Tabs */}
          <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto text-[11px]">
            {[
              { id: "all", label: "All Docs" },
              { id: "pdf", label: "PDF" },
              { id: "excel", label: "Excel" },
              { id: "docx", label: "Word" },
              { id: "markdown", label: "Markdown" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFormatFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 text-[10px] ${
                  selectedFormatFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document Cards List with Clean & Clear Design */}
          <div className="flex-1 overflow-y-auto px-3 space-y-2">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 p-6 text-center">
                <FileText className="mb-2 h-7 w-7 text-slate-400 dark:text-slate-600" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {searchQuery ? "No matching documents" : "No documents indexed"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Drop your files above to vectorize & inspect
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
                    className={`group relative flex flex-col gap-1.5 rounded-xl border p-3 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 shadow-md ring-1 ring-indigo-500/30"
                        : "border-slate-200 dark:border-slate-800/70 bg-white dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${theme.badgeBg} ${theme.iconColor} ring-1 ${theme.badgeBorder}`}
                        >
                          {format === "excel" ? (
                            <FileSpreadsheet className="h-4 w-4" />
                          ) : format === "markdown" ? (
                            <FileCode className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4
                            className="truncate text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-200"
                            title={doc.name}
                          >
                            {doc.name}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${theme.badgeBg} ${theme.badgeText}`}
                            >
                              {theme.label}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{doc.size}</span>
                            {doc.pages && (
                              <>
                                <span>•</span>
                                <span>{doc.pages}p</span>
                              </>
                            )}
                            {doc.sheetsCount && (
                              <>
                                <span>•</span>
                                <span>{doc.sheetsCount} sheets</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Share via WhatsApp & Socials */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShareDocument?.(doc);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-[#25D366]/15 hover:text-[#25D366] transition"
                          title="Share Document via WhatsApp & Socials"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Inspect in Viewer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDocument?.(doc);
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                          title="Inspect in Document Viewer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete document (Admin Only) */}
                        {permissions.canDeleteDocuments && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument?.(doc.id);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer"
                            title="Purge from vector store (Admin only)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-1.5 text-[10px]">
                      {doc.status === "indexed" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                          </span>
                          <span>Indexed & Vectorized</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          <span>Vectorizing...</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                        <Layers className="h-3 w-3 text-slate-400" />
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

      {/* Active User Role Persona Card & Logout */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-white/80 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-2">
          <RoleSelector compact={false} />
          {onLogout && (
            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition shadow-xs cursor-pointer shrink-0"
              title="Sign Out of DocuSphere-AI"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 6. Footer: System Status & Theme Selector */}
      <div className="border-t border-slate-200 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-950/60 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700 dark:text-slate-400">
              Multi-Doc RAG Ingestion
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.1</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-white dark:bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 shadow-xs">
          <span>Active Semantic Store</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
            {totalChunks} Chunks
          </span>
        </div>
      </div>
    </aside>
  );
}
