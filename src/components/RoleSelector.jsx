import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Shield,
  ShieldAlert,
  ClipboardCheck,
  Edit3,
  User,
  Check,
  Lock,
} from "lucide-react";
import { useAuthRbac } from "../context/AuthRbacContext";

export default function RoleSelector({ compact = false }) {
  const { currentRole, currentUser, switchRole, openRbacModal, PRESET_USERS, ROLES } =
    useAuthRbac();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return <ShieldAlert className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />;
      case ROLES.AUDITOR:
        return <ClipboardCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
      case ROLES.EDITOR:
        return <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
      default:
        return <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition shadow-xs cursor-pointer"
        title="Switch Operating Role & View Permissions"
      >
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr ${currentUser.color} text-white font-bold text-[10px] shadow-xs`}
        >
          {currentUser.avatar}
        </div>

        {!compact && (
          <span className="hidden lg:inline text-slate-700 dark:text-slate-300 font-medium">
            {currentUser.name}
          </span>
        )}

        <span
          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide border ${currentUser.badgeBg}`}
        >
          {currentRole}
        </span>

        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-300/60 dark:shadow-indigo-950/70 backdrop-blur-xl z-50 animate-fade-in text-xs transition-colors">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select Operating Role
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
              RBAC v2.1
            </span>
          </div>

          <div className="space-y-1">
            {Object.values(PRESET_USERS).map((user) => {
              const isSelected = currentRole === user.role;

              return (
                <button
                  key={user.role}
                  onClick={() => {
                    switchRole(user.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl transition text-left cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${user.color} text-white font-bold text-xs shadow-xs`}
                  >
                    {user.avatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {user.name}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[8px] font-bold uppercase border ${user.badgeBg}`}
                        >
                          {user.role}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {user.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action to view RBAC Matrix */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => {
                setIsOpen(false);
                openRbacModal("matrix");
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300 font-semibold text-slate-700 dark:text-slate-300 transition text-[11px] cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <span>Permissions Matrix & Audit Logs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
