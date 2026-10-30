/**
 * DocuSphere-AI Backend API Client
 * Connects React frontend (http://localhost:5173) to Spring Boot Backend (http://localhost:8080)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

/**
 * Health check verifying Spring Boot & PostgreSQL pgvector status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend health check unreachable:", err.message);
    return { status: "DOWN", error: err.message };
  }
}

/**
 * Send chat query to Spring Boot RAG service
 */
export async function sendChatQuery({ threadId, query, documentIds = [], topK = 4 }) {
  const res = await fetch(`${API_BASE_URL}/chat/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ threadId, query, documentIds, topK }),
  });
  if (!res.ok) throw new Error(`Failed to send chat query: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch all chat threads from PostgreSQL
 */
export async function getThreads() {
  const res = await fetch(`${API_BASE_URL}/threads`);
  if (!res.ok) throw new Error(`Failed to fetch threads: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch thread with messages & citations
 */
export async function getThreadById(threadId) {
  const res = await fetch(`${API_BASE_URL}/threads/${threadId}`);
  if (!res.ok) throw new Error(`Failed to fetch thread ${threadId}: ${res.statusText}`);
  return await res.json();
}

/**
 * Create a new conversation thread
 */
export async function createThread(title = "New Knowledge Inquiry") {
  const res = await fetch(`${API_BASE_URL}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to create thread: ${res.statusText}`);
  return await res.json();
}

/**
 * Rename/update thread title
 */
export async function updateThreadTitle(threadId, title) {
  const res = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to update thread: ${res.statusText}`);
  return await res.json();
}

/**
 * Delete a thread
 */
export async function deleteThread(threadId) {
  const res = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete thread: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch indexed documents
 */
export async function getDocuments() {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error(`Failed to fetch documents: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch document chunking / ingestion status
 */
export async function getDocumentStatus(docId) {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}/status`);
  if (!res.ok) throw new Error(`Failed to fetch document status: ${res.statusText}`);
  return await res.json();
}

/**
 * Upload enterprise document to Spring Boot backend
 */
export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload document: ${res.statusText}`);
  return await res.json();
}

/**
 * Delete a document and its vector chunks
 */
export async function deleteDocument(docId) {
  const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete document: ${res.statusText}`);
  return await res.json();
}
