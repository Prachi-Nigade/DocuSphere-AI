import React, { createContext, useContext, useState, useEffect } from "react";

export const ROLES = {
  ADMIN: "admin",
  AUDITOR: "auditor",
  EDITOR: "editor",
  USER: "user",
};

export const PRESET_USERS = {
  [ROLES.ADMIN]: {
    id: "usr-admin",
    name: "Alex Vance",
    email: "alex.vance@docusphere.ai",
    password: "password123",
    role: ROLES.ADMIN,
    title: "Chief AI & Security Admin",
    department: "Enterprise SecOps",
    avatar: "AV",
    color: "from-purple-600 to-indigo-600",
    badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    description:
      "Full unrestricted privileges: manage documents, delete knowledge, re-index, manage roles, and review security audit logs.",
  },
  [ROLES.AUDITOR]: {
    id: "usr-auditor",
    name: "Elena Rostova",
    email: "elena.rostova@compliance.ai",
    password: "password123",
    role: ROLES.AUDITOR,
    title: "Lead Compliance Auditor",
    department: "Internal Risk & Audit",
    avatar: "ER",
    color: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    description:
      "Compliance & oversight: read-only verification of citations, vector coordinates, cryptographic integrity baselines, and audit logs.",
  },
  [ROLES.EDITOR]: {
    id: "usr-editor",
    name: "Marcus Chen",
    email: "marcus.chen@content.ai",
    password: "password123",
    role: ROLES.EDITOR,
    title: "Knowledge Base Curator",
    department: "Data Engineering",
    avatar: "MC",
    color: "from-blue-600 to-cyan-600",
    badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    description:
      "Content management: upload documents, trigger semantic re-indexing, create and rename inquiry threads, and export insights.",
  },
  [ROLES.USER]: {
    id: "usr-user",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@analyst.org",
    password: "password123",
    role: ROLES.USER,
    title: "Research Analyst",
    department: "Business Operations",
    avatar: "SJ",
    color: "from-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    description:
      "Standard reader: query indexed knowledge base, inspect cited evidence passages, share insights to WhatsApp/socials, and export chats.",
  },
};

const DEFAULT_USERS_LIST = Object.values(PRESET_USERS);

export const PERMISSION_MATRIX = [
  {
    key: "queryChat",
    label: "Ask Questions & Conversational RAG",
    description: "Query indexed vector documents with automatic citations",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: true,
  },
  {
    key: "inspectCitations",
    label: "Inspect Ground-Truth Citations",
    description:
      "Open Side-by-Side viewer to verify paragraph highlights & page sources",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: true,
  },
  {
    key: "shareSocial",
    label: "Share Insights via WhatsApp & Socials",
    description:
      "Generate WhatsApp briefings, Twitter/X, LinkedIn, and snapshot links",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: true,
  },
  {
    key: "exportTranscripts",
    label: "Export Dialogue Transcripts (MD / PDF / JSON)",
    description: "Download verified conversation transcripts and references",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: true,
  },
  {
    key: "uploadDocuments",
    label: "Upload & Ingest Multi-Format Files",
    description:
      "Ingest PDF, Excel, Word, and Markdown into PostgreSQL pgvector",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: false,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: false,
  },
  {
    key: "reindexVectors",
    label: "Trigger Vector Re-indexing Pipeline",
    description:
      "Re-chunk documents and regenerate 1536-dim OpenAI vector embeddings",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: false,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: false,
  },
  {
    key: "deleteThreads",
    label: "Delete Conversation Threads",
    description: "Remove conversational sessions and message history",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: false,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: false,
  },
  {
    key: "deleteDocuments",
    label: "Purge Documents & Vector Chunks",
    description:
      "Permanently delete documents and associated vectors from pgvector",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: false,
    [ROLES.EDITOR]: false,
    [ROLES.USER]: false,
  },
  {
    key: "manageRbac",
    label: "Manage Roles & Access Policies",
    description: "Assign user roles and audit permission assignments",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: false,
    [ROLES.EDITOR]: false,
    [ROLES.USER]: false,
  },
  {
    key: "viewAuditLogs",
    label: "Inspect Security Audit Logs",
    description:
      "Review chronological security trail of RAG queries, uploads, and purges",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: false,
    [ROLES.USER]: false,
  },
  {
    key: "exportAuditReport",
    label: "Export Governance & Compliance Report",
    description: "Download formal compliance audit trail certificate",
    [ROLES.ADMIN]: true,
    [ROLES.AUDITOR]: true,
    [ROLES.EDITOR]: true,
    [ROLES.USER]: false,
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: "log-1",
    timestamp: "10 mins ago",
    user: "Alex Vance",
    role: ROLES.ADMIN,
    action: "SYSTEM_INIT",
    target: "PostgreSQL pgvector Engine",
    details: "Initialized semantic RAG pipeline with text-embedding-3-large",
    severity: "info",
  },
  {
    id: "log-2",
    timestamp: "8 mins ago",
    user: "Marcus Chen",
    role: ROLES.EDITOR,
    action: "AUTH_READY",
    target: "Authentication Gateway",
    details: "Secured user access control with role-based policies",
    severity: "info",
  },
];

const AuthRbacContext = createContext(null);

export function AuthRbacProvider({ children }) {
  // 1. Registered Users Database in localStorage
  const [usersDb, setUsersDb] = useState(() => {
    try {
      const saved = localStorage.getItem("docusphere_users_db_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load users DB", e);
    }
    return DEFAULT_USERS_LIST;
  });

  // 2. Active Authenticated User (null if not logged in)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem("docusphere_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.role) return parsed;
      }
    } catch (e) {
      console.warn("Could not load auth user", e);
    }
    return null; // Start as unauthenticated so starting login page appears!
  });

  // 3. Current active role (synced with authUser)
  const [currentRole, setCurrentRole] = useState(() => {
    return authUser?.role || localStorage.getItem("docusphere_role") || ROLES.ADMIN;
  });

  // 4. Audit logs
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("docusphere_audit_logs");
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);
  const [rbacModalTab, setRbacModalTab] = useState("matrix");

  // Save users DB
  useEffect(() => {
    try {
      localStorage.setItem("docusphere_users_db_v2", JSON.stringify(usersDb));
    } catch (e) {
      console.warn("Could not save users DB", e);
    }
  }, [usersDb]);

  // Save auth user
  useEffect(() => {
    if (authUser) {
      localStorage.setItem("docusphere_auth_user", JSON.stringify(authUser));
      localStorage.setItem("docusphere_role", authUser.role);
    } else {
      localStorage.removeItem("docusphere_auth_user");
    }
  }, [authUser]);

  // Save audit logs
  useEffect(() => {
    try {
      localStorage.setItem("docusphere_audit_logs", JSON.stringify(auditLogs));
    } catch (e) {
      console.warn("Could not save audit logs", e);
    }
  }, [auditLogs]);

  // Active current user computed
  const currentUser = authUser || PRESET_USERS[currentRole] || PRESET_USERS[ROLES.ADMIN];

  const logAuditEvent = (action, target, details, severity = "info") => {
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      user: currentUser?.name || "System User",
      role: currentRole,
      action,
      target,
      details,
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // -------------------------------------------------------------
  // Authentication Actions
  // -------------------------------------------------------------
  const login = ({ nameOrEmail, password, role }) => {
    const trimmedInput = (nameOrEmail || "").trim().toLowerCase();
    const targetRole = role || ROLES.USER;

    // Search existing user
    let user = usersDb.find(
      (u) =>
        u.name.toLowerCase() === trimmedInput ||
        (u.email && u.email.toLowerCase() === trimmedInput)
    );

    if (user) {
      // Check password
      if (user.password && user.password !== password) {
        return { success: false, error: "Incorrect password. Please try again or use Forgot Password." };
      }
      // Update role if selected explicitly
      if (role && user.role !== role) {
        user = { ...user, role: role, ...getRoleMetadata(role, user.name) };
        setUsersDb((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      }
    } else {
      // Create new user automatically on sign in with their given Name, Password, and Role!
      const displayName = nameOrEmail.trim();
      user = {
        id: `usr-${Date.now()}`,
        name: displayName,
        email: `${displayName.toLowerCase().replace(/\s+/g, ".")}@docusphere.ai`,
        password: password,
        role: targetRole,
        ...getRoleMetadata(targetRole, displayName),
      };
      setUsersDb((prev) => [user, ...prev]);
    }

    setAuthUser(user);
    setCurrentRole(user.role);
    logAuditEvent(
      "USER_LOGIN",
      user.name,
      `Signed in successfully with ${user.role.toUpperCase()} role privileges`,
      "security"
    );

    return { success: true, user };
  };

  const signup = ({ name, email, password, role }) => {
    const displayName = (name || "").trim();
    if (!displayName) {
      return { success: false, error: "Please enter your full name." };
    }
    if (!password || password.length < 4) {
      return { success: false, error: "Password must be at least 4 characters." };
    }

    const targetRole = role || ROLES.USER;
    const userEmail = email
      ? email.trim()
      : `${displayName.toLowerCase().replace(/\s+/g, ".")}@docusphere.ai`;

    // Check if duplicate email/name
    const existing = usersDb.find(
      (u) =>
        u.email.toLowerCase() === userEmail.toLowerCase() ||
        u.name.toLowerCase() === displayName.toLowerCase()
    );

    if (existing) {
      // Update existing record
      const updated = {
        ...existing,
        name: displayName,
        email: userEmail,
        password: password,
        role: targetRole,
        ...getRoleMetadata(targetRole, displayName),
      };
      setUsersDb((prev) => prev.map((u) => (u.id === existing.id ? updated : u)));
      setAuthUser(updated);
      setCurrentRole(targetRole);
      logAuditEvent(
        "USER_SIGNUP",
        displayName,
        `Account updated & authenticated as ${targetRole.toUpperCase()}`,
        "info"
      );
      return { success: true, user: updated };
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: userEmail,
      password: password,
      role: targetRole,
      ...getRoleMetadata(targetRole, displayName),
    };

    setUsersDb((prev) => [newUser, ...prev]);
    setAuthUser(newUser);
    setCurrentRole(targetRole);
    logAuditEvent(
      "USER_SIGNUP",
      displayName,
      `New user registered with ${targetRole.toUpperCase()} role`,
      "security"
    );

    return { success: true, user: newUser };
  };

  const forgotPassword = ({ nameOrEmail, newPassword }) => {
    const query = (nameOrEmail || "").trim().toLowerCase();
    if (!query) {
      return { success: false, error: "Please provide your registered Name or Email." };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: "New password must be at least 4 characters." };
    }

    const user = usersDb.find(
      (u) =>
        u.name.toLowerCase() === query ||
        (u.email && u.email.toLowerCase() === query)
    );

    if (user) {
      const updated = { ...user, password: newPassword };
      setUsersDb((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      logAuditEvent(
        "PASSWORD_RESET",
        user.name,
        "Password was reset successfully",
        "security"
      );
      return {
        success: true,
        message: `Password updated for ${user.name}! You can now sign in with your new password.`,
      };
    } else {
      // Auto-create/register so user is never stuck
      const displayName = nameOrEmail.trim();
      const newUser = {
        id: `usr-${Date.now()}`,
        name: displayName,
        email: `${displayName.toLowerCase().replace(/\s+/g, ".")}@docusphere.ai`,
        password: newPassword,
        role: ROLES.USER,
        ...getRoleMetadata(ROLES.USER, displayName),
      };
      setUsersDb((prev) => [newUser, ...prev]);
      logAuditEvent(
        "PASSWORD_RESET",
        displayName,
        "Registered password for requested user",
        "info"
      );
      return {
        success: true,
        message: `New account password registered for ${displayName}! You can now sign in.`,
      };
    }
  };

  const logout = () => {
    const previousName = currentUser?.name || "User";
    logAuditEvent(
      "USER_LOGOUT",
      previousName,
      "Logged out of DocuSphere-AI session",
      "info"
    );
    setAuthUser(null);
  };

  const switchRole = (newRole) => {
    if (PRESET_USERS[newRole]) {
      const previousRole = currentRole;
      setCurrentRole(newRole);
      if (authUser) {
        setAuthUser((prev) => ({
          ...prev,
          role: newRole,
          ...getRoleMetadata(newRole, prev.name),
        }));
      }
      logAuditEvent(
        "ROLE_SWITCH",
        `Switched to ${newRole.toUpperCase()}`,
        `Transitioned user context from ${previousRole.toUpperCase()} to ${newRole.toUpperCase()}`,
        "security"
      );
    }
  };

  // Permission checks computed for current role
  const permissions = {
    canUploadDocuments: currentRole === ROLES.ADMIN || currentRole === ROLES.EDITOR,
    canDeleteDocuments: currentRole === ROLES.ADMIN,
    canDeleteThreads: currentRole === ROLES.ADMIN || currentRole === ROLES.EDITOR,
    canReindexVectors: currentRole === ROLES.ADMIN || currentRole === ROLES.EDITOR,
    canManageRbac: currentRole === ROLES.ADMIN,
    canViewAuditLogs: currentRole === ROLES.ADMIN || currentRole === ROLES.AUDITOR,
    canExportAuditReport:
      currentRole === ROLES.ADMIN ||
      currentRole === ROLES.AUDITOR ||
      currentRole === ROLES.EDITOR,
    canQueryChat: true,
    canInspectCitations: true,
    canShareSocial: true,
    canExportTranscripts: true,
  };

  const openRbacModal = (tab = "matrix") => {
    setRbacModalTab(tab);
    setIsRbacModalOpen(true);
  };

  return (
    <AuthRbacContext.Provider
      value={{
        isAuthenticated: Boolean(authUser),
        authUser,
        currentRole,
        currentUser,
        usersDb,
        login,
        signup,
        forgotPassword,
        logout,
        switchRole,
        permissions,
        auditLogs,
        logAuditEvent,
        isRbacModalOpen,
        setIsRbacModalOpen,
        rbacModalTab,
        setRbacModalTab,
        openRbacModal,
        ROLES,
        PRESET_USERS,
        PERMISSION_MATRIX,
      }}
    >
      {children}
    </AuthRbacContext.Provider>
  );
}

function getRoleMetadata(role, name = "User") {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";

  switch (role) {
    case ROLES.ADMIN:
      return {
        title: "Enterprise AI & Security Administrator",
        department: "SecOps & Governance",
        avatar: initials,
        color: "from-purple-600 to-indigo-600",
        badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      };
    case ROLES.AUDITOR:
      return {
        title: "Lead Compliance Auditor",
        department: "Risk & Governance Oversight",
        avatar: initials,
        color: "from-amber-500 to-orange-600",
        badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      };
    case ROLES.EDITOR:
      return {
        title: "Knowledge Base Curator",
        department: "Content & Data Ingestion",
        avatar: initials,
        color: "from-blue-600 to-cyan-600",
        badgeBg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
      };
    case ROLES.USER:
    default:
      return {
        title: "Research Analyst",
        department: "Operations & Research",
        avatar: initials,
        color: "from-emerald-600 to-teal-600",
        badgeBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
  }
}

export function useAuthRbac() {
  const context = useContext(AuthRbacContext);
  if (!context) {
    throw new Error("useAuthRbac must be used within an AuthRbacProvider");
  }
  return context;
}
