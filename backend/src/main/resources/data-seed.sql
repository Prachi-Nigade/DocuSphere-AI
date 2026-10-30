-- Seed initial documents matching frontend state
INSERT INTO documents (id, name, format, size, pages, sheets_count, rows_count, sections_count, status, chunks_count, embedding_model)
VALUES 
  ('doc-1', 'Enterprise_Security_Whitepaper_2024.pdf', 'pdf', '4.2 MB', 48, NULL, NULL, NULL, 'indexed', 142, 'text-embedding-3-large'),
  ('doc-2', 'Q3_Financial_Quarterly_Report.xlsx', 'excel', '2.1 MB', NULL, 3, 240, NULL, 'indexed', 94, 'text-embedding-3-large'),
  ('doc-3', 'API_Architecture_Spec_v2.md', 'markdown', '860 KB', NULL, NULL, NULL, 16, 'indexed', 110, 'text-embedding-3-large'),
  ('doc-4', 'Employee_Handbook_Compliance.docx', 'docx', '3.8 MB', 32, NULL, NULL, NULL, 'indexed', 164, 'text-embedding-3-large')
ON CONFLICT (id) DO NOTHING;

-- Seed default initial chat thread
INSERT INTO chat_threads (id, title, preview, created_at, updated_at)
VALUES 
  ('session-1', 'Security & Encryption Whitepaper Review', 'What encryption standards and key management policies are enforced...', NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- Seed initial messages
INSERT INTO chat_messages (id, thread_id, sender, content, timestamp_text, suggested_queries, created_at)
VALUES 
  ('msg-1-1', 'session-1', 'assistant', 'Hello! I am your **DocuSphere-AI** multi-format document assistant powered by Spring Boot & pgvector.\n\nClick any citation badge to launch the **Interactive Document Viewer** and inspect the highlighted passage!', '11:20 AM', '["What are the encryption standards for data at rest?","What are our transport security and TLS cipher requirements?","Summarize the key rotation policies in Section 4.2"]', NOW() - INTERVAL '10 minutes'),
  ('msg-1-2', 'session-1', 'user', 'What encryption standards and key management policies are enforced for data at rest and data in transit according to our security whitepaper?', '11:21 AM', NULL, NOW() - INTERVAL '9 minutes'),
  ('msg-1-3', 'session-1', 'assistant', 'Based on the **Enterprise Security Whitepaper 2024**, here are the cryptographic standards and key management policies enforced across our architecture:\n\n### 1. Data at Rest Encryption\n* **Algorithm**: All persistent databases, object stores, and vector embedding indices utilize **AES-256-GCM** encryption.\n* **Key Rotation**: Cryptographic keys are managed via hardware security modules (HSM) with automated 90-day rotation intervals.\n\n### 2. Data in Transit Encryption\n* **Transport Protocol**: Mandatory enforcement of **TLS 1.3** across all public endpoints and inter-service mesh communications.\n* **Legacy Protocols**: TLS 1.0/1.1 and insecure cipher suites are strictly prohibited at the gateway ingress layer.', '11:21 AM', NULL, NOW() - INTERVAL '8 minutes')
ON CONFLICT (id) DO NOTHING;

-- Seed initial citations
INSERT INTO citations (id, message_id, doc_id, doc_name, doc_format, page_number, paragraph_id, snippet, similarity_score)
VALUES 
  ('cit-1', 'msg-1-3', 'doc-1', 'Enterprise_Security_Whitepaper_2024.pdf', 'pdf', 14, 'p-14-2', 'Section 4.2 - Storage Cryptography: All relational databases, blob storage buckets, and semantic vector stores mandate AES-256-GCM envelope encryption. Storage volumes are provisioned with automated HSM-backed key rotation cycles every 90 calendar days.', 0.94),
  ('cit-2', 'msg-1-3', 'doc-1', 'Enterprise_Security_Whitepaper_2024.pdf', 'pdf', 18, 'p-18-1', 'Section 5.1 - Perimeter & Wire Protocols: Ingress traffic terminates strictly at TLS 1.3 endpoints. Fallbacks to cipher suites supporting less than 256-bit symmetric security are systematically rejected at the Cloud Gateway load balancer.', 0.91)
ON CONFLICT (id) DO NOTHING;
