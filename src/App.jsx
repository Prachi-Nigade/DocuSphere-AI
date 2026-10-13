import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import DocumentViewer from "./components/DocumentViewer/DocumentViewer";
import ShareModal from "./components/ShareModal";
import ExportModal from "./components/ExportModal";
import { INITIAL_DOCUMENTS } from "./data/initialData";
import { getFileFormat } from "./utils/documentUtils";
import {
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createNewSession,
} from "./utils/sessionManager";

/**
 * Main Application Component - DocuSphere-AI
 * Renders the 3-pane layout with persistent session management:
 * 1. Sidebar: Switch between Chat Threads & Knowledge Base documents
 * 2. ChatWindow: Conversation stream with session renaming, Export & Share modals
 * 3. DocumentViewer: Interactive side-by-side multi-format viewer with auto-scroll & highlights
 */
export default function App() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(() =>
    loadActiveSessionId(sessions)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(INITIAL_DOCUMENTS[0]);
  const [activeCitation, setActiveCitation] = useState(null);
  const [shareModalSession, setShareModalSession] = useState(null);
  const [exportModalSession, setExportModalSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync sessions to localStorage whenever sessions change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Active session object
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // 1. Session Management Handlers
  const handleCreateNewSession = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setActiveCitation(null);
  };

  const handleRenameSession = (sessionId, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  };

  const handleDeleteSession = (sessionId) => {
    const remaining = sessions.filter((s) => s.id !== sessionId);
    if (remaining.length === 0) {
      const fallback = createNewSession();
      setSessions([fallback]);
      setActiveSessionId(fallback.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // 2. Document Upload Handler (Multi-Format)
  const handleUploadDocument = (file) => {
    const newDocId = `doc-${Date.now()}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const format = getFileFormat(file.name);

    const newDoc = {
      id: newDocId,
      name: file.name,
      format: format,
      size: fileSizeMB,
      pages:
        format === "pdf" || format === "docx"
          ? Math.floor(Math.random() * 20) + 10
          : undefined,
      sheetsCount: format === "excel" ? 3 : undefined,
      sectionsCount: format === "markdown" ? 12 : undefined,
      uploadedAt: "Just now",
      status: "processing",
      progress: 35,
      chunksCount: 0,
      embeddingModel: "text-embedding-3-large",
      pagesData:
        format === "pdf"
          ? [
              {
                pageNumber: 1,
                paragraphs: [
                  {
                    id: "p-new-1",
                    text: `Sample extracted content from uploaded document: ${file.name}. Parsed via Spring Boot multi-format ingestion pipeline.`,
                    isHighlighted: true,
                  },
                ],
              },
            ]
          : undefined,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simulate backend vectorization
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDocId ? { ...d, progress: 80 } : d))
      );
    }, 1200);

    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === newDocId
            ? {
                ...d,
                status: "indexed",
                progress: 100,
                chunksCount: Math.floor(Math.random() * 50) + 35,
              }
            : d
        )
      );
    }, 2400);
  };

  // 3. Document Deletion Handler
  const handleDeleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocument?.id === docId) {
      setActiveDocument(null);
      setIsViewerOpen(false);
    }
  };

  // 4. Select Document for Viewer
  const handleSelectDocument = (doc) => {
    setActiveDocument(doc);
    setActiveCitation(null);
    setIsViewerOpen(true);
  };

  // 5. Select Citation Handler (Launches Viewer & Auto-scrolls)
  const handleSelectCitation = (citation) => {
    setActiveCitation(citation);

    const matchedDoc = documents.find((d) => d.name === citation.docName) || {
      id: `doc-ext-${Date.now()}`,
      name: citation.docName,
      format: citation.format || getFileFormat(citation.docName),
      size: "2.4 MB",
      pagesData: [
        {
          pageNumber: citation.page || 1,
          paragraphs: [
            {
              id: "p-cited",
              text: citation.snippet,
              isHighlighted: true,
            },
          ],
        },
      ],
    };

    setActiveDocument(matchedDoc);
    setIsViewerOpen(true);
  };

  // 6. Send Message Handler (Persists to Active Session)
  const handleSendMessage = (userText) => {
    if (!activeSession) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: userText,
      citations: [],
    };

    // Update session title automatically if this is the first question
    const updatedTitle =
      activeSession.title === "New Knowledge Inquiry" ||
      activeSession.messages.length <= 1
        ? userText.slice(0, 36) + (userText.length > 36 ? "..." : "")
        : activeSession.title;

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              preview: userText,
              messages: [...s.messages, userMsg],
            }
          : s
      )
    );

    setIsGenerating(true);

    // Simulate RAG generation with format-specific citations
    setTimeout(() => {
      const isExcelQuery =
        userText.toLowerCase().includes("revenue") ||
        userText.toLowerCase().includes("margin") ||
        userText.toLowerCase().includes("financial");

      const isMarkdownQuery =
        userText.toLowerCase().includes("rate limit") ||
        userText.toLowerCase().includes("api") ||
        userText.toLowerCase().includes("spec");

      let assistantContent = "";
      let citationsList = [];

      if (isExcelQuery) {
        const excelDoc =
          documents.find((d) => d.format === "excel") || documents[1];
        assistantContent = `Synthesized data from the financial spreadsheet **"${excelDoc.name}"**:\n\n### Revenue Metrics\n* **Gross Performance**: Recorded **$21.4M** for Q3-2024.\n* **Operational Margin**: Reached **46.2%**.\n\n*Click the citation badge below to inspect the highlighted row in the spreadsheet grid.*`;
        citationsList = [
          {
            id: `cit-${Date.now()}`,
            docName: excelDoc.name,
            format: "excel",
            sheet: "Revenue & Margins",
            row: 3,
            similarity: 0.96,
            snippet:
              "Q3-2024: Revenue $21.4M, Gross Profit $15.6M, Operating Margin 46.2%",
          },
        ];
      } else if (isMarkdownQuery) {
        const mdDoc =
          documents.find((d) => d.format === "markdown") || documents[2];
        assistantContent = `Retrieved parameters from **"${mdDoc.name}"**:\n\n### Rate Limiting Policy\n* **Algorithm**: Token bucket algorithm.\n* **Capacity**: 100 requests per tenant, 20 tokens refill rate.\n\n*Click the citation badge below to view the markdown specification.*`;
        citationsList = [
          {
            id: `cit-${Date.now()}`,
            docName: mdDoc.name,
            format: "markdown",
            section: "Rate Limiting & Throttling",
            similarity: 0.94,
            snippet:
              "All API requests to /api/v1/chat are governed by a token-bucket algorithm capped at 100 requests...",
          },
        ];
      } else {
        const pdfDoc =
          documents.find((d) => d.format === "pdf") || documents[0];
        assistantContent = `Cross-referencing verified policies in **"${pdfDoc.name}"**:\n\n### Document Findings\n* **Security Baseline**: Encryption standards mandate **AES-256-GCM** for data at rest and **TLS 1.3** for data in transit.\n* **Key Rotation**: 90-day automated HSM rotation cycles.\n\n*Click the citation badge to jump to Page 14 and view the highlighted paragraph.*`;
        citationsList = [
          {
            id: `cit-${Date.now()}`,
            docName: pdfDoc.name,
            format: "pdf",
            page: 14,
            similarity: 0.94,
            snippet:
              "Section 4.2 - Storage Cryptography: All relational databases, blob storage buckets, and semantic vector stores mandate AES-256-GCM envelope encryption...",
          },
        ];
      }

      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: assistantContent,
        citations: citationsList,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, assistantMsg],
              }
            : s
        )
      );

      setIsGenerating(false);
    }, 1400);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 1. Left Sidebar: Sessions / Threads & Knowledge Base */}
      <Sidebar
        documents={documents}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onShareSession={(s) => setShareModalSession(s)}
        onExportSession={(s) => setExportModalSession(s)}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onSelectDocument={handleSelectDocument}
        activeDocumentId={activeDocument?.id}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* 2. Center Panel: Conversational RAG Window */}
      <ChatWindow
        activeSession={activeSession}
        onSendMessage={handleSendMessage}
        onCreateNewSession={handleCreateNewSession}
        onRenameSession={handleRenameSession}
        onOpenShareModal={() => setShareModalSession(activeSession)}
        onOpenExportModal={() => setExportModalSession(activeSession)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectCitation={handleSelectCitation}
        isViewerOpen={isViewerOpen}
        onToggleViewer={() => setIsViewerOpen(!isViewerOpen)}
        isGenerating={isGenerating}
        indexedDocsCount={
          documents.filter((d) => d.status === "indexed").length
        }
      />

      {/* 3. Right Panel: Interactive Side-by-Side Document Viewer */}
      {isViewerOpen && (
        <DocumentViewer
          document={activeDocument}
          activeCitation={activeCitation}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      {/* 4. Share Insights Modal */}
      {shareModalSession && (
        <ShareModal
          session={shareModalSession}
          onClose={() => setShareModalSession(null)}
        />
      )}

      {/* 5. Export Conversation Modal */}
      {exportModalSession && (
        <ExportModal
          session={exportModalSession}
          onClose={() => setExportModalSession(null)}
        />
      )}
    </div>
  );
}
