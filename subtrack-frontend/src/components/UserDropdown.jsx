import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { User, Settings, Shield } from "lucide-react";
import LogoutButton from "./LogoutButton";

function UserDropdown({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xl z-50 animate-fade-in origin-top-right overflow-hidden transition-all duration-300"
    >
      {/* Header Info */}
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20">
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Signed In As</p>
        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-0.5">{user?.name}</h4>
        <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">{user?.email}</p>
        {user?.role === "admin" && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-1.5 py-0.5 rounded-md mt-2 border border-indigo-100 dark:border-indigo-900/30">
            <Shield className="w-2.5 h-2.5" />
            Admin
          </span>
        )}
      </div>

      {/* Menu Actions */}
      <div className="p-1.5 space-y-0.5">
        <Link
          to="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-xs font-semibold transition cursor-pointer"
        >
          <User className="w-4 h-4 text-slate-400" />
          <span>Profile Profile</span>
        </Link>

        <Link
          to="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-xs font-semibold transition cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Preferences Settings</span>
        </Link>

        {user?.role === "admin" && (
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-xs font-bold transition cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Admin Console</span>
          </Link>
        )}
      </div>

      {/* Logout Row */}
      <div className="border-t border-slate-100 dark:border-zinc-800 p-1.5">
        <LogoutButton className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition text-left" />
      </div>
    </div>
  );
}

export default UserDropdown;
