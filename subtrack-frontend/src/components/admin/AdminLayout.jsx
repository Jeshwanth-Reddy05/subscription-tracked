import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "../../store/authStore";
import NavBar from "../NavBar";
import AdminSidebar from "./AdminSidebar";
import ProtectedRoute from "../ProtectedRoute";
import * as styles from "../../styles/common";

function AdminLayout() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Double security guard checking permissions
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={`${styles.pageBackground} transition-colors duration-300 font-sans`}>
        
        {/* Sticky top Navigation Header */}
        <NavBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Admin Left Sidebar */}
        <AdminSidebar />
        
        {/* Backdrop for mobile sizes */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-[2px] z-25 lg:hidden transition-all duration-300"
          ></div>
        )}

        {/* Content Container */}
        <main className="lg:pl-64 pt-14 min-h-screen transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayout;
