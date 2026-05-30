import { useState } from "react";
import { 
  Search, 
  User, 
  Shield, 
  Trash2, 
  ShieldAlert,
  SlidersHorizontal,
  Mail,
  CalendarDays
} from "lucide-react";
import * as styles from "../../styles/common";

function UserTable({ users, onUpdateRole, onDeleteUser, currentUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Filtering Tools Panel */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl p-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a6]" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#d2d2d7] rounded-xl text-xs text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0066cc] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-[#6e6e73] shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-[#d2d2d7] rounded-xl px-3 py-2 text-xs font-semibold text-[#1d1d1f] focus:outline-none focus:border-[#0066cc]"
          >
            <option value="all">All Roles</option>
            <option value="user">Standard User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-white border border-[#e8e8ed] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed] text-[#6e6e73] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8ed] text-[#6e6e73] font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className={styles.emptyStateClass}>
                    No matching users found system-wide.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelf = user._id === currentUser?._id;
                  
                  return (
                    <tr 
                      key={user._id} 
                      className={`hover:bg-[#f5f5f7]/50 transition-colors duration-150 ${isSelf ? 'bg-[#0066cc]/[0.02]' : ''}`}
                    >
                      {/* Name & Email Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full shrink-0 ${
                            user.role === "admin" 
                              ? "bg-[#0066cc]/10 text-[#0066cc] border border-[#0066cc]/20" 
                              : "bg-[#f5f5f7] text-[#6e6e73] border border-[#e8e8ed]"
                          }`}>
                            {user.role === "admin" ? <ShieldAlert className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-[#1d1d1f] text-sm flex items-center gap-1.5">
                              {user.name}
                              {isSelf && (
                                <span className="text-[9px] font-bold text-[#0066cc] bg-[#0066cc]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#6e6e73] flex items-center gap-1.5 mt-0.5 font-normal">
                              <Mail className="w-3.5 h-3.5 text-[#a1a1a6] shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 text-[#6e6e73] font-normal">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-[#a1a1a6] shrink-0" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* Role selection */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          user.role === "admin" 
                            ? "bg-[#0066cc]/10 text-[#0066cc] border-[#0066cc]/20" 
                            : "bg-[#5e5e6e]/10 text-[#5e5e6e] border-[#5e5e6e]/20"
                        }`}>
                          {user.role === "admin" ? "System Admin" : "Standard User"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Toggle Button */}
                          <button
                            onClick={() => onUpdateRole(user._id, user.role === "admin" ? "user" : "admin")}
                            disabled={isSelf}
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              isSelf
                                ? "opacity-30 cursor-not-allowed border-[#e8e8ed]"
                                : "border-[#e8e8ed] hover:bg-[#f5f5f7] hover:text-[#0066cc] hover:border-[#d2d2d7] text-[#a1a1a6] cursor-pointer"
                            }`}
                            title={user.role === "admin" ? "Demote User to standard" : "Promote User to admin"}
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteUser(user._id)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl border transition-all duration-200 ${
                              isSelf
                                ? "opacity-30 cursor-not-allowed border-[#e8e8ed]"
                                : "border-[#e8e8ed] hover:bg-[#ff3b30]/10 hover:text-[#ff3b30] hover:border-[#ff3b30]/20 text-[#a1a1a6] cursor-pointer"
                            }`}
                            title="Delete user from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserTable;
