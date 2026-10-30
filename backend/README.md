# DocuSphere-AI Backend Architecture

> **High-Performance Spring Boot 3.3.x + PostgreSQL pgvector RAG Backend**

DocuSphere-AI Backend delivers enterprise multi-format document indexing, vector similarity search with PostgreSQL `pgvector`, persistent thread orchestration, and RESTful APIs tailored for the React frontend.

---

## 🏛️ Layered Architecture Overview

```
com.docusphere.backend/
├── config/                  # Global CORS policies, PgVectorConverter, JPA mappings
├── controller/              # REST Endpoints (/health, /chat, /documents, /threads)
├── dto/                     # Strongly-typed Request and Response Transfer Objects
├── entity/                  # JPA Entities (Document, DocumentChunk, ChatThread, ChatMessage, Citation)
├── exception/               # GlobalExceptionHandler, ResourceNotFoundException
├── repository/              # Spring Data JPA + native pgvector cosine search queries (<=>)
└── service/                 # Business logic, embedding vectors, text chunking & RAG synthesis
```

---

## ⚙️ Prerequisites & Environment

- **Java**: JDK 17 or JDK 21+
- **Build Tool**: Apache Maven 3.8+ (or Maven Wrapper)
- **Database**: PostgreSQL 15+ with the `pgvector` extension enabled.

---

## 🚀 Quickstart Guide

### 1. Start PostgreSQL with pgvector via Docker (Recommended)

From the `backend/` directory:

```bash
docker-compose up -d
```

This spins up PostgreSQL 16 on port `5432` with the `vector` extension and pre-loaded schema.

Alternatively, for local PostgreSQL installations:
```sql
CREATE DATABASE docusphere;
\c docusphere;
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Configure Database Connection

Default values in `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:docusphere}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:password}
```

Override via environment variables if desired:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=docusphere
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
```

### 3. Run the Spring Boot Backend

```bash
mvn clean spring-boot:run
```

The server starts on `http://localhost:8080`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check verifying PostgreSQL & pgvector status |
| `POST` | `/api/v1/chat/query` | RAG query returning grounded assistant message & citations |
| `GET` | `/api/v1/threads` | List all chat conversation sessions |
| `GET` | `/api/v1/threads/{id}` | Get specific thread with all messages & citations |
| `POST` | `/api/v1/threads` | Create a new conversation thread |
| `PUT` | `/api/v1/threads/{id}` | Rename or update thread title |
| `DELETE` | `/api/v1/threads/{id}` | Delete a thread and all child messages |
| `GET` | `/api/v1/documents` | List indexed knowledge base documents |
| `GET` | `/api/v1/documents/{id}/status` | Check document chunking and ingestion status |
| `POST` | `/api/v1/documents/upload` | Multipart file upload (PDF, DOCX, XLSX, MD, TXT) |
| `DELETE` | `/api/v1/documents/{id}` | Delete document and remove all vector chunks |

---

## 🧪 Testing with cURL

### 1. Verify Health
```bash
curl -i http://localhost:8080/api/v1/health
```

### 2. Query Chat RAG
```bash
curl -i -X POST http://localhost:8080/api/v1/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "session-1",
    "query": "What encryption standards are enforced for storage?",
    "topK": 3
  }'
```

### 3. Upload a Document
```bash
curl -i -X POST http://localhost:8080/api/v1/documents/upload \
  -F "file=@sample.pdf"
```
