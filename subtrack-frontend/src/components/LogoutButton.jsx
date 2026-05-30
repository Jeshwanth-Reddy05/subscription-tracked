import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";

function LogoutButton({ className = "" }) {
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 ${className}`}
      title="Sign Out"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span>Sign Out</span>
    </button>
  );
}

export default LogoutButton;
