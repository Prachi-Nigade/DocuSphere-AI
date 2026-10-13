export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    name: "Enterprise_Security_Whitepaper_2024.pdf",
    size: "4.2 MB",
    pages: 48,
    uploadedAt: "10 mins ago",
    status: "indexed", // "indexed" | "processing" | "failed"
    chunksCount: 142,
    embeddingModel: "text-embedding-3-large",
  },
  {
    id: "doc-2",
    name: "Q3_Financial_Quarterly_Report.pdf",
    size: "1.8 MB",
    pages: 24,
    uploadedAt: "1 hour ago",
    status: "indexed",
    chunksCount: 86,
    embeddingModel: "text-embedding-3-large",
  },
  {
    id: "doc-3",
    name: "API_Architecture_Spec_v2.pdf",
    size: "3.1 MB",
    pages: 36,
    uploadedAt: "Yesterday",
    status: "indexed",
    chunksCount: 110,
    embeddingModel: "text-embedding-3-large",
  },
  {
    id: "doc-4",
    name: "Employee_Handbook_Compliance.pdf",
    size: "5.6 MB",
    pages: 72,
    uploadedAt: "Just now",
    status: "processing",
    progress: 74,
    chunksCount: 198,
    embeddingModel: "text-embedding-3-large",
  },
];

export const INITIAL_MESSAGES = [
  {
    id: "msg-1",
    sender: "assistant",
    timestamp: "11:20 AM",
    content:
      "Hello! I'm your **DocuSphere-AI** assistant. I have indexed your knowledge base and vector database in Spring Boot. You can ask queries across your uploaded PDFs, and I will cite the exact document passages and page numbers.",
    citations: [],
    suggestedQueries: [
      "What are the encryption standards for data at rest?",
      "Summarize the Q3 financial highlights and margins",
      "What are the rate-limiting rules in the API spec?",
    ],
  },
  {
    id: "msg-2",
    sender: "user",
    timestamp: "11:21 AM",
    content:
      "What encryption standards and key management policies are enforced for data at rest and data in transit according to our security whitepaper?",
    citations: [],
  },
  {
    id: "msg-3",
    sender: "assistant",
    timestamp: "11:21 AM",
    content:
      "Based on the **Enterprise Security Whitepaper 2024**, here are the cryptographic standards and key management policies enforced across our architecture:\n\n### 1. Data at Rest Encryption\n* **Algorithm**: All persistent databases, object stores, and vector embedding indices utilize **AES-256-GCM** encryption.\n* **Key Rotation**: Cryptographic keys are managed via hardware security modules (HSM) with automated 90-day rotation intervals.\n\n### 2. Data in Transit Encryption\n* **Transport Protocol**: Mandatory enforcement of **TLS 1.3** across all public endpoints and inter-service mesh communications.\n* **Legacy Protocols**: TLS 1.0/1.1 and insecure cipher suites are strictly prohibited at the gateway ingress layer.\n\n### 3. Key Management Hierarchy\n* Master envelope encryption keys (MEK) are restricted via zero-trust IAM policies requiring multi-party authorization for emergency key rollover.",
    citations: [
      {
        id: "cit-1",
        docName: "Enterprise_Security_Whitepaper_2024.pdf",
        page: 14,
        similarity: 0.94,
        snippet:
          "Section 4.2 - Storage Cryptography: All relational databases, blob storage buckets, and semantic vector stores mandate AES-256-GCM envelope encryption. Storage volumes are provisioned with automated HSM-backed key rotation cycles every 90 calendar days.",
      },
      {
        id: "cit-2",
        docName: "Enterprise_Security_Whitepaper_2024.pdf",
        page: 18,
        similarity: 0.91,
        snippet:
          "Section 5.1 - Perimeter & Wire Protocols: Ingress traffic terminates strictly at TLS 1.3 endpoints. Fallbacks to cipher suites supporting less than 256-bit symmetric security are systematically rejected at the Cloud Gateway load balancer.",
      },
    ],
  },
];
