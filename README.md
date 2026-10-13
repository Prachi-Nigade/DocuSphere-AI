# DocuSphere-AI

> **Enterprise RAG Document Assistant** with a Spring Boot backend and React.js / Tailwind CSS frontend.

DocuSphere-AI is an intelligent document inquiry platform that allows users to upload enterprise PDFs, automatically chunk and vectorize content, and perform conversational Q&A with verified, clickable page-level source citations.

---

## ✨ Features

- **📄 PDF Ingestion & Drag-and-Drop Dropzone**: Upload enterprise PDFs with real-time vectorization progress indicators.
- **🔍 Semantic Vector Search**: Chat with indexed knowledge bases with automated similarity matching and minimal hallucination.
- **🏷️ Verbatim Source Citations**: AI responses cite exact source documents and page numbers (e.g. `Source: manual.pdf - Page 14`), with clickable chunk inspection popovers.
- **⚡ Enterprise Dark Theme**: Polished design using Tailwind Slate neutrals and Indigo accents, designed for high clarity and accessibility.
- **📱 Responsive Split Layout**: Fixed/collapsible document management sidebar paired with an interactive message stream.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Inter & JetBrains Mono (Google Fonts)

### Backend (Architecture Target)
- **Framework**: [Spring Boot 3.x](https://spring.io/projects/spring-boot) / [Spring AI](https://spring.io/projects/spring-ai)
- **Vector Database**: Pinecone / PgVector
- **Document Ingestion**: Apache Tika / PDFBox

---

## 📂 Project Structure

```
DocuSphere-AI/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # PDF drag & drop uploader & indexed document library
│   │   ├── ChatWindow.jsx     # Chat conversation stream & bottom composer
│   │   └── CitationModal.jsx  # Raw chunk inspection modal
│   ├── data/
│   │   └── initialData.js     # Mock documents, embeddings, and conversation state
│   ├── App.jsx                # Responsive split layout & centralized state
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

## 🔗 Spring Boot API Integration Targets

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload & vectorize PDF document |
| `GET` | `/api/v1/documents` | List all indexed documents & chunk counts |
| `DELETE`| `/api/v1/documents/{id}` | Delete document and corresponding vector embeddings |
| `POST` | `/api/v1/chat/stream` | Stream RAG response tokens and citation metadata |
