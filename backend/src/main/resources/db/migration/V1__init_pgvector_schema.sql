-- DocuSphere-AI: PostgreSQL + pgvector Initial Schema

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Documents table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    format VARCHAR(32) NOT NULL,
    size VARCHAR(32),
    pages INT,
    sheets_count INT,
    rows_count INT,
    sections_count INT,
    status VARCHAR(32) NOT NULL DEFAULT 'indexed',
    chunks_count INT DEFAULT 0,
    embedding_model VARCHAR(64) DEFAULT 'text-embedding-3-large',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Document chunks table with 1536-dimensional vector embedding
CREATE TABLE IF NOT EXISTS document_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT,
    paragraph_id VARCHAR(64),
    sheet_name VARCHAR(128),
    row_id VARCHAR(64),
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast Approximate Nearest Neighbor (ANN) Index using HNSW and Cosine distance
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);

-- 4. Chat Threads table
CREATE TABLE IF NOT EXISTS chat_threads (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    timestamp_text VARCHAR(64),
    suggested_queries TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);

-- 6. Citations table
CREATE TABLE IF NOT EXISTS citations (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    doc_id VARCHAR(64),
    doc_name VARCHAR(255),
    doc_format VARCHAR(32),
    page_number INT,
    paragraph_id VARCHAR(64),
    sheet_name VARCHAR(128),
    row_id VARCHAR(64),
    snippet TEXT,
    similarity_score DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_citations_message_id ON citations(message_id);
