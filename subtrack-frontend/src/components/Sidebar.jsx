import { Link, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { useSubscriptionStore } from "../store/subscriptionStore";
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Settings,
  Shield,
  HelpCircle
} from "lucide-react";
import * as styles from "../styles/common";

function Sidebar({ isOpen }) {
  const user = useAuthStore((state) => state.user);
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const location = useLocation();

  const links = [
    {
      name: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Subscriptions",
      path: "/dashboard/subscriptions",
      icon: CreditCard,
    },
    {
      name: "Analytics & Trends",
      path: "/dashboard/analytics",
      icon: TrendingUp,
    },
    {
      name: "Account Settings",
      path: "/dashboard/settings",
      icon: Settings,
    },
  ];

  // Calculate monthly total
  const monthlyTotal = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((acc, sub) => {
      const price = sub.price || 0;
      return acc + (sub.billingCycle === "monthly" ? price : price / 12);
    }, 0);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed inset-y-[52px] left-0 w-64 bg-white border-r border-[#e8e8ed] z-30 transition-transform duration-300 transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col justify-between p-4 font-sans select-none">
        <div className="space-y-6">
          {/* Active User Panel */}
          <div className="p-3 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ebebf0] text-[#1d1d1f] font-extrabold flex items-center justify-center text-sm uppercase border border-[#d2d2d7]">
              {user?.name?.substring(0, 2) || "US"}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-[#1d1d1f] truncate">
                {user?.name}
              </h4>
              <p className="text-[10px] text-[#6e6e73] truncate mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#a1a1a6] uppercase tracking-widest px-3 mb-2.5">
              Navigation
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? "text-[#0066cc] bg-[#f5f5f7]"
                      : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-[#0066cc]" : "text-[#a1a1a6]"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Admin Console Option */}
            {user?.role === "admin" && (
              <div className="pt-4 border-t border-[#e8e8ed] mt-4 space-y-1">
                <p className="text-[9px] font-bold text-[#a1a1a6] uppercase tracking-widest px-3 mb-2">
                  System Admin
                </p>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    location.pathname.startsWith("/admin")
                      ? "text-[#0066cc] bg-[#f5f5f7]"
                      : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                >
                  <Shield className={`w-4 h-4 ${location.pathname.startsWith("/admin") ? "text-[#0066cc]" : "text-[#a1a1a6]"}`} />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Floating Mini Summary Widget */}
        <div className="space-y-3.5">
          <div className="p-3.5 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed]">
            <div className="flex items-center mb-2">
              <span className="text-[10px] font-bold text-[#a1a1a6] uppercase tracking-wider">
                Monthly Burn Rate
              </span>
            </div>
            <h3 className="text-lg font-black text-[#1d1d1f] tracking-tight">
              ${monthlyTotal.toFixed(2)}
            </h3>
            <p className="text-[9px] text-[#6e6e73] leading-normal mt-1">
              Based on {subscriptions.filter((s) => s.status === "active").length} active services.
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#a1a1a6] px-2 font-semibold">
            <span className="hover:text-[#6e6e73] cursor-pointer flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Help Support
            </span>
            <span>v1.2.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
