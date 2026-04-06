import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth, getLastRoute } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

const roleHome: Record<string, string> = {
  inventory: "/inventory",
  manager: "/dashboard",
  direction: "/multi-property",
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // If already logged in, redirect away from login
  useEffect(() => {
    if (user) {
      const lastRoute = getLastRoute();
      navigate(lastRoute || roleHome[user.role] || "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      const role = username === "inventory" ? "inventory" : username === "manager" ? "manager" : "direction";
      navigate(roleHome[role] || "/dashboard");
    } else {
      toast.error("Invalid credentials. Try: inventory/inv2026, manager/mgr2026, or direction/dir2026");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Profix</h1>
          <p className="text-sm text-muted-foreground mt-1">AI profit intelligence for hotels</p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="inventory / manager / direction"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            <button className="text-primary hover:underline font-medium">
              Request property access
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
