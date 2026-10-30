/**
 * Utility functions for Social Media Sharing (WhatsApp, Twitter/X, LinkedIn, Telegram, Email)
 */

export function generateShareText({ type = "session", item }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://docusphere.ai";

  if (type === "document") {
    const doc = item;
    const shareUrl = `${origin}?doc=${encodeURIComponent(doc?.id || "")}`;
    const formatUpper = (doc?.format || "document").toUpperCase();
    
    let text = `📄 *DocuSphere-AI Knowledge Document*\n\n`;
    text += `*Title*: ${doc?.name || "Document"}\n`;
    text += `*Format*: ${formatUpper} • ${doc?.size || "Indexed"}\n`;
    if (doc?.pages) text += `*Pages*: ${doc.pages} Pages\n`;
    if (doc?.sheetsCount) text += `*Sheets*: ${doc.sheetsCount} Sheets\n`;
    if (doc?.chunksCount) text += `*Vector Chunks*: ${doc.chunksCount} Chunks (text-embedding-3-large)\n`;
    text += `*Status*: Ground-Truth Verified & 100% Vectorized\n\n`;
    text += `Explore this document and ask AI questions:\n${shareUrl}`;

    return { text, shareUrl, title: doc?.name || "Knowledge Document" };
  } else {
    // Session / Thread sharing
    const session = item;
    const shareUrl = `${origin}?thread=${encodeURIComponent(session?.id || "")}`;
    const citations = session?.messages?.flatMap((m) => m.citations || []) || [];
    const latestAssistantMsg = [...(session?.messages || [])]
      .reverse()
      .find((m) => m.sender === "assistant");
    
    let snippet = latestAssistantMsg?.content || session?.preview || "";
    // Clean markdown headings for clean social sharing
    snippet = snippet.replace(/###\s+/g, "").replace(/\*\*/g, "").slice(0, 220);
    if (snippet.length >= 220) snippet += "...";

    let text = `📄 *DocuSphere-AI Intelligence Briefing*\n\n`;
    text += `📌 *Topic*: ${session?.title || "Inquiry"}\n\n`;
    if (snippet) {
      text += `💡 *Key Finding*:\n"${snippet}"\n\n`;
    }
    if (citations.length > 0) {
      text += `🔍 *Verified Sources (${citations.length})*:\n`;
      citations.slice(0, 3).forEach((c) => {
        const loc = c.page ? `Pg ${c.page}` : c.sheet ? `Sheet "${c.sheet}"` : "Verified";
        text += `• ${c.docName} (${loc})\n`;
      });
      text += `\n`;
    }
    text += `🔗 *Access Verified Thread & Citations*:\n${shareUrl}`;

    return { text, shareUrl, title: session?.title || "Intelligence Briefing" };
  }
}

export function openWhatsAppShare(shareData) {
  const { text } = generateShareText(shareData);
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openTwitterShare(shareData) {
  const { title, shareUrl } = generateShareText(shareData);
  const text = `Verified insight from DocuSphere-AI: ${title}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openLinkedInShare(shareData) {
  const { shareUrl } = generateShareText(shareData);
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openTelegramShare(shareData) {
  const { text, shareUrl } = generateShareText(shareData);
  const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openEmailShare(shareData) {
  const { text, title } = generateShareText(shareData);
  const subject = encodeURIComponent(`DocuSphere-AI Briefing: ${title}`);
  const body = encodeURIComponent(text);
  window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
}
