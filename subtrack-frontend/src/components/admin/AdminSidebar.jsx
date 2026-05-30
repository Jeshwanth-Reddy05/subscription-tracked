import { Link, useLocation } from "react-router";
import { LayoutDashboard, Users, BarChart3, ArrowLeft, ShieldCheck } from "lucide-react";
import * as styles from "../../styles/common";

function AdminSidebar() {
  const location = useLocation();

  const links = [
    {
      name: "Overview",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "System Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed inset-y-14 left-0 w-64 bg-white border-r border-[#e8e8ed] z-30 transition-transform duration-300 font-sans select-none">
      <div className="h-full flex flex-col justify-between p-4">
        <div className="space-y-6">
          
          {/* Header Console Tag */}
          <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0066cc] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-[#1d1d1f] leading-none">Console Admin</h4>
              <p className={`${styles.mutedText} text-[9px] mt-1 uppercase tracking-wider font-semibold leading-none`}>System Security</p>
            </div>
          </div>

          {/* Links list */}
          <div className="space-y-1">
            <p className={`${styles.mutedText} text-[9px] uppercase tracking-widest px-3 mb-2.5`}>
              Control Panel
            </p>
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-[#f5f5f7] text-[#0066cc] border-l-4 border-[#0066cc] rounded-l-none"
                      : "text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${active ? "text-[#0066cc]" : "text-[#a1a1a6]"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

        </div>

        {/* Return Button */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-[#a1a1a6]" />
          <span>Exit Console</span>
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
