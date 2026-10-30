import React, { useState } from "react";
import {
  FileText,
  Trash2,
  Sparkles,
  Eye,
  MessageSquare,
  Plus,
  Edit2,
  Check,
  X,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Clock,
  FolderOpen,
  FileCheck,
} from "lucide-react";
import {
  getFileFormat,
  getFormatTheme,
} from "../utils/documentUtils";
import { useAuthRbac } from "../context/AuthRbacContext";
import SettingsModal from "./SettingsModal";

/**
 * Sidebar Component - DocuSphere-AI
 * User requirements:
 * 1. Documents option: clicking it opens uploaded documents in Document Viewer
 * 2. Removed the upload documents option from the sidebar (upload is in the chat section)
 * 3. Chat history shown in "Recents" below the Documents option
 * 4. Settings (Profile, Dark Mode, Password) and Sign Out with User Name & Role
 */
export default function Sidebar({
  documents = [],
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateNewSession,
  onRenameSession,
  onDeleteSession,
  onSelectDocument,
  activeDocumentId,
  activeDocument,
  isOpen = true,
  onCloseMobile,
  onLogout,
}) {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { currentUser, currentRole, permissions } = useAuthRbac();

  // Inline rename handlers for chat threads
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

  const handleOpenDocumentsViewer = () => {
    if (documents.length > 0) {
      const targetDoc =
        documents.find((d) => d.id === activeDocumentId) ||
        activeDocument ||
        documents[0];
      onSelectDocument?.(targetDoc);
    }
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 md:w-84 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/70 p-4 shrink-0">
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Enterprise Document Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 md:hidden"
            title="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* New Chat Primary Action Button */}
          <div>
            <button
              onClick={onCreateNewSession}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ New Chat</span>
            </button>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 1. DOCUMENTS OPTION: CLICK OPENS UPLOADED DOCUMENTS IN VIEWER  */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2 px-1">
              {/* Clicking this Documents option directly opens the uploaded documents */}
              <button
                type="button"
                onClick={handleOpenDocumentsViewer}
                className="group flex items-center gap-2 text-left transition cursor-pointer"
                title="Click to open uploaded documents in Document Viewer"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <FolderOpen className="h-3.5 w-3.5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Documents
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 font-bold">
                  {documents.length}
                </span>
              </button>

              {documents.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenDocumentsViewer}
                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Open Viewer</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* List of documents uploaded on this platform */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-center">
                  <p className="text-xs text-slate-400 italic">
                    No documents uploaded yet.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Use &ldquo;Upload Document&rdquo; in the chat to add files.
                  </p>
                </div>
              ) : (
                documents.map((doc) => {
                  const format = doc.format || getFileFormat(doc.name);
                  const theme = getFormatTheme(format);
                  const isSelected = doc.id === activeDocumentId;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDocument?.(doc)}
                      className={`group rounded-xl border p-2.5 transition cursor-pointer ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                      title="Click to open this document in Document Viewer"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText
                            className={`h-4 w-4 shrink-0 ${theme.iconColor}`}
                          />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {doc.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-900">
                            {format}
                          </span>

                          {/* Quick View Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDocument?.(doc);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded transition"
                            title="Open in Document Viewer"
                          >
                            <Eye className="h-3 w-3" />
                          </button>

                          {/* Delete Document */}
                          {permissions.canDeleteDocuments && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteDocument?.(doc.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition opacity-0 group-hover:opacity-100"
                              title="Delete document"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                          Indexed
                        </span>
                        <span className="font-mono text-slate-400">
                          {doc.chunksCount || 0} chunks
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 2. RECENTS (CHAT HISTORY) IN BELOW OF DOCUMENTS OPTION         */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Recents</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {sessions.length} chats
              </span>
            </div>

            {/* Chat History List */}
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  No chat history yet.
                </p>
              ) : (
                sessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isEditing = editingSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`group relative flex items-center justify-between rounded-xl p-2 text-xs transition cursor-pointer border ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/80 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400"
                          }`}
                        />

                        {isEditing ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveRename(e, session.id);
                              if (e.key === "Escape") setEditingSessionId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border border-indigo-500 bg-white dark:bg-slate-900 px-1 py-0.5 text-xs text-slate-900 dark:text-slate-100 outline-none w-full font-normal"
                          />
                        ) : (
                          <span className="truncate">{session.title}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={(e) => saveRename(e, session.id)}
                            className="rounded p-1 text-emerald-500 hover:bg-emerald-50"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => startEditing(e, session)}
                            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Rename chat"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}

                        {permissions.canDeleteThreads && sessions.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete thread"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* 3. SETTINGS OPTION (PROFILE, DARK MODE, PASSWORD CHANGE)      */}
          {/* ------------------------------------------------------------- */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-300 transition cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <SettingsIcon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Settings
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
                    Profile, Dark Mode, Password
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. FOOTER: USER NAME & ROLE + SIGN OUT BUTTON                 */}
        {/* ------------------------------------------------------------- */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-slate-50/70 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUser.color} text-white font-bold text-xs shadow-xs`}
              >
                {currentUser.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                  {currentUser.name}
                </span>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${currentUser.badgeBg}`}
                >
                  {currentRole}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition shadow-2xs cursor-pointer shrink-0"
                title="Sign Out of DocuSphere-AI"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Settings Modal (Profile Settings, Dark Mode, Password Change) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
