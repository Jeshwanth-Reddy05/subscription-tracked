import { Navigate } from "react-router";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({ children, requiredRole }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    // Redirect to login if unauthorized
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to dashboard if wrong role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
