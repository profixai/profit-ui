import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((username: string, password: string): boolean => {
    const cred = MOCK_CREDENTIALS[username];
    if (cred && cred.password === password) {
      setUser({ username, role: cred.role, displayName: cred.displayName });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
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
