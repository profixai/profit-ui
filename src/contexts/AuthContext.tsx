import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";


export type UserRole = "inventory" | "manager" | "direction";

interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_CREDENTIALS: Record<string, { password: string; role: UserRole; displayName: string }> = {
  inventory: { password: "inv2026", role: "inventory", displayName: "Inventory Staff" },
  manager: { password: "mgr2026", role: "manager", displayName: "Hotel Manager" },
  direction: { password: "dir2026", role: "direction", displayName: "Director" },
};

const SESSION_KEY = "pp_user";
const LAST_ROUTE_KEY = "pp_last_route";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username: string, password: string): boolean => {
    const cred = MOCK_CREDENTIALS[username];
    if (cred && cred.password === password) {
      const u = { username, role: cred.role, displayName: cred.displayName };
      setUser(u);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(LAST_ROUTE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role: user?.role ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireRole(allowed: UserRole[]) {
  const { role } = useAuth();
  // We use a deferred check — ProtectedRoute handles redirect.
  // This hook is an additional guard for programmatic checks.
  useEffect(() => {
    if (role && !allowed.includes(role)) {
      // Will be caught by ProtectedRoute, but log for debugging
      console.warn(`Role "${role}" not in allowed roles: ${allowed.join(", ")}`);
    }
  }, [role, allowed]);
}

export function saveLastRoute(path: string) {
  sessionStorage.setItem(LAST_ROUTE_KEY, path);
}

export function getLastRoute(): string | null {
  return sessionStorage.getItem(LAST_ROUTE_KEY);
}
