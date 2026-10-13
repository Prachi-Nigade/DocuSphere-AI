export const INITIAL_DOCUMENTS = [
  {
    id: "doc-1",
    name: "Enterprise_Security_Whitepaper_2024.pdf",
    format: "pdf",
    size: "4.2 MB",
    pages: 48,
    uploadedAt: "10 mins ago",
    status: "indexed",
    chunksCount: 142,
    embeddingModel: "text-embedding-3-large",
    pagesData: [
      {
        pageNumber: 13,
        paragraphs: [
          {
            id: "p-13-1",
            text: "3.4 Cloud Infrastructure Baseline: Antigravity cluster isolation enforces dual VPC boundaries across multi-region deployments with strict CIDR egress filtering.",
          },
          {
            id: "p-13-2",
            text: "Zero-trust ingress is mediated through authenticated mutual TLS (mTLS) gateways with short-lived X.509 cryptographic identities generated via SPIFFE/SPIRE.",
          },
        ],
      },
      {
        pageNumber: 14,
        paragraphs: [
          {
            id: "p-14-1",
            text: "Section 4.1 - Cryptographic Perimeter: All ingress communication vectors terminate strictly at Cloudflare edge proxies before being forwarded to Spring Boot application gateways.",
          },
          {
            id: "p-14-2",
            text: "Section 4.2 - Storage Cryptography: All relational databases, blob storage buckets, and semantic vector stores mandate AES-256-GCM envelope encryption. Storage volumes are provisioned with automated HSM-backed key rotation cycles every 90 calendar days.",
            isHighlighted: true,
          },
          {
            id: "p-14-3",
            text: "Audit logging for cryptographic key operations is piped directly to immutable cold storage with write-once-read-many (WORM) retention policies.",
          },
        ],
      },
      {
        pageNumber: 18,
        paragraphs: [
          {
            id: "p-18-1",
            text: "Section 5.1 - Perimeter & Wire Protocols: Ingress traffic terminates strictly at TLS 1.3 endpoints. Fallbacks to cipher suites supporting less than 256-bit symmetric security are systematically rejected at the Cloud Gateway load balancer.",
            isHighlighted: true,
          },
          {
            id: "p-18-2",
            text: "Ephemeral session keys utilize Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) with Curve25519 to provide perfect forward secrecy (PFS).",
          },
        ],
      },
    ],
  },
  {
    id: "doc-2",
    name: "Q3_Financial_Quarterly_Report.xlsx",
    format: "excel",
    size: "2.1 MB",
    sheetsCount: 3,
    rowsCount: 240,
    uploadedAt: "1 hour ago",
    status: "indexed",
    chunksCount: 94,
    embeddingModel: "text-embedding-3-large",
    sheetsData: [
      {
        name: "Revenue & Margins",
        headers: ["Quarter", "Revenue (M$)", "Gross Profit (M$)", "Operating Margin", "YoY Growth", "Status"],
        rows: [
          { id: "row-1", quarter: "Q1-2024", revenue: "$14.2M", grossProfit: "$9.8M", margin: "38.2%", yoy: "+14.2%", status: "Audited" },
          { id: "row-2", quarter: "Q2-2024", revenue: "$16.8M", grossProfit: "$11.9M", margin: "41.5%", yoy: "+18.6%", status: "Audited" },
          { id: "row-3", quarter: "Q3-2024", revenue: "$21.4M", grossProfit: "$15.6M", margin: "46.2%", yoy: "+28.4%", status: "Preliminary", isHighlighted: true },
          { id: "row-4", quarter: "Q4-2024 (Proj)", revenue: "$24.0M", grossProfit: "$17.5M", margin: "47.8%", yoy: "+31.0%", status: "Forecast" },
        ],
      },
      {
        name: "R&D Expenditure",
        headers: ["Category", "Allocation", "Cloud Compute", "AI Inference", "Discretionary"],
        rows: [
          { id: "row-r1", category: "Core Backend", allocation: "$3.4M", compute: "$1.2M", inference: "$0.4M", status: "Approved" },
          { id: "row-r2", category: "Vector RAG Systems", allocation: "$4.1M", compute: "$2.1M", inference: "$1.8M", status: "Approved" },
        ],
      },
    ],
  },
  {
    id: "doc-3",
    name: "API_Architecture_Spec_v2.md",
    format: "markdown",
    size: "860 KB",
    sectionsCount: 16,
    uploadedAt: "Yesterday",
    status: "indexed",
    chunksCount: 110,
    embeddingModel: "text-embedding-3-large",
    content: `# DocuSphere Architecture Specification v2

## 1. System Overview
DocuSphere-AI bridges enterprise unstructured documents with vector embeddings indexed in PostgreSQL pgvector and Pinecone.

## 2. Ingestion Pipeline
All document uploads are processed through a modular pipeline:
* Document format detection (Apache Tika / Apache POI)
* Recursive character text splitting (chunk size 512, overlap 64)
* Embedding generation via OpenAI text-embedding-3-large
* Metadata tagging (docName, format, page/sheet/row, timestamp)

## 3. Rate Limiting & Throttling
\`\`\`yaml
rate_limiter:
  algorithm: token_bucket
  capacity: 100
  refill_tokens_per_second: 20
  headers:
    x-ratelimit-remaining: true
    x-ratelimit-reset: true
\`\`\`
All API requests to the \`/api/v1/chat\` endpoint are governed by a token-bucket algorithm capped at 100 requests per tenant with a refill rate of 20 tokens per second. Requests exceeding limits receive HTTP 429 Too Many Requests with exponential backoff headers.

## 4. Vector Similarity Thresholds
Cosine similarity score threshold is calibrated at >= 0.78 for chunk consideration in the RAG retrieval window.`,
  },
  {
    id: "doc-4",
    name: "Employee_Handbook_Compliance.docx",
    format: "docx",
    size: "3.8 MB",
    pages: 32,
    uploadedAt: "2 days ago",
    status: "indexed",
    chunksCount: 164,
    embeddingModel: "text-embedding-3-large",
    sectionsData: [
      {
        title: "Section 3: Remote Work & Data Protection Policies",
        page: 6,
        paragraphs: [
          {
            id: "doc-p1",
            text: "3.1 Remote Connectivity: All employees working remotely must connect exclusively via the corporate WireGuard VPN tunnel with multi-factor authentication (MFA) enforcement.",
          },
          {
            id: "doc-p2",
            text: "3.2 Hardware Safeguards: Company-issued MacBooks and ThinkPads are enforced with FileVault / BitLocker full-disk encryption and MDM compliance agents.",
            isHighlighted: true,
          },
          {
            id: "doc-p3",
            text: "3.3 Personal Device Prohibition: Accessing production vector indices or proprietary documents from unmanaged personal devices (BYOD) is strictly prohibited.",
          },
        ],
      },
    ],
  },
];

export const INITIAL_SESSIONS = [
  {
    id: "session-1",
    title: "Security & Encryption Whitepaper Review",
    createdAt: "2026-10-13T11:20:00Z",
    updatedAt: "2026-10-13T11:23:00Z",
    preview: "What encryption standards and key management policies are enforced...",
    messages: [
      {
        id: "msg-1-1",
        sender: "assistant",
        timestamp: "11:20 AM",
        content:
          "Hello! I'm your **DocuSphere-AI** multi-format document assistant. I have indexed your enterprise documents in Spring Boot with pgvector.\n\nClick any citation badge to launch the **Interactive Document Viewer** and inspect the highlighted passage!",
        citations: [],
        suggestedQueries: [
          "What are the encryption standards for data at rest?",
          "What are our transport security and TLS cipher requirements?",
          "Summarize the key rotation policies in Section 4.2",
        ],
      },
      {
        id: "msg-1-2",
        sender: "user",
        timestamp: "11:21 AM",
        content:
          "What encryption standards and key management policies are enforced for data at rest and data in transit according to our security whitepaper?",
        citations: [],
      },
      {
        id: "msg-1-3",
        sender: "assistant",
        timestamp: "11:21 AM",
        content:
          "Based on the **Enterprise Security Whitepaper 2024**, here are the cryptographic standards and key management policies enforced across our architecture:\n\n### 1. Data at Rest Encryption\n* **Algorithm**: All persistent databases, object stores, and vector embedding indices utilize **AES-256-GCM** encryption.\n* **Key Rotation**: Cryptographic keys are managed via hardware security modules (HSM) with automated 90-day rotation intervals.\n\n### 2. Data in Transit Encryption\n* **Transport Protocol**: Mandatory enforcement of **TLS 1.3** across all public endpoints and inter-service mesh communications.\n* **Legacy Protocols**: TLS 1.0/1.1 and insecure cipher suites are strictly prohibited at the gateway ingress layer.",
        citations: [
          {
            id: "cit-1",
            docName: "Enterprise_Security_Whitepaper_2024.pdf",
            format: "pdf",
            page: 14,
            paragraphId: "p-14-2",
            similarity: 0.94,
            snippet:
              "Section 4.2 - Storage Cryptography: All relational databases, blob storage buckets, and semantic vector stores mandate AES-256-GCM envelope encryption. Storage volumes are provisioned with automated HSM-backed key rotation cycles every 90 calendar days.",
          },
          {
            id: "cit-2",
            docName: "Enterprise_Security_Whitepaper_2024.pdf",
            format: "pdf",
            page: 18,
            paragraphId: "p-18-1",
            similarity: 0.91,
            snippet:
              "Section 5.1 - Perimeter & Wire Protocols: Ingress traffic terminates strictly at TLS 1.3 endpoints. Fallbacks to cipher suites supporting less than 256-bit symmetric security are systematically rejected at the Cloud Gateway load balancer.",
          },
        ],
      },
    ],
  },
  {
    id: "session-2",
    title: "Q3 Financial Performance Ledger",
    createdAt: "2026-10-13T10:15:00Z",
    updatedAt: "2026-10-13T10:25:00Z",
    preview: "What was our Q3 revenue and operating margin according to the report?",
    messages: [
      {
        id: "msg-2-1",
        sender: "assistant",
        timestamp: "10:15 AM",
        content:
          "Welcome to the financial inquiry thread. I have parsed **Q3_Financial_Quarterly_Report.xlsx** across all sheets.",
        citations: [],
      },
      {
        id: "msg-2-2",
        sender: "user",
        timestamp: "10:16 AM",
        content:
          "What was our Q3 revenue and operating margin according to the quarterly financial report?",
        citations: [],
      },
      {
        id: "msg-2-3",
        sender: "assistant",
        timestamp: "10:16 AM",
        content:
          "According to the **Q3 Financial Quarterly Report (Excel Spreadsheet)**, here are the audited performance numbers from the *Revenue & Margins* ledger:\n\n### Q3-2024 Performance Breakdown\n* **Gross Revenue**: **$21.4M** (up **+28.4% YoY**)\n* **Gross Profit**: **$15.6M**\n* **Operating Margin**: **46.2%**\n* **Audit Status**: Preliminary Q3 close",
        citations: [
          {
            id: "cit-3",
            docName: "Q3_Financial_Quarterly_Report.xlsx",
            format: "excel",
            sheet: "Revenue & Margins",
            row: 3,
            similarity: 0.96,
            snippet:
              "Q3-2024: Revenue $21.4M, Gross Profit $15.6M, Operating Margin 46.2%, YoY Growth +28.4% (Preliminary status)",
          },
        ],
      },
    ],
  },
  {
    id: "session-3",
    title: "API Architecture & Rate Limiting",
    createdAt: "2026-10-12T16:00:00Z",
    updatedAt: "2026-10-12T16:08:00Z",
    preview: "What is the token bucket capacity and refill rate in our API spec?",
    messages: [
      {
        id: "msg-3-1",
        sender: "assistant",
        timestamp: "04:00 PM",
        content:
          "Ready to answer engineering queries across **API_Architecture_Spec_v2.md**.",
        citations: [],
      },
      {
        id: "msg-3-2",
        sender: "user",
        timestamp: "04:01 PM",
        content:
          "What is the token bucket capacity and refill rate in our API spec?",
        citations: [],
      },
      {
        id: "msg-3-3",
        sender: "assistant",
        timestamp: "04:01 PM",
        content:
          "Based on **Section 3: Rate Limiting & Throttling** in the markdown specification:\n\n### Ingress Rate Limiting Parameters\n* **Algorithm**: Token Bucket algorithm\n* **Capacity**: **100 tokens** per tenant\n* **Refill Rate**: **20 tokens per second**\n* **HTTP Response on Breach**: `429 Too Many Requests` with exponential backoff headers",
        citations: [
          {
            id: "cit-4",
            docName: "API_Architecture_Spec_v2.md",
            format: "markdown",
            section: "Rate Limiting & Throttling",
            similarity: 0.94,
            snippet:
              "All API requests to the /api/v1/chat endpoint are governed by a token-bucket algorithm capped at 100 requests per tenant with a refill rate of 20 tokens per second.",
          },
        ],
      },
    ],
  },
];

export const INITIAL_MESSAGES = INITIAL_SESSIONS[0].messages;
