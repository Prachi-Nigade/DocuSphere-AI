import React, { useState } from "react";
import {
  X,
  Shield,
  ShieldCheck,
  Check,
  Download,
  Search,
  Lock,
  UserCheck,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { useAuthRbac } from "../context/AuthRbacContext";

export default function RbacModal({ isOpen, onClose }) {
  const {
    currentRole,
    currentUser,
    switchRole,
    auditLogs,
    rbacModalTab,
    setRbacModalTab,
    ROLES,
    PRESET_USERS,
    PERMISSION_MATRIX,
  } = useAuthRbac();

  const [searchAudit, setSearchAudit] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.target.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.details.toLowerCase().includes(searchAudit.toLowerCase()) ||
      log.user.toLowerCase().includes(searchAudit.toLowerCase());
    const matchesSeverity =
      selectedSeverity === "all" || log.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const handleExportAuditLogs = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `docusphere_rbac_audit_trail_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/60 dark:shadow-indigo-950/60 flex flex-col max-h-[92vh] overflow-hidden transition-colors"
      >
        {/* 1. Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Role-Based Access Control (RBAC) & Governance
                </h3>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Enterprise Security
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure role boundaries, verify permission matrices, and inspect compliance audit logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-100 transition"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Active User Switcher Bar */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-indigo-500" />
              Active Operating Persona:
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Select any role below to test permission gates instantly:
            </span>
          </div>

          {/* 4 Role Selector Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(PRESET_USERS).map((user) => {
              const isSelected = currentRole === user.role;

              return (
                <button
                  key={user.role}
                  onClick={() => switchRole(user.role)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr ${user.color} text-white font-bold text-xs shadow-xs`}
                    >
                      {user.avatar}
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${user.badgeBg}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {user.title}
                  </span>

                  {isSelected && (
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3" />
                      Active Role
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Sub-Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setRbacModalTab("matrix")}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition cursor-pointer ${
                rbacModalTab === "matrix"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Permissions Matrix
            </button>
            <button
              onClick={() => setRbacModalTab("audit")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-semibold transition cursor-pointer ${
                rbacModalTab === "audit"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Audit Trail Logs</span>
              <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-mono">
                {auditLogs.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Current Role:</span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${currentUser.badgeBg}`}
            >
              {currentRole}
            </span>
          </div>
        </div>

        {/* 4. Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {rbacModalTab === "matrix" ? (
            /* TAB 1: PERMISSIONS MATRIX */
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 font-bold">
                        <th className="p-3.5 text-slate-800 dark:text-slate-200 w-1/3">
                          Enterprise Capability
                        </th>
                        <th className="p-3 text-center">
                          <span className="rounded px-2 py-0.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            Admin
                          </span>
                        </th>
                        <th className="p-3 text-center">
                          <span className="rounded px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Auditor
                          </span>
                        </th>
                        <th className="p-3 text-center">
                          <span className="rounded px-2 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                            Editor
                          </span>
                        </th>
                        <th className="p-3 text-center">
                          <span className="rounded px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            User
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {PERMISSION_MATRIX.map((perm) => (
                        <tr
                          key={perm.key}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {perm.label}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {perm.description}
                            </div>
                          </td>

                          {/* Admin */}
                          <td className="p-3 text-center">
                            {perm[ROLES.ADMIN] ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>

                          {/* Auditor */}
                          <td className="p-3 text-center">
                            {perm[ROLES.AUDITOR] ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>

                          {/* Editor */}
                          <td className="p-3 text-center">
                            {perm[ROLES.EDITOR] ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>

                          {/* User */}
                          <td className="p-3 text-center">
                            {perm[ROLES.USER] ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <X className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Role Explanations Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-purple-700 dark:text-purple-300">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Admin Security Governance</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Admins hold authoritative credentials: delete documents, purge vector records, re-embed entire vector stores, and assign user roles.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5 font-bold text-xs text-amber-700 dark:text-amber-300">
                    <Clock className="h-4 w-4" />
                    <span>Auditor Compliance Oversight</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Auditors maintain zero-tamper read access: inspect citation similarity match %, verify SHA-256 ground truth hashes, and export compliance audit logs.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: AUDIT TRAIL LOGS */
            <div className="space-y-3">
              {/* Filter & Export Row */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search action, user, or target..."
                    value={searchAudit}
                    onChange={(e) => setSearchAudit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">All Events</option>
                    <option value="info">Info</option>
                    <option value="security">Security</option>
                  </select>

                  <button
                    onClick={handleExportAuditLogs}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Export Logs</span>
                  </button>
                </div>
              </div>

              {/* Log Entries */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    No matching audit logs found
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider ${
                              log.severity === "security"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {log.target}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {log.details}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {log.user}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 5. Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-4 px-5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            <span>Enforced via Spring Boot & React RBAC Security Context</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 font-bold text-white shadow-xs transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
