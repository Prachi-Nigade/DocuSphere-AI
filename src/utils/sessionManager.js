import { INITIAL_SESSIONS } from "../data/initialData";

const SESSIONS_STORAGE_KEY = "docusphere_sessions_v2";
const ACTIVE_SESSION_STORAGE_KEY = "docusphere_active_session_id";

/**
 * Load all persistent sessions from localStorage or fallback to defaults
 */
export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to load sessions from localStorage", err);
  }
  return INITIAL_SESSIONS;
}

/**
 * Save sessions to localStorage
 */
export function saveSessions(sessions) {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error("Failed to save sessions to localStorage", err);
  }
}

/**
 * Load active session ID
 */
export function loadActiveSessionId(sessions = []) {
  try {
    const saved = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (saved && sessions.some((s) => s.id === saved)) {
      return saved;
    }
  } catch (err) {
    console.error("Failed to load active session ID", err);
  }
  return sessions[0]?.id || "session-1";
}

/**
 * Save active session ID
 */
export function saveActiveSessionId(id) {
  try {
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, id);
  } catch (err) {
    console.error("Failed to save active session ID", err);
  }
}

/**
 * Create a brand new session
 */
export function createNewSession(customTitle = "New Knowledge Inquiry") {
  const newId = `session-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    id: newId,
    title: customTitle,
    createdAt: now,
    updatedAt: now,
    preview: "Start a new conversation across your documents...",
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        content:
          "Hello! This is a new **DocuSphere-AI** thread. Ask any questions regarding your indexed PDFs, Excel sheets, Word docs, or Markdown specifications.",
        citations: [],
        suggestedQueries: [
          "Summarize key compliance points in our handbook",
          "What are the Q3 gross margins in the financial report?",
          "Explain the encryption protocols in the security whitepaper",
        ],
      },
    ],
  };
}

/**
 * Generate Markdown content string for a session
 */
export function generateSessionMarkdown(session) {
  if (!session) return "";

  let md = `# DocuSphere-AI Knowledge Briefing\n\n`;
  md += `> **Thread Title:** ${session.title}\n`;
  md += `> **Date:** ${new Date(session.updatedAt || session.createdAt).toLocaleString()}\n`;
  md += `> **Session ID:** \`${session.id}\`\n\n`;
  md += `---\n\n`;

  md += `## 📋 Conversation Transcript\n\n`;

  const allCitations = [];

  session.messages.forEach((msg) => {
    const sender = msg.sender === "user" ? "👤 **User**" : "🤖 **DocuSphere Assistant**";
    md += `### ${sender} *(${msg.timestamp})*\n\n`;
    md += `${msg.content}\n\n`;

    if (msg.citations && msg.citations.length > 0) {
      md += `**Cited Ground Truth:**\n`;
      msg.citations.forEach((c) => {
        allCitations.push(c);
        const loc = c.page
          ? `Page ${c.page}`
          : c.sheet
          ? `Sheet: ${c.sheet}, Row: ${c.row}`
          : c.section || "Section";
        md += `* 📄 **${c.docName}** (${loc}) — *Similarity: ${Math.round(
          (c.similarity || 0.9) * 100
        )}%*\n`;
        md += `  > "${c.snippet}"\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  if (allCitations.length > 0) {
    md += `## 📚 Consolidated Evidence & Sources\n\n`;
    md += `| Document | Location | Relevance | Excerpt |\n`;
    md += `|---|---|---|---|\n`;
    allCitations.forEach((c) => {
      const loc = c.page
        ? `Page ${c.page}`
        : c.sheet
        ? `${c.sheet} (R${c.row})`
        : c.section || "General";
      const snippetClean = (c.snippet || "").replace(/\|/g, "-").replace(/\n/g, " ");
      md += `| \`${c.docName}\` | ${loc} | ${Math.round(
        (c.similarity || 0.9) * 100
      )}% | "${snippetClean}" |\n`;
    });
    md += `\n`;
  }

  md += `*Exported from DocuSphere-AI Enterprise RAG System*\n`;
  return md;
}

/**
 * Export conversation session as a structured Markdown file
 */
export function exportSessionToMarkdown(session) {
  if (!session) return false;
  try {
    const md = generateSessionMarkdown(session);
    triggerDownload(md, `${sanitizeFilename(session.title)}.md`, "text/markdown");
    return true;
  } catch (err) {
    console.error("Failed to export Markdown", err);
    return false;
  }
}

/**
 * Export conversation session as clean JSON
 */
export function exportSessionToJSON(session) {
  if (!session) return false;
  try {
    const jsonStr = JSON.stringify(session, null, 2);
    triggerDownload(jsonStr, `${sanitizeFilename(session.title)}.json`, "application/json");
    return true;
  } catch (err) {
    console.error("Failed to export JSON", err);
    return false;
  }
}

/**
 * Export conversation session as plain text (.txt)
 */
export function exportSessionToPlainText(session) {
  if (!session) return false;
  try {
    let txt = `DOCUSPHERE-AI CONVERSATION TRANSCRIPT\n`;
    txt += `Title: ${session.title}\n`;
    txt += `Date: ${new Date(session.updatedAt || session.createdAt).toLocaleString()}\n`;
    txt += `Session ID: ${session.id}\n`;
    txt += `--------------------------------------------------------\n\n`;

    session.messages.forEach((msg) => {
      txt += `[${msg.timestamp}] ${msg.sender.toUpperCase()}:\n`;
      txt += `${msg.content}\n`;
      if (msg.citations && msg.citations.length > 0) {
        txt += `CITATIONS:\n`;
        msg.citations.forEach((c) => {
          const loc = c.page ? `Page ${c.page}` : c.sheet ? `Sheet ${c.sheet}, Row ${c.row}` : "General";
          txt += `  - Source: ${c.docName} (${loc})\n`;
          txt += `    Excerpt: "${c.snippet}"\n`;
        });
      }
      txt += `\n--------------------------------------------------------\n\n`;
    });

    triggerDownload(txt, `${sanitizeFilename(session.title)}.txt`, "text/plain");
    return true;
  } catch (err) {
    console.error("Failed to export Plain Text", err);
    return false;
  }
}

/**
 * Print-ready formatted Executive Report (bypasses browser popup blockers via iframe)
 */
export function printSessionReport(session) {
  if (!session) return false;

  try {
    const contentHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${session.title} - DocuSphere Briefing</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #0f172a; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin-bottom: 4px; font-size: 24px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
            .msg { margin-bottom: 24px; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; }
            .user { border-left: 4px solid #6366f1; background: #eff6ff; }
            .assistant { border-left: 4px solid #10b981; }
            .sender { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
            .citation { margin-top: 12px; padding: 10px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
            th { background: #f1f5f9; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>${session.title}</h1>
          <div class="meta">DocuSphere-AI Enterprise RAG Briefing • Exported on ${new Date().toLocaleString()}</div>
          ${session.messages
            .map(
              (m) => `
              <div class="msg ${m.sender}">
                <div class="sender">${m.sender === "user" ? "👤 User Inquiry" : "🤖 DocuSphere-AI Assistant"} • ${m.timestamp}</div>
                <div>${m.content.replace(/\n/g, "<br>")}</div>
                ${
                  m.citations && m.citations.length > 0
                    ? `<div class="citation">
                        <strong>Verified Sources:</strong><br>
                        ${m.citations
                          .map(
                            (c) =>
                              `• <strong>${c.docName}</strong> (${c.page ? "Page " + c.page : c.sheet || ""}) — <em>"${c.snippet}"</em>`
                          )
                          .join("<br>")}
                      </div>`
                    : ""
                }
              </div>`
            )
            .join("")}
        </body>
      </html>
    `;

    // Create an invisible iframe for direct printing (never blocked by browser popup blockers!)
    let iframe = document.getElementById("docusphere-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "docusphere-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(contentHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);

    return true;
  } catch (err) {
    console.error("Failed to print report", err);
    return false;
  }
}

/**
 * Generate quick Markdown summary formatted for Slack / Microsoft Teams
 */
export function generateTeamSlackSnippet(session) {
  if (!session) return "";

  const userQueries = session.messages.filter((m) => m.sender === "user");
  const lastQuery = userQueries[userQueries.length - 1]?.content || session.title;
  const assistantMsgs = session.messages.filter((m) => m.sender === "assistant");
  const lastAnswer = assistantMsgs[assistantMsgs.length - 1]?.content || "";

  let snippet = `*💡 DocuSphere-AI Team Insight: ${session.title}*\n\n`;
  snippet += `*Q:* ${lastQuery}\n\n`;
  snippet += `*A (Key Finding):*\n${lastAnswer.slice(0, 350)}...\n\n`;

  const citations = assistantMsgs.flatMap((m) => m.citations || []);
  if (citations.length > 0) {
    snippet += `*📚 Verified Sources:*\n`;
    citations.slice(0, 3).forEach((c) => {
      const loc = c.page ? `Page ${c.page}` : c.sheet ? `Sheet ${c.sheet}` : "Doc";
      snippet += `• ${c.docName} (${loc})\n`;
    });
  }

  return snippet;
}

function sanitizeFilename(title) {
  return (title || "DocuSphere_Session")
    .replace(/[^a-z0-9_-]/gi, "_")
    .toLowerCase()
    .slice(0, 40);
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
