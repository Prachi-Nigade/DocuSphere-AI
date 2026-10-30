/**
 * DocuSphere-AI Initial Data Configuration
 * Mock documents and mock conversation history removed.
 * Clean, production-ready workspace for real document uploads.
 */

export const INITIAL_DOCUMENTS = [];

export const INITIAL_SESSIONS = [
  {
    id: "session-1",
    title: "Document Intelligence Workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preview: "Upload any PDF, Word, Excel, or Text document to get started...",
    messages: [
      {
        id: "msg-init-1",
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content:
          "Welcome to **DocuSphere-AI**! 🚀\n\nI am your intelligent multi-format document assistant. You can upload documents in:\n* **PDF** (`.pdf`) - Contracts, whitepapers, manuals, research papers\n* **Excel & Spreadsheets** (`.xlsx`, `.xls`, `.csv`) - Financial sheets, ledgers, data grids\n* **Word** (`.docx`, `.doc`) - Policies, compliance briefs, executive reports\n* **Text & Markdown** (`.txt`, `.md`, `.json`) - Architecture specs, notes, code\n\n### Getting Started\n1. Click **\"Click to upload or drag & drop\"** in the sidebar to ingest your document.\n2. Once parsed, ask any question regarding that specific document.\n3. Click any **Citation Badge** on my responses to inspect the verified passage in the **Interactive Document Viewer**!",
        citations: [],
        suggestedQueries: [
          "Upload a PDF or Word document",
          "Upload an Excel financial sheet",
          "What file formats can DocuSphere-AI parse?",
        ],
      },
    ],
  },
];

export const INITIAL_MESSAGES = INITIAL_SESSIONS[0].messages;
