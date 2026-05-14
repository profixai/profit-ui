import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// Simplified MVP: single user type. The legacy role union is kept so
// non-MVP components still in src/ continue to type-check; "user" is
// what the active login flow always assigns. Nothing in the active
// MVP UI should branch on role.
export type UserRole = "user" | "inventory" | "manager" | "direction";

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

const MOCK_CREDENTIALS: Record<string, { password: string; displayName: string }> = {
  demo: { password: "demo2026", displayName: "Demo User" },
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
      const u: User = { username, role: "user", displayName: cred.displayName };
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

// Retained for backwards compatibility with any non-MVP page still importing
// it. Under the simplified single-user model this is a no-op.
export function useRequireRole(_allowed: UserRole[]) {
  useEffect(() => {
    /* no-op */
  }, []);
}

export function saveLastRoute(path: string) {
  sessionStorage.setItem(LAST_ROUTE_KEY, path);
}

export function getLastRoute(): string | null {
  return sessionStorage.getItem(LAST_ROUTE_KEY);
}
