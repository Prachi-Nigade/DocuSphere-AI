import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import CitationModal from "./components/CitationModal";
import { INITIAL_DOCUMENTS, INITIAL_MESSAGES } from "./data/initialData";

/**
 * Main Application Component - DocuSphere-AI
 * Renders the responsive split layout:
 * - Left Panel: Document Uploader & Indexed Files Library (Sidebar.jsx)
 * - Right Panel: RAG Conversation Interface (ChatWindow.jsx)
 */
export default function App() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle PDF file upload with progressive vectorization simulation
  const handleUploadDocument = (file) => {
    const newDocId = `doc-${Date.now()}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";

    const newDoc = {
      id: newDocId,
      name: file.name,
      size: fileSizeMB,
      pages: Math.floor(Math.random() * 20) + 10,
      uploadedAt: "Just now",
      status: "processing",
      progress: 30,
      chunksCount: 0,
      embeddingModel: "text-embedding-3-large",
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simulate backend vector indexing pipeline (Spring Boot / PgVector)
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === newDocId ? { ...d, progress: 75 } : d))
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
                chunksCount: Math.floor(Math.random() * 60) + 40,
              }
            : d
        )
      );
    }, 2400);
  };

  // Handle document deletion
  const handleDeleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Handle sending a user inquiry
  const handleSendMessage = (userText) => {
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

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    // Simulate Spring Boot RAG response with source citations
    setTimeout(() => {
      const activeDoc = documents.find((d) => d.status === "indexed") || {
        name: "Enterprise_Knowledge_Base.pdf",
      };

      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: `I analyzed your knowledge base regarding **"${userText}"**:\n\n### Semantic Extraction Results\n* **Primary Finding**: Relevant architectural controls and compliance mandates were retrieved across your indexed PDF corpus.\n* **Implementation Context**: The system applies automated vector scoring to ensure answer precision and minimize hallucinations.\n\n*Review the citation badges below to examine the verbatim extracted paragraphs.*`,
        citations: [
          {
            id: `cit-${Date.now()}`,
            docName: activeDoc.name,
            page: Math.floor(Math.random() * 15) + 3,
            similarity: 0.93,
            snippet: `Direct excerpt matching inquiry: "...All corresponding operational policies for '${userText}' mandate continuous monitoring and verification according to regulatory baseline ISO-27001..."`,
          },
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsGenerating(false);
    }, 1500);
  };

  // Reset chat session
  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGES[0]]);
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

      {/* Left Sidebar: Drag-and-drop PDF Uploader & Indexed Library */}
      <Sidebar
        documents={documents}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Right Panel: RAG Conversation Window */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        onResetChat={handleResetChat}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectCitation={(citation) => setSelectedCitation(citation)}
        isGenerating={isGenerating}
        indexedDocsCount={documents.filter((d) => d.status === "indexed").length}
      />

      {/* Citation Inspector Modal */}
      {selectedCitation && (
        <CitationModal
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
}
