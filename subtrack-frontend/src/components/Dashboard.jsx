import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import * as styles from "../styles/common";

function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fallback Route Guard in case of rendering anomalies
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`${styles.pageBackground} font-sans`}>
      
      {/* Sticky top Navigation Header */}
      <NavBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Left Sidebar Menu Drawer */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Backdrop overlay on mobile sizes when sidebar is active */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-[2px] z-20 lg:hidden transition-all duration-300"
        ></div>
      )}

      {/* Main viewport area, offsets for sidebar width and navbar height */}
      <main className="lg:pl-64 pt-[52px] min-h-screen transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;