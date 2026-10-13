import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Mail,
  Sparkles,
  FileText,
  ShieldCheck,
  Send,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import {
  exportSessionToMarkdown,
  generateTeamSlackSnippet,
} from "../utils/sessionManager";

/**
 * ShareModal Component
 * Facilitates sharing verified insights, citations, and summaries with teammates.
 */
export default function ShareModal({ session, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSlack, setCopiedSlack] = useState(false);

  if (!session) return null;

  const shareUrl = `${window.location.origin}?thread=${session.id}`;
  const citations = session.messages.flatMap((m) => m.citations || []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopySlackSnippet = () => {
    const text = generateTeamSlackSnippet(session);
    navigator.clipboard.writeText(text);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2200);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`DocuSphere-AI Briefing: ${session.title}`);
    const body = encodeURIComponent(
      `Hello Team,\n\nHere is a verified insight summary from DocuSphere-AI regarding "${session.title}":\n\n${generateTeamSlackSnippet(
        session
      )}\n\nLink to Thread: ${shareUrl}\n`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/50">
        {/* 1. Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/10">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Share Insights & Evidence</span>
              </h3>
              <p className="text-xs text-slate-400">
                Distribute verified Q&A findings and citations with your team
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Direct Shareable Link */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
            <span>Direct Snapshot Link</span>
            <span className="text-[11px] text-slate-500">Read-only link</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-mono text-slate-300 truncate">
              {shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                copiedLink
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/30"
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

        {/* 3. Team Briefing Preview Card */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-200">
              {session.title}
            </span>
            <span className="text-[11px] text-slate-500">
              {session.messages.length} Messages
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
            {session.preview || session.messages[session.messages.length - 1]?.content}
          </p>

          {/* Citations Summary */}
          {citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-indigo-300 flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                Citing {citations.length} Source{citations.length !== 1 ? "s" : ""}:
              </span>
              {citations.slice(0, 3).map((c, idx) => (
                <span
                  key={idx}
                  className="rounded bg-indigo-950/50 px-2 py-0.5 text-[10px] text-slate-300 border border-indigo-500/20 max-w-[150px] truncate"
                >
                  {c.docName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Quick Export & Collaboration Options */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={handleCopySlackSnippet}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition"
          >
            {copiedSlack ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            )}
            <span>{copiedSlack ? "Copied!" : "Copy for Slack"}</span>
          </button>

          <button
            onClick={() => exportSessionToMarkdown(session)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handleEmailShare}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500/40 hover:bg-slate-800 transition"
          >
            <Mail className="h-3.5 w-3.5 text-indigo-400" />
            <span>Email Briefing</span>
          </button>
        </div>

        {/* 5. Footer info */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Includes ground-truth citation evidence and page numbers</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-slate-400 hover:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
