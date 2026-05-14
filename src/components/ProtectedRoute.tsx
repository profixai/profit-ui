import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  // Kept in the signature so any lingering call sites still compile; ignored
  // under the simplified single-user MVP.
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
