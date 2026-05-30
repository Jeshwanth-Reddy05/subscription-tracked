import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { AdminService } from "../../services/admin";
import UserTable from "./UserTable";
import { ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import * as styles from "../../styles/common";

function ManageUsers() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal confirm helper
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getUsers();
      // Handle array or object response formats
      const userList = data.users || data || [];
      setUsers(userList);
      setError(null);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.response?.data?.message || "Failed to retrieve registered user database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionProcessing(true);
      await AdminService.updateUserRole(userId, newRole);
      
      // Update local state to prevent unnecessary page reloads
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update role:", err);
      alert(err.response?.data?.message || "Unauthorized: Failed to update user privilege level.");
    } finally {
      setActionProcessing(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setDeleteConfirmId(userId);
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmId) return;
    try {
      setActionProcessing(true);
      await AdminService.deleteUser(deleteConfirmId);
      
      // Remove from local list
      setUsers((prev) => prev.filter((u) => u._id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.response?.data?.message || "Failed to remove user profile.");
    } finally {
      setActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingClass}>
        <p className="uppercase tracking-widest text-xs">Loading user base...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={styles.pageTitleClass}>
            Manage Users
          </h1>
          <p className={`${styles.mutedText} mt-1`}>
            Change administrative roles, monitor sign-up volumes, or delete accounts securely.
          </p>
        </div>

        {/* Counter Summary */}
        <div className="flex gap-4">
          <div className="bg-white border border-[#e8e8ed] px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-[#0066cc]" />
            <div>
              <p className={`${styles.mutedText} text-[9px] font-bold uppercase tracking-wider`}>Total Users</p>
              <h4 className="text-sm font-semibold text-[#1d1d1f]">{users.length}</h4>
            </div>
          </div>
          <div className="bg-white border border-[#e8e8ed] px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#5e5e6e]" />
            <div>
              <p className={`${styles.mutedText} text-[9px] font-bold uppercase tracking-wider`}>Admins</p>
              <h4 className="text-sm font-semibold text-[#1d1d1f]">
                {users.filter(u => u.role === 'admin').length}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className={styles.errorClass}>
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Database Sync Failed</h3>
              <p className="text-xs opacity-95 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <UserTable 
          users={users} 
          onUpdateRole={handleUpdateRole} 
          onDeleteUser={confirmDeleteUser} 
          currentUser={currentUser} 
        />
      )}

      {/* Hazard/Action processing indicators */}
      {actionProcessing && (
        <div className="fixed inset-0 bg-[#1d1d1f]/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 shadow-xl flex items-center gap-4 max-w-xs">
            <div className="w-5 h-5 border-2 border-[#0066cc] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-[#1d1d1f]">Processing database update...</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 text-[#ff3b30]">
              <div className="p-2 bg-[#ff3b30]/10 rounded-xl border border-[#ff3b30]/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold leading-none">Confirm User Erasure</h3>
            </div>
            <p className="text-xs text-[#6e6e73] mt-4 leading-relaxed">
              Are you absolutely certain you want to delete this user profile? This action will permanently wipe their credentials, profile metrics, and all associated subscriptions from the system database. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6 border-t border-[#e8e8ed] pt-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-[#ff3b30] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#d62c23] transition-colors cursor-pointer text-sm tracking-tight"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
