import React, { useState } from "react";
import {
  Shield,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sun,
  Moon,
  Check,
  UserCheck,
} from "lucide-react";
import { useAuthRbac, ROLES, PRESET_USERS } from "../../context/AuthRbacContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginPage() {
  // Modes: "signin" | "signup" | "forgot"
  const [mode, setMode] = useState("signin");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, forgotPassword } = useAuthRbac();
  const { toggleTheme, isDark } = useTheme();

  // Handle Demo 1-Click Pre-fill
  const handleQuickDemoFill = (roleKey) => {
    const demoUser = PRESET_USERS[roleKey];
    if (demoUser) {
      setName(demoUser.name);
      setEmail(demoUser.email);
      setPassword(demoUser.password || "password123");
      setSelectedRole(roleKey);
      setErrorMsg("");
      setSuccessMsg("");
    }
  };

  // 1. Submit Sign In
  const handleSignIn = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your Name or Email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your Password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login({
        nameOrEmail: name.trim(),
        password: password,
        role: selectedRole,
      });

      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Authentication failed. Check your password.");
      }
    }, 400);
  };

  // 2. Submit Sign Up
  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please provide your full Name.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg("Password must be at least 4 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = signup({
        name: name.trim(),
        email: email.trim(),
        password: password,
        role: selectedRole,
      });

      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error);
      }
    }, 450);
  };

  // 3. Submit Forgot Password Reset
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please provide your registered Name or Email.");
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg("New password must be at least 4 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = forgotPassword({
        nameOrEmail: name.trim(),
        newPassword: password,
      });

      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setMode("signin");
          setSuccessMsg("Password updated! Sign in with your new credentials.");
        }, 1200);
      } else {
        setErrorMsg(result.error);
      }
    }, 450);
  };

  const roleOptions = [
    {
      id: ROLES.ADMIN,
      label: "Admin",
      badge: "Full Access",
      desc: "Upload, delete, vector re-indexing & RBAC policy governance",
      color: "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 ring-purple-500/30",
      activeBg: "bg-purple-600 text-white",
      dotColor: "bg-purple-500",
    },
    {
      id: ROLES.AUDITOR,
      label: "Auditor",
      badge: "Compliance",
      desc: "Oversight, verify ground-truth citations & inspect audit trails",
      color: "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-amber-500/30",
      activeBg: "bg-amber-600 text-white",
      dotColor: "bg-amber-500",
    },
    {
      id: ROLES.EDITOR,
      label: "Editor",
      badge: "Curator",
      desc: "Upload documents, manage threads, trigger chunk vectorization",
      color: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 ring-blue-500/30",
      activeBg: "bg-blue-600 text-white",
      dotColor: "bg-blue-500",
    },
    {
      id: ROLES.USER,
      label: "User",
      badge: "Reader",
      desc: "Query indexed knowledge base, inspect evidence & export chats",
      color: "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30",
      activeBg: "bg-emerald-600 text-white",
      dotColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Theme Toggle Button in top corner */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition shadow-sm backdrop-blur-md"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Central Auth Container */}
      <div className="relative w-full max-w-xl z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 mb-3 animate-bounce duration-1000">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>DocuSphere-AI</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold tracking-normal">
              v2.5 RAG
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
            Enterprise Multi-Format Document Intelligence & Citations
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
          {/* Top Segmented Navigation: [Sign In] vs [Sign Up] */}
          {mode !== "forgot" ? (
            <div className="flex rounded-2xl bg-slate-950/80 p-1 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                  mode === "signin"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                  mode === "signup"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-400" />
                  <span>Reset Password</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your credentials to regain access
                </p>
              </div>
              <button
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 px-3.5 py-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 1. SIGN IN FORM */}
          {/* ------------------------------------------------------------- */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Field 1: Name / Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name or Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Vance or your name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              {/* Field 2: Password with Eye Icon Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-mono"
                  />
                  {/* Eye Toggle Icon */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "View password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Field 3: Required Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    Select Workspace Role <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Determines document privileges
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedRole(opt.id)}
                        className={`relative flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600/20 ring-2 ring-indigo-500/40 text-white"
                            : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-bold text-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${opt.dotColor}`}
                          />
                          {opt.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {opt.badge}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 text-indigo-400">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Signing in..." : "Sign In to DocuSphere-AI"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Demo Pre-fill Pills */}
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  <span>Quick demo login (1-click autofill):</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { key: ROLES.ADMIN, label: "Admin: Alex" },
                    { key: ROLES.AUDITOR, label: "Auditor: Elena" },
                    { key: ROLES.EDITOR, label: "Editor: Marcus" },
                    { key: ROLES.USER, label: "User: Sarah" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleQuickDemoFill(p.key)}
                      className="rounded-lg border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-slate-700 px-2 py-1 text-[11px] text-slate-300 font-medium transition text-center truncate cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 2. SIGN UP FORM */}
          {/* ------------------------------------------------------------- */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rachel.adams@enterprise.ai"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>

              {/* Password & Confirm Password with Eye Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 4 chars"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                      title={showPassword ? "Hide password" : "View password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                      title={
                        showConfirmPassword ? "Hide password" : "View password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Select Role */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Select User Role <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedRole(opt.id)}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600/20 ring-2 ring-indigo-500/40 text-white"
                            : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className="font-bold text-xs">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Creating Account..." : "Create Account & Sign In"}
                </span>
                <UserCheck className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 3. FORGOT PASSWORD FORM */}
          {/* ------------------------------------------------------------- */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Registered Name or Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your registered name or email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (min 4 chars)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    title={showPassword ? "Hide password" : "View password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    title={
                      showConfirmPassword ? "Hide password" : "View password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? "Updating..." : "Reset Password & Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          <span>Role-Based Access Control (RBAC) & AES-256-GCM Secure Pipeline</span>
        </div>
      </div>
    </div>
  );
}
