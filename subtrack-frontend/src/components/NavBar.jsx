import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { Sparkles, Bell, Menu, ChevronDown } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import UserDropdown from "./UserDropdown";
import * as styles from "../styles/common";

function Navbar({ onToggleSidebar }) {
  const user = useAuthStore((state) => state.user);
  const notifications = useSubscriptionStore((state) => state.notifications);
  const location = useLocation();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  return (
    <nav className={styles.navbarClass}>
      <div className={styles.navContainerClass}>
        {/* Left Side Brand */}
        <div className="flex items-center gap-3">
          {!isAuthPage && user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066cc] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className={styles.navBrandClass}>SubTrack</span>
            </div>
          </Link>
        </div>

        {/* Right Side Options */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logged in users get notifications & dropdown */}
          {!isAuthPage && user && (
            <>
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsUserOpen(false);
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer relative ${
                    isNotifOpen
                      ? "bg-[#ebebf0] text-[#0066cc]"
                      : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                  title="Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ff3b30] text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* User Dropdown Profile Wrapper */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserOpen(!isUserOpen);
                    setIsNotifOpen(false);
                  }}
                  className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-xl transition cursor-pointer select-none ${
                    isUserOpen
                      ? "bg-[#ebebf0] text-[#1d1d1f]"
                      : "hover:bg-[#f5f5f7] text-[#6e6e73]"
                  }`}
                >
                  {/* Avatar using name initials */}
                  <div className="w-6.5 h-6.5 rounded-lg bg-[#ebebf0] text-[#1d1d1f] border border-[#d2d2d7] font-bold flex items-center justify-center text-[10px] uppercase">
                    {user.name.substring(0, 2)}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none text-left">
                    <span className="text-xs font-bold text-[#1d1d1f] max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                    <span className="text-[9px] font-semibold text-[#a1a1a6]">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#a1a1a6]" />
                </button>
                <UserDropdown isOpen={isUserOpen} onClose={() => setIsUserOpen(false)} />
              </div>
            </>
          )}

          {isAuthPage && (
            <div className="flex gap-2">
              <Link
                to={location.pathname === "/register" ? "/" : "/register"}
                className={styles.secondaryBtn}
              >
                {location.pathname === "/register" ? "Sign In" : "Register"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;