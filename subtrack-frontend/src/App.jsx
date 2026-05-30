import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Components
import Login from "./components/Login";
import Register from "./components/Register";

// Dashboard Master Layout & Nested Views
import Dashboard from "./components/Dashboard";
import DashboardOverview from "./components/DashboardOverview";
import SubscriptionList from "./components/SubscriptionList";
import AnalyticsOverview from "./components/AnalyticsOverview";
import Settings from "./components/Settings";

// Admin Master Layout & Nested Views
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageUsers from "./components/admin/ManageUsers";
import SystemAnalytics from "./components/admin/SystemAnalytics";
import ToastContainer from "./components/ToastContainer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Portals */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Workspace (Nested Routes) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Overview home landing */}
          <Route index element={<DashboardOverview />} />
          
          {/* Full grid CRUD dashboard list */}
          <Route path="subscriptions" element={<SubscriptionList />} />
          
          {/* Analytics dashboard & custom SVG charts */}
          <Route path="analytics" element={<AnalyticsOverview />} />
          
          {/* Tabbed credentials settings panel */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Protected Control Console Workspace (Nested Routes) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin overview metrics */}
          <Route index element={<AdminDashboard />} />
          
          {/* System user base management table */}
          <Route path="users" element={<ManageUsers />} />
          
          {/* Global platform revenue statistics */}
          <Route path="analytics" element={<SystemAnalytics />} />
        </Route>

        {/* Wildcard redirect fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;