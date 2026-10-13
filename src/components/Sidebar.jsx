import React, { useState, useRef } from "react";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Trash2,
  Search,
  Sparkles,
  Layers,
  Database,
  X,
  AlertCircle,
  FileCheck,
} from "lucide-react";

/**
 * Sidebar Component
 * Manages PDF drag-and-drop upload zone, document indexing progress,
 * and the scrollable list of vectorized knowledge base files.
 */
export default function Sidebar({
  documents = [],
  onUploadDocument,
  onDeleteDocument,
  isOpen = true,
  onCloseMobile,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    // reset input value so re-selecting same file triggers change
    e.target.value = "";
  };

  const handleFilesSelected = (fileList) => {
    Array.from(fileList).forEach((file) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onUploadDocument?.(file);
      } else {
        alert("Please upload standard PDF files (.pdf) for RAG vectorization.");
      }
    });
  };

  // Filter documents by user query
  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* 1. Header & Brand */}
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

        {/* Close button for mobile drawers */}
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 md:hidden"
          title="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 2. Drag-and-Drop PDF Upload Zone */}
      <div className="p-4 pb-2">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200 ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-lg shadow-indigo-500/10"
              : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div
            className={`mb-2.5 flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 ${
              isDragging
                ? "bg-indigo-500/20 text-indigo-300 scale-110"
                : "bg-slate-800/80 text-slate-400 group-hover:scale-105 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
            }`}
          >
            <UploadCloud className="h-5 w-5" />
          </div>

          <p className="text-xs font-medium text-slate-200">
            <span className="text-indigo-400 underline-offset-2 group-hover:underline">
              Click to upload
            </span>{" "}
            or drag & drop
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            PDF files up to 25MB • Auto-chunked & vectorized
          </p>
        </div>
      </div>

      {/* 3. Document Library Controls & Search */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between pb-2 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>Indexed Documents</span>
          </div>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
            {documents.length}
          </span>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search indexed files..."
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

      {/* 4. Scrollable Document List */}
      <div className="flex-1 overflow-y-auto px-4 py-1 space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 p-6 text-center">
            <FileText className="mb-2 h-8 w-8 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">
              {searchQuery ? "No matching documents" : "No documents indexed"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {searchQuery
                ? "Try a different search keyword"
                : "Drop your first PDF above to begin"}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group relative flex flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-3 transition-all duration-150 hover:border-slate-700 hover:bg-slate-800/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 overflow-hidden">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4
                      className="truncate text-xs font-medium text-slate-200 group-hover:text-indigo-200"
                      title={doc.name}
                    >
                      {doc.name}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.pages} pgs</span>
                      <span>•</span>
                      <span>{doc.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Delete document button */}
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

              {/* Status and Chunks Indicator */}
              <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 text-[11px]">
                {doc.status === "indexed" ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="font-medium">Indexed</span>
                  </div>
                ) : doc.status === "processing" ? (
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Vectorizing ({doc.progress || 60}%)...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="h-3 w-3" />
                    <span>Failed</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-slate-400">
                  <Layers className="h-3 w-3 text-slate-500" />
                  <span>{doc.chunksCount || 0} chunks</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Footer: System & Vector DB Status */}
      <div className="border-t border-slate-800/70 bg-slate-950/60 p-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Spring Boot RAG API</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v1.2.0</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[11px] text-slate-400 border border-slate-800/60">
          <span>Total Vector Embeddings</span>
          <span className="font-mono font-semibold text-indigo-300">
            {totalChunks} Chunks
          </span>
        </div>
      </div>
    </aside>
  );
}
