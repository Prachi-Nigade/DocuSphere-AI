import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import DocumentViewer from "./components/DocumentViewer/DocumentViewer";
import ShareModal from "./components/ShareModal";
import ExportModal from "./components/ExportModal";
import RbacModal from "./components/RbacModal";
import LoginPage from "./components/Auth/LoginPage";
import { INITIAL_DOCUMENTS } from "./data/initialData";
import { getFileFormat } from "./utils/documentUtils";
import { parseDocumentFile, formatFileSize } from "./utils/documentParser";
import { answerDocumentQuery } from "./utils/documentIntelligence";
import { useAuthRbac } from "./context/AuthRbacContext";
import {
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createNewSession,
} from "./utils/sessionManager";

/**
 * Main Application Component - DocuSphere-AI
 * Real multi-format document parser and question-answering intelligence engine.
 * Mock data completely removed.
 */
export default function App() {
  // 1. Persistent Documents State (Real Uploaded Files)
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("docusphere_documents_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any stale mock documents from previous runs
          const isMock = parsed.some(
            (d) =>
              d.name?.includes("Enterprise_Security_Whitepaper") ||
              d.name?.includes("Q3_Financial_Quarterly_Report") ||
              d.name?.includes("API_Architecture_Spec_v2")
          );
          if (!isMock) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load documents from storage", e);
    }
    return INITIAL_DOCUMENTS;
  });

  // 2. Chat Sessions State
  const [sessions, setSessions] = useState(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState(() =>
    loadActiveSessionId(sessions)
  );

  // 3. UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState(() => documents[0] || null);
  const [activeCitation, setActiveCitation] = useState(null);
  const [shareModalData, setShareModalData] = useState(null);
  const [exportModalSession, setExportModalSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 4. Optional Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    try {
      return localStorage.getItem("docusphere_gemini_api_key") || "";
    } catch {
      return "";
    }
  });

  const {
    isRbacModalOpen,
    setIsRbacModalOpen,
    permissions,
    logAuditEvent,
    isAuthenticated,
    logout,
  } = useAuthRbac();

  // Sync documents to localStorage (gracefully handling storage quota)
  useEffect(() => {
    try {
      localStorage.setItem("docusphere_documents_v2", JSON.stringify(documents));
    } catch (err) {
      console.warn("Storage quota exceeded or storage unavailable for documents", err);
    }
  }, [documents]);

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Sync active session ID to localStorage
  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Auto-sync active document when documents list changes
  useEffect(() => {
    if (activeDocument && !documents.some((d) => d.id === activeDocument.id)) {
      setActiveDocument(documents[0] || null);
    } else if (!activeDocument && documents.length > 0) {
      setActiveDocument(documents[0]);
    }
  }, [documents, activeDocument]);

  // Active session object
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // --------------------------------------------------------------------------
  // Session Handlers
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // Real Document Upload Handler (Multi-Format PDF, Excel, Word, Text)
  // --------------------------------------------------------------------------
  const handleUploadDocument = async (file) => {
    if (!permissions.canUploadDocuments) {
      alert("Document ingestion is restricted. You must have Editor or Admin role.");
      return;
    }

    const tempId = `doc-${Date.now()}`;
    const format = getFileFormat(file.name);
    const sizeStr = formatFileSize(file.size);

    logAuditEvent(
      "DOCUMENT_INGEST",
      file.name,
      `Analyzing & extracting ${format.toUpperCase()} (${sizeStr})`,
      "info"
    );

    // Initial placeholder item showing progress
    const tempDoc = {
      id: tempId,
      name: file.name,
      format: format,
      size: sizeStr,
      uploadedAt: "Just now",
      status: "processing",
      progress: 20,
      chunksCount: 0,
      embeddingModel: "semantic-rag-v2",
    };

    setDocuments((prev) => [tempDoc, ...prev]);

    try {
      // Real document parsing across PDF, Excel, Word, Text
      const parsedDoc = await parseDocumentFile(file, (progress) => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === tempId ? { ...d, progress } : d))
        );
      });

      // Replace placeholder with fully parsed document
      setDocuments((prev) =>
        prev.map((d) => (d.id === tempId ? parsedDoc : d))
      );
      setActiveDocument(parsedDoc);
      setIsViewerOpen(true);

      logAuditEvent(
        "DOCUMENT_INDEXED",
        file.name,
        `Indexed ${parsedDoc.chunksCount} semantic chunks for ${format.toUpperCase()}`,
        "info"
      );

      // Auto-post confirmation message to active chat thread with dynamic suggested questions
      const unitsDescription = parsedDoc.pages
        ? `${parsedDoc.pages} pages`
        : parsedDoc.sheetsCount
        ? `${parsedDoc.sheetsCount} sheets (${parsedDoc.rowsCount || 0} rows)`
        : `${parsedDoc.sectionsCount || 1} sections`;

      const welcomeMsg = {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: `I've analyzed and indexed **${parsedDoc.name}** (${parsedDoc.format?.toUpperCase()}, ${parsedDoc.size}).\n\n* **Extracted**: ${unitsDescription}\n* **Semantic Chunks**: **${parsedDoc.chunksCount} chunks** indexed and ready for question answering.\n\nYou can now ask any question specific to this document!`,
        citations: [],
        suggestedQueries: parsedDoc.suggestedQuestions || [
          `Summarize the key points in ${parsedDoc.name}`,
          "What are the main topics and conclusions?",
        ],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession?.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, welcomeMsg],
              }
            : s
        )
      );
    } catch (err) {
      console.error("Failed to parse document:", err);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === tempId ? { ...d, status: "failed", progress: 0 } : d
        )
      );
      alert(`Failed to parse ${file.name}: ${err.message}`);
    }
  };

  // --------------------------------------------------------------------------
  // Document Deletion Handler (Admin Only)
  // --------------------------------------------------------------------------
  const handleDeleteDocument = (docId) => {
    if (!permissions.canDeleteDocuments) {
      alert("Document deletion is restricted. Only Admins can permanently purge vector documents.");
      return;
    }

    const docToDelete = documents.find((d) => d.id === docId);
    logAuditEvent(
      "DOCUMENT_PURGE",
      docToDelete?.name || docId,
      `Permanently deleted document and vector chunks from store`,
      "security"
    );

    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    if (activeDocument?.id === docId) {
      const remaining = documents.filter((d) => d.id !== docId);
      setActiveDocument(remaining[0] || null);
      if (remaining.length === 0) {
        setIsViewerOpen(false);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Select Document for Viewer
  // --------------------------------------------------------------------------
  const handleSelectDocument = (doc) => {
    logAuditEvent(
      "DOCUMENT_VIEW",
      doc.name,
      `Opened in Side-by-Side viewer (${doc.format?.toUpperCase()})`,
      "info"
    );
    setActiveDocument(doc);
    setActiveCitation(null);
    setIsViewerOpen(true);
  };

  // --------------------------------------------------------------------------
  // Select Citation Handler (Launches Viewer & Focuses Highlight)
  // --------------------------------------------------------------------------
  const handleSelectCitation = (citation) => {
    setActiveCitation(citation);

    // Look up doc by ID or name
    const matchedDoc = documents.find(
      (d) =>
        (citation.docId && d.id === citation.docId) ||
        d.name === citation.docName
    );

    if (matchedDoc) {
      setActiveDocument(matchedDoc);
      setIsViewerOpen(true);
    }
  };

  // --------------------------------------------------------------------------
  // Real Question Answering Handler (Grounded in Uploaded Documents)
  // --------------------------------------------------------------------------
  const handleSendMessage = async (userText) => {
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

    // Update session title automatically if this is the first user query
    const updatedTitle =
      activeSession.title === "New Knowledge Inquiry" ||
      activeSession.title === "Document Intelligence Workspace" ||
      activeSession.messages.length <= 1
        ? userText.slice(0, 36) + (userText.length > 36 ? "..." : "")
        : activeSession.title;

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

    try {
      // Real grounded question answering across uploaded document(s)
      const ragResult = await answerDocumentQuery({
        query: userText,
        documents: documents,
        activeDocumentId: activeDocument?.id,
        geminiApiKey: geminiApiKey,
      });

      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: ragResult.content,
        citations: ragResult.citations || [],
        suggestedQueries: ragResult.suggestedQueries || [],
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
    } catch (err) {
      console.error("Error analyzing document query:", err);
      const errorMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: `An error occurred while analyzing the document: ${err.message}. Please verify the document has finished indexing.`,
        citations: [],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, errorMsg],
              }
            : s
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateApiKey = (key) => {
    setGeminiApiKey(key);
    try {
      if (key && key.trim()) {
        localStorage.setItem("docusphere_gemini_api_key", key.trim());
      } else {
        localStorage.removeItem("docusphere_gemini_api_key");
      }
    } catch {}
  };

  // If user is not authenticated, render the starting LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 1. Left Sidebar: Sessions / Threads & Knowledge Base Documents */}
      <Sidebar
        documents={documents}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateNewSession={handleCreateNewSession}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
        onShareSession={(s) => setShareModalData({ session: s })}
        onShareDocument={(doc) => setShareModalData({ document: doc })}
        onExportSession={(s) => setExportModalSession(s)}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onSelectDocument={handleSelectDocument}
        activeDocumentId={activeDocument?.id}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onLogout={logout}
      />

      {/* 2. Center Panel: Conversational Document Intelligence Window */}
      <ChatWindow
        activeSession={activeSession}
        onSendMessage={handleSendMessage}
        onCreateNewSession={handleCreateNewSession}
        onRenameSession={handleRenameSession}
        onOpenShareModal={() => setShareModalData({ session: activeSession })}
        onOpenExportModal={() => setExportModalSession(activeSession)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectCitation={handleSelectCitation}
        isViewerOpen={isViewerOpen}
        onToggleViewer={() => setIsViewerOpen(!isViewerOpen)}
        isGenerating={isGenerating}
        indexedDocsCount={
          documents.filter((d) => d.status === "indexed").length
        }
        activeDocument={activeDocument}
        documents={documents}
        onSelectDocument={handleSelectDocument}
        onUploadDocument={handleUploadDocument}
        geminiApiKey={geminiApiKey}
        onUpdateApiKey={handleUpdateApiKey}
        onLogout={logout}
      />

      {/* 3. Right Panel: Interactive Multi-Format Document Viewer */}
      {isViewerOpen && (
        <DocumentViewer
          document={activeDocument}
          activeCitation={activeCitation}
          onClose={() => setIsViewerOpen(false)}
          onShareDocument={(doc) => setShareModalData({ document: doc })}
        />
      )}

      {/* 4. Share Insights & Document Modal (WhatsApp, Socials & Links) */}
      {shareModalData && (
        <ShareModal
          session={shareModalData.session}
          document={shareModalData.document}
          onClose={() => setShareModalData(null)}
        />
      )}

      {/* 5. Export Conversation Modal */}
      {exportModalSession && (
        <ExportModal
          session={exportModalSession}
          onClose={() => setExportModalSession(null)}
        />
      )}

      {/* 6. RBAC Management & Audit Matrix Modal */}
      <RbacModal
        isOpen={isRbacModalOpen}
        onClose={() => setIsRbacModalOpen(false)}
      />
    </div>
  );
}
