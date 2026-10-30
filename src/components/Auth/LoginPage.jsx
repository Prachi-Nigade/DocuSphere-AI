import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sun,
  Moon,
  Check,
  UserCheck,
  RefreshCw,
  Key,
} from "lucide-react";
import { useAuthRbac, ROLES } from "../../context/AuthRbacContext";
import { useTheme } from "../../context/ThemeContext";
import DocuSphereVisualizer from "./DocuSphereVisualizer";

export default function LoginPage() {
  // Modes: "signin" | "signup" | "forgot"
  const [mode, setMode] = useState("signin");

  // Sign In method: "email_code" | "password"
  const [signInMethod, setSignInMethod] = useState("email_code");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [rememberMe, setRememberMe] = useState(true);

  // Email Verification Code state (Code is sent to user's email, NOT shown on screen)
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    login,
    signup,
    forgotPassword,
    sendEmailVerificationCode,
    verifyEmailCodeAndLogin,
  } = useAuthRbac();

  const { toggleTheme, isDark } = useTheme();

  // Resend code countdown timer
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // --------------------------------------------------------------------------
  // 1. Send Email Verification Code (Sent to user's email - not shown on screen)
  // --------------------------------------------------------------------------
  const handleSendVerificationCode = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = (email || name || "").trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = sendEmailVerificationCode(targetEmail);
      setIsLoading(false);

      if (res.success) {
        setIsCodeSent(true);
        setResendCountdown(30);
        setEmail(res.email);
        setSuccessMsg(
          `Verification code sent to ${res.email}! Please check your email inbox and enter the 6-digit code below.`
        );
      } else {
        setErrorMsg(res.error || "Failed to dispatch verification code.");
      }
    }, 450);
  };

  // --------------------------------------------------------------------------
  // 2. Submit Verification Code & Sign In
  // --------------------------------------------------------------------------
  const handleVerifyCodeSignIn = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = (email || name || "").trim();
    if (!targetEmail) {
      setErrorMsg("Please provide your email address.");
      return;
    }
    if (!verificationCode || verificationCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code received on your email.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = verifyEmailCodeAndLogin({
        email: targetEmail,
        code: verificationCode.trim(),
        role: selectedRole,
      });

      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || "Verification failed. Please check the code or click Resend.");
      } else {
        setSuccessMsg("Verification successful! Accessing DocuSphere workspace...");
      }
    }, 400);
  };

  // --------------------------------------------------------------------------
  // 3. Submit Password Sign In
  // --------------------------------------------------------------------------
  const handlePasswordSignIn = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const identifier = (name || email || "").trim();
    if (!identifier) {
      setErrorMsg("Please enter your Full Name or Email address.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your Password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = login({
        nameOrEmail: identifier,
        password: password,
        role: selectedRole,
      });

      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Authentication failed. Check your password.");
      }
    }, 400);
  };

  // --------------------------------------------------------------------------
  // 4. Submit Sign Up (First Time User: Create Account with Password)
  // --------------------------------------------------------------------------
  const handleSignUp = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Please provide your Full Name or Username.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please provide a valid Email address.");
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
      } else {
        setSuccessMsg(
          `Account created for ${result.user.name}! Accessing your workspace...`
        );
      }
    }, 450);
  };

  // --------------------------------------------------------------------------
  // 5. Submit Forgot Password Reset
  // --------------------------------------------------------------------------
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const identifier = (name || email || "").trim();
    if (!identifier) {
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
        nameOrEmail: identifier,
        newPassword: password,
      });

      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setMode("signin");
          setSignInMethod("password");
          setSuccessMsg("Password updated! Sign in with your new credentials.");
        }, 1200);
      } else {
        setErrorMsg(result.error);
      }
    }, 450);
  };

  // Workspace Roles definition
  const roleOptions = [
    {
      id: ROLES.ADMIN,
      label: "Admin",
      badge: "Full Access",
      dotColor: "bg-purple-600",
      activeBorder: "border-purple-600 ring-2 ring-purple-600/20",
    },
    {
      id: ROLES.AUDITOR,
      label: "Auditor",
      badge: "Compliance",
      dotColor: "bg-amber-500",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
    },
    {
      id: ROLES.EDITOR,
      label: "Editor",
      badge: "Curator",
      dotColor: "bg-blue-600",
      activeBorder: "border-blue-600 ring-2 ring-blue-600/20",
    },
    {
      id: ROLES.USER,
      label: "User",
      badge: "Reader",
      dotColor: "bg-emerald-500",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
    },
  ];

  return (
    <div className="relative h-screen w-screen flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDE: 3D ALIVE SPHERE CANVAS (IMAGE 1)                   */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[56%] h-full relative overflow-hidden bg-[#0A0D1E]">
        <DocuSphereVisualizer />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT SIDE: AUTH FORM (IMAGE 2)                              */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full lg:w-[48%] xl:w-[44%] h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-xl lg:shadow-none z-10 overflow-y-auto">
        {/* Top Controls: Mobile Brand & Icon-only Theme Toggle (No "Dark" text) */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              DocuSphere-AI
            </span>
          </div>

          {/* Theme switcher: Icon only (The word "Dark" has been removed) */}
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-2xs cursor-pointer"
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-1">
          {/* Top Segmented Navigation: [ Sign In ] vs [ Sign Up ] */}
          {mode !== "forgot" ? (
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200/70 dark:border-slate-700/60 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                  setIsCodeSent(false);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                  mode === "signin"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer ${
                  mode === "signup"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Reset Password</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update credentials to restore workspace access
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Heading */}
          {mode !== "forgot" && (
            <div className="mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {mode === "signin"
                  ? "Please enter your credentials to access your workspace."
                  : "Register with password for first-time access to DocuSphere."}
              </p>
            </div>
          )}

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Verification Code Sent Confirmation (Code is NOT shown on screen) */}
          {isCodeSent && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-3 text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in">
              <Mail className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>
                A 6-digit verification code has been dispatched to <b>{email}</b>. Please check your inbox and enter the code below.
              </span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* A. SIGN IN FLOW                                               */}
          {/* ------------------------------------------------------------- */}
          {mode === "signin" && (
            <div>
              {/* Method Switcher: Email Verification Code vs Password */}
              <div className="flex items-center justify-between mb-3.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Authentication Method:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("email_code");
                      setErrorMsg("");
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      signInMethod === "email_code"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Email Verification Code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("password");
                      setErrorMsg("");
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      signInMethod === "password"
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Password
                  </button>
                </div>
              </div>

              {/* FLOW 1: EMAIL VERIFICATION CODE (CODE SENT TO EMAIL ONLY) */}
              {signInMethod === "email_code" ? (
                <form
                  onSubmit={
                    isCodeSent ? handleVerifyCodeSignIn : handleSendVerificationCode
                  }
                  className="space-y-3.5"
                >
                  {/* Field: Email ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                        Registered Email ID <span className="text-rose-500">*</span>
                      </label>
                      {isCodeSent && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCodeSent(false);
                            setVerificationCode("");
                          }}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                        >
                          Change Email
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        disabled={isCodeSent}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alex.vance@docusphere.ai"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition disabled:opacity-75 disabled:bg-slate-50 dark:disabled:bg-slate-900"
                      />
                    </div>
                  </div>

                  {/* Field: 6-Digit Verification Code (Visible when code is sent to email) */}
                  {isCodeSent && (
                    <div className="animate-in fade-in duration-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                          Verification Code <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          disabled={resendCountdown > 0 || isLoading}
                          onClick={handleSendVerificationCode}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>
                            {resendCountdown > 0
                              ? `Resend in ${resendCountdown}s`
                              : "Resend Code"}
                          </span>
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-400">
                          <KeyRound className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(
                              e.target.value.replace(/[^0-9]/g, "")
                            )
                          }
                          placeholder="Enter 6-digit code from email"
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-mono tracking-widest text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Workspace Role Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                        Select Workspace Role <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Determines document privileges
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((opt) => {
                        const isSelected = selectedRole === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedRole(opt.id)}
                            className={`relative flex items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                              isSelected
                                ? `${opt.activeBorder} bg-purple-50/40 dark:bg-purple-950/20 text-slate-900 dark:text-white`
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${opt.dotColor}`}
                                />
                                <span className="font-bold text-xs sm:text-sm">
                                  {opt.label}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                {opt.badge}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600/20"
                      />
                      <span>Remember my session on this device</span>
                    </label>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1.5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:scale-[1.008] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    <span>
                      {isLoading
                        ? "Processing..."
                        : isCodeSent
                        ? "Verify Code & Sign In"
                        : "Send Verification Code →"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                /* FLOW 2: STANDARD PASSWORD SIGN IN */
                <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name or Username <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Vance or alex@docusphere.ai"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                        Select Workspace Role <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Determines document privileges
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((opt) => {
                        const isSelected = selectedRole === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setSelectedRole(opt.id)}
                            className={`relative flex items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                              isSelected
                                ? `${opt.activeBorder} bg-purple-50/40 dark:bg-purple-950/20 text-slate-900 dark:text-white`
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${opt.dotColor}`}
                                />
                                <span className="font-bold text-xs sm:text-sm">
                                  {opt.label}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                {opt.badge}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600/20"
                      />
                      <span>Remember my session on this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1.5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:scale-[1.008] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  >
                    <span>{isLoading ? "Signing in..." : "Sign In to DocuSphere"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* B. SIGN UP FLOW (FIRST TIME USER CREATES ACCOUNT W/ PASSWORD) */}
          {/* ------------------------------------------------------------- */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Full Name or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rachel.adams@enterprise.ai"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 4 chars"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Select User Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedRole(opt.id)}
                        className={`flex items-center justify-between rounded-xl border p-2 text-left transition cursor-pointer ${
                          isSelected
                            ? `${opt.activeBorder} bg-purple-50/40 dark:bg-purple-950/20 text-slate-900 dark:text-white`
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${opt.dotColor}`}
                          />
                          <span className="font-bold text-xs">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:scale-[1.008] active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? "Creating Account..."
                    : "Create Account & Sign In"}
                </span>
                <UserCheck className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* C. FORGOT PASSWORD FLOW                                       */}
          {/* ------------------------------------------------------------- */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Name or Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your registered name or email"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
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
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 sm:py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading ? "Updating..." : "Reset Password & Continue"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer: Protected by Enterprise SSO & Partner Logos */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span>Protected by Enterprise SSO</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            {/* Microsoft 4-square logo */}
            <div
              className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 opacity-70 hover:opacity-100 transition"
              title="Microsoft Azure AD SSO"
            >
              <div className="bg-[#f25022] rounded-2xs" />
              <div className="bg-[#7fba00] rounded-2xs" />
              <div className="bg-[#00a4ef] rounded-2xs" />
              <div className="bg-[#ffb900] rounded-2xs" />
            </div>

            {/* Google 'G' icon */}
            <svg
              className="w-3.5 h-3.5 opacity-70 hover:opacity-100 transition"
              viewBox="0 0 24 24"
              title="Google Workspace SSO"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            {/* Key / Passkey icon */}
            <Key
              className="w-3.5 h-3.5 opacity-70 hover:opacity-100 transition"
              title="FIDO2 / WebAuthn Hardware Passkeys"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
