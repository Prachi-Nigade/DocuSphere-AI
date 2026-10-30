import React, { useState } from "react";
import {
  X,
  User,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuthRbac } from "../context/AuthRbacContext";
import { useTheme } from "../context/ThemeContext";

export default function SettingsModal({ isOpen, onClose }) {
  const { currentUser, currentRole, updatePassword, updateProfile, ROLES } = useAuthRbac();
  const { toggleTheme, isDark } = useTheme();

  // Active tab inside settings: "profile" | "theme" | "password"
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    const res = updateProfile({ name: name.trim(), email: email.trim() });
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg("New password must be at least 4 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = updatePassword({ newPassword });
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(res.error);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Workspace Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage profile, dark mode, and security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-950/20">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Settings</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("theme");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "theme"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "password"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Password Change</span>
          </button>
        </div>

        {/* Feedback Banners */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto">
          {/* TAB 1: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentUser.color} text-white font-bold text-base shadow-sm`}
                >
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentUser.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${currentUser.badgeBg}`}
                    >
                      {currentRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentUser.title || "Enterprise Knowledge Worker"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Workspace Role Privilege Level
                </label>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <Shield className="h-4 w-4" />
                    <span>Role: {currentRole.toUpperCase()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {currentUser.description ||
                      "Full administrative permissions to query, verify citations, upload documents, and manage workspace."}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DARK MODE */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {isDark ? "Dark Theme Active" : "Light Theme Active"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isDark
                        ? "Cosmic dark styling optimized for high-contrast viewing."
                        : "Clean white enterprise styling for daytime productivity."}
                    </span>
                  </div>
                </div>

                {/* Live Switch Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors cursor-pointer ${
                    isDark ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                  title="Toggle Theme"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      isDark ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isDark) toggleTheme();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition cursor-pointer ${
                    !isDark
                      ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/30 text-indigo-900"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Sun className="h-6 w-6 text-amber-500" />
                  <span className="font-bold text-xs">Light Mode</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Crisp white enterprise theme
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDark) toggleTheme();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition cursor-pointer ${
                    isDark
                      ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-950/40 text-white"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Moon className="h-6 w-6 text-indigo-400" />
                  <span className="font-bold text-xs">Dark Mode</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Deep indigo & slate styling
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PASSWORD CHANGE */}
          {activeTab === "password" && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Update your account password to maintain secure workspace access. Minimum 4 characters required.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

