# DocuSphere-AI

> **Enterprise Multi-Format RAG Document Assistant** with a Spring Boot backend and React.js / Tailwind CSS frontend.

DocuSphere-AI is an intelligent document inquiry platform that allows users to upload enterprise documents across multiple formats (**PDF, Word DOCX, Excel Spreadsheets, Markdown, and Plain Text**), automatically chunk and vectorize content, perform conversational Q&A with an **Interactive Side-by-Side Document Viewer**, and manage **persistent chat sessions with team export & sharing capabilities**.

---

## ✨ Features

- **💬 Persistent Chat Sessions & History**:
  - Save, organize, rename, and delete conversation threads stored persistently in `localStorage` and ready for PostgreSQL backend sync.
  - Quick "+ New Thread" launcher with automatic intelligent thread naming.
- **📤 Export & Team Insights Sharing**:
  - **Markdown (.md)**: Complete transcript with consolidated evidence and citations table.
  - **Structured JSON (.json)**: Machine-readable payload for enterprise pipelines.
  - **Print / PDF Executive Report**: Clean executive briefing ready for printing or PDF export.
  - **Slack / Teams Snippets**: One-click formatted briefing snippets for instant team distribution.
  - **Direct Snapshot Links**: Shareable read-only links for team collaboration.
- **📂 Multi-Format Ingestion**: Upload enterprise files in PDF (`.pdf`), Word (`.docx`), Excel spreadsheets (`.xlsx`, `.csv`), Markdown (`.md`), and Text (`.txt`) with format-specific indexing tags.
- **🖥️ Interactive Side-by-Side Document Viewer**: 
  - Launches alongside the chat window when any citation badge is clicked.
  - Automatically scrolls to and highlights the cited page and paragraph (PDF / Word) or active spreadsheet sheet and row (Excel).
  - Zoom controls, quick jump button, and similarity match indicators.
- **🔍 Multi-Format Semantic RAG**: Queries knowledge bases across heterogenous documents simultaneously, providing format-aware source citation pills.
- **⚡ Enterprise Dark Theme**: Polished design using Tailwind Slate neutrals and Indigo accents with format-specific color codes (Rose for PDF, Emerald for Excel, Blue for Word, Purple for Markdown).
- **📱 3-Pane Adaptive Split Layout**: Collapsible document sidebar, conversation stream, and side-by-side document viewer.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Inter & JetBrains Mono (Google Fonts)

### Backend (Architecture Target)
- **Framework**: [Spring Boot 3.x](https://spring.io/projects/spring-boot) / [Spring AI](https://spring.io/projects/spring-ai)
- **Document Extractors**:
  - Apache PDFBox / Tika for PDFs
  - Apache POI (`XWPFDocument`) for Word `.docx`
  - Apache POI (`XSSFWorkbook`) for Excel `.xlsx` / `.csv`
  - Commonmark / TextReader for Markdown `.md`
- **Vector Database**: PostgreSQL + `pgvector` / Pinecone
- **Relational Storage**: PostgreSQL (Sessions, Messages, Citations)

---

## 📂 Project Structure

```
DocuSphere-AI/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Dual-tab sidebar: [Chat Threads] & [Knowledge Base]
│   │   ├── ChatWindow.jsx     # Chat conversation stream & session toolbar
│   │   ├── ExportMenu.jsx     # Dropdown export menu (Markdown, JSON, PDF, Slack)
│   │   ├── ShareModal.jsx     # Team share modal with link generator & previews
│   │   └── DocumentViewer/
│   │       └── DocumentViewer.jsx # Interactive side-by-side viewer with auto-scroll & highlights
│   ├── utils/
│   │   ├── sessionManager.js  # Persistent session storage, export generators & sharing
│   │   └── documentUtils.js   # Multi-format detection, color themes & badge helpers
│   ├── data/
│   │   └── initialData.js     # Mock multi-thread sessions, documents & citations
│   ├── App.jsx                # 3-Pane responsive split layout & centralized state
│   ├── index.css              # Tailwind CSS directives & custom scrollbars
│   └── main.jsx               # React DOM entry point
├── index.html                 # HTML template with Google Fonts
├── vite.config.js             # Vite configuration with Tailwind CSS plugin
└── package.json               # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm** or **pnpm** / **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔗 Spring Boot API Specification

### Document Management
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload & vectorize multi-format files (PDF, DOCX, XLSX, MD) |
| `GET` | `/api/v1/documents` | List all indexed documents, formats & chunk counts |
| `GET` | `/api/v1/documents/{id}/content` | Fetch raw document content/pages for the Side-by-Side Viewer |
| `DELETE`| `/api/v1/documents/{id}` | Delete document and corresponding vector embeddings |

### Chat & Sessions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sessions` | Fetch all saved conversation sessions |
| `POST` | `/api/v1/sessions` | Create a new conversation session |
| `GET` | `/api/v1/sessions/{id}` | Get session details and message transcript |
| `PUT` | `/api/v1/sessions/{id}` | Rename or update session metadata |
| `DELETE`| `/api/v1/sessions/{id}` | Delete a conversation thread |
| `POST` | `/api/v1/chat/stream` | Stream RAG response tokens with citation coordinates |
| `GET` | `/api/v1/sessions/{id}/export?format={md|json|summary}` | Server-side export generation |
