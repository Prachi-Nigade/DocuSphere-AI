import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Mail,
  ShieldCheck,
  MessageSquare,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import {
  exportSessionToMarkdown,
  generateTeamSlackSnippet,
} from "../utils/sessionManager";
import {
  generateShareText,
  openWhatsAppShare,
  openTwitterShare,
  openLinkedInShare,
  openTelegramShare,
  openEmailShare,
} from "../utils/shareUtils";

// SVG Brand Icons for WhatsApp, X (Twitter), LinkedIn, Telegram
function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.5 2 2.016 6.484 2.016 12.016c0 1.766.46 3.492 1.332 5.015L2 22l5.125-1.344A9.974 9.974 0 0012.031 22C17.562 22 22 17.531 22 12.016 22 6.484 17.547 2 12.031 2zm0 18.297c-1.547 0-3.063-.414-4.39-1.203l-.313-.188-3.266.86.875-3.188-.203-.328A8.257 8.257 0 013.75 12.016c0-4.563 3.719-8.281 8.281-8.281 4.547 0 8.266 3.719 8.266 8.281 0 4.563-3.719 8.281-8.266 8.281zm4.531-6.188c-.25-.125-1.469-.719-1.688-.813-.234-.094-.406-.14-.578.14-.172.266-.672.828-.828 1-.156.172-.313.187-.563.062-.25-.125-1.062-.39-2.016-1.234-.75-.672-1.25-1.5-1.39-1.75-.157-.25-.016-.39.109-.516.109-.109.25-.281.375-.422.125-.14.172-.234.25-.39.078-.172.047-.313-.016-.438-.078-.14-.578-1.406-.812-1.922-.219-.516-.438-.438-.61-.438-.156 0-.328-.016-.5-.016s-.453.063-.688.313c-.234.25-.906.875-.906 2.14 0 1.25.922 2.469 1.047 2.641.14.172 1.813 2.766 4.39 3.875.61.266 1.094.422 1.469.547.61.188 1.172.172 1.609.094.484-.078 1.469-.61 1.672-1.188.219-.594.219-1.094.156-1.203-.062-.125-.234-.188-.484-.313z" />
    </svg>
  );
}

function TwitterXIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0-.01-3.06 1.53 1.53 0 0 0 .01 3.06M7.86 18.5V10.13H5.07V18.5h2.79z" />
    </svg>
  );
}

function TelegramIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

/**
 * ShareModal Component
 * Facilitates sharing verified insights, citations, and documents via WhatsApp,
 * social media platforms, direct link, Slack, and email.
 */
export default function ShareModal({ session, document, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);

  // Normalize whether we are sharing a session or document
  const isDocument = Boolean(document && !session);
  const shareType = isDocument ? "document" : "session";
  const shareTarget = isDocument ? document : session;

  if (!shareTarget) return null;

  const { shareUrl, title } = generateShareText({
    type: shareType,
    item: shareTarget,
  });

  const citations = isDocument
    ? []
    : session?.messages?.flatMap((m) => m.citations || []) || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopySlackSnippet = () => {
    const text = isDocument
      ? `*DocuSphere Document*: ${document.name} (${document.format?.toUpperCase()} • ${document.size})\nVerified Vector Index • text-embedding-3-large\nLink: ${shareUrl}`
      : generateTeamSlackSnippet(session);
    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-2xl shadow-slate-300/60 dark:shadow-indigo-950/50 transition-colors"
      >
        {/* 1. Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isDocument ? "Share Document" : "Share Insights & Evidence"}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDocument
                  ? "Share multi-format document summary and citations via WhatsApp & social media"
                  : "Distribute verified findings, citations, and ground-truth evidence"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100 transition"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. FEATURED: Big Primary WhatsApp Share Button */}
        <div className="mt-4">
          <button
            onClick={() => openWhatsAppShare({ type: shareType, item: shareTarget })}
            className="group w-full flex items-center justify-between gap-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] p-3.5 text-white font-semibold shadow-lg shadow-[#25D366]/20 transition-all duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white">
                <WhatsAppIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <span>Share on WhatsApp</span>
                  <span className="rounded bg-black/20 px-1.5 py-0.2 text-[10px] uppercase font-mono">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-white/90 font-normal">
                  Send formatted briefing with citations & link to WhatsApp chats
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 3. Quick Social Media Platforms Grid */}
        <div className="mt-3">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Social Media Channels
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* WhatsApp */}
            <button
              onClick={() => openWhatsAppShare({ type: shareType, item: shareTarget })}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-slate-700 dark:text-slate-200 hover:border-[#25D366]/60 hover:bg-[#25D366]/10 hover:text-[#25D366] transition group"
              title="Share to WhatsApp"
            >
              <WhatsAppIcon className="h-5 w-5 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium">WhatsApp</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => openTwitterShare({ type: shareType, item: shareTarget })}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-slate-700 dark:text-slate-200 hover:border-slate-900 dark:hover:border-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition group"
              title="Share to X (Twitter)"
            >
              <TwitterXIcon className="h-4.5 w-4.5 text-slate-900 dark:text-slate-100 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium">X / Twitter</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => openLinkedInShare({ type: shareType, item: shareTarget })}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-slate-700 dark:text-slate-200 hover:border-[#0A66C2]/60 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition group"
              title="Share to LinkedIn"
            >
              <LinkedInIcon className="h-4.5 w-4.5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium">LinkedIn</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => openTelegramShare({ type: shareType, item: shareTarget })}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2.5 text-slate-700 dark:text-slate-200 hover:border-[#229ED9]/60 hover:bg-[#229ED9]/10 hover:text-[#229ED9] transition group"
              title="Share to Telegram"
            >
              <TelegramIcon className="h-4.5 w-4.5 text-[#229ED9] group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium">Telegram</span>
            </button>
          </div>
        </div>

        {/* 4. Direct Shareable Link */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Direct Snapshot Link</span>
            <span className="text-[11px] text-slate-500">Read-only link</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-300 truncate">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                copiedLink
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5. Preview Card */}
        <div className="mt-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[340px]">
              {title}
            </span>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">
              {isDocument
                ? `${document.format?.toUpperCase()} • ${document.size}`
                : `${session.messages.length} msgs`}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {isDocument
              ? `Ground-truth verified knowledge base document indexed with ${document.chunksCount || 0} semantic vectors.`
              : session.preview || session.messages[session.messages.length - 1]?.content}
          </p>

          {/* Citations Summary */}
          {citations.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-300 flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                Citing {citations.length} Source{citations.length !== 1 ? "s" : ""}:
              </span>
              {citations.slice(0, 3).map((c, idx) => (
                <span
                  key={idx}
                  className="rounded bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-[10px] text-indigo-700 dark:text-slate-300 border border-indigo-200 dark:border-indigo-500/20 max-w-[150px] truncate"
                >
                  {c.docName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 6. Quick Collaboration Options (Slack, MD, Email) */}
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <button
            onClick={handleCopySlackSnippet}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {copiedSlack ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
            )}
            <span>{copiedSlack ? "Copied!" : "Copy Slack"}</span>
          </button>

          {!isDocument && (
            <button
              onClick={() => exportSessionToMarkdown(session)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>Save .MD</span>
            </button>
          )}

          <button
            onClick={() => openEmailShare({ type: shareType, item: shareTarget })}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-500" />
            <span>Email</span>
          </button>
        </div>

        {/* 7. Footer info */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Encrypted snapshot with verified citation references</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
