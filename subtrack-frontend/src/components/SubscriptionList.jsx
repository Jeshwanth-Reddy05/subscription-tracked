import { useState, useMemo, useEffect } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useToastStore } from "../store/toastStore";
import SubscriptionCard from "./SubscriptionCard";
import SubscriptionDetails from "./SubscriptionDetails";
import EditSubscriptionModal from "./EditSubscriptionModal";
import DeleteSubscriptionModal from "./DeleteSubscriptionModal";
import SubscriptionForm from "./SubscriptionForm";
import { Search, Filter, ArrowUpDown, CreditCard, HelpCircle, Plus, X, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

const CATEGORIES = ["All", "Entertainment", "Software", "Utilities", "Health", "Work", "Others"];

function SubscriptionList({ onAddClick, onEdit, onDelete, onInspect }) {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const loadingSubs = useSubscriptionStore((state) => state.loading);
  const globalError = useSubscriptionStore((state) => state.error);

  const refreshSubscriptions = useSubscriptionStore((state) => state.refreshSubscriptions);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription);
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription);
  const toggleStatus = useSubscriptionStore((state) => state.toggleStatus);

  // States for standalone modals
  const [selectedSub, setSelectedSub] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);
  const addToast = useToastStore((state) => state.addToast);

  // Fetch subscriptions on mount
  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  // CRUD actions handlers
  const handleAddSubmit = async (formData) => {
    try {
      await addSubscription(formData);
      setIsAddOpen(false);
      addToast("Subscription tracker added successfully!", "success");
    } catch (err) {
      console.error("Failed to add subscription:", err);
      addToast(err.response?.data?.message || "Failed to create subscription tracker.", "error");
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateSubscription(editingSub._id, formData);
      setEditingSub(null);
      if (selectedSub && selectedSub._id === editingSub._id) {
        setSelectedSub({ ...selectedSub, ...formData });
      }
      addToast("Subscription tracker updated successfully!", "success");
    } catch (err) {
      console.error("Failed to update subscription:", err);
      addToast(err.response?.data?.message || "Failed to edit subscription.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubscription(deletingSub._id);
      setDeletingSub(null);
      setSelectedSub(null);
      addToast("Subscription tracker deleted successfully!", "success");
    } catch (err) {
      console.error("Failed to delete subscription:", err);
      addToast(err.response?.data?.message || "Failed to delete subscription.", "error");
    }
  };

  const handleToggleStatus = async (sub) => {
    try {
      await toggleStatus(sub);
      setSelectedSub(null);
      addToast(`${sub.serviceName} status updated successfully.`, "success");
    } catch (err) {
      console.error("Failed to toggle status:", err);
      addToast(err.response?.data?.message || "Failed to toggle subscription status.", "error");
    }
  };

  const handleAddClick = onAddClick || (() => setIsAddOpen(true));
  const handleInspect = onInspect || ((sub) => setSelectedSub(sub));
  const handleEdit = onEdit || ((sub) => setEditingSub(sub));
  const handleDelete = onDelete || ((subId) => setDeletingSub(subscriptions.find(s => s._id === subId)));

  // Listen to global errors and toast them
  useEffect(() => {
    if (globalError) {
      addToast(globalError, "error");
    }
  }, [globalError, addToast]);

  // States for search & filter
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // 'All', 'active', 'cancelled'
  const [sortBy, setSortBy] = useState("renewalDate"); // 'name', 'price', 'renewalDate'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'


  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // Perform search, filter, and sorting
  const filteredSubs = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search filter
        const matchesSearch = sub.serviceName.toLowerCase().includes(search.toLowerCase());
        
        // Category filter
        const matchesCategory = selectedCategory === "All" || sub.category === selectedCategory;

        // Status filter
        const matchesStatus =
          selectedStatus === "All" ||
          (selectedStatus === "active" && sub.status === "active") ||
          (selectedStatus === "cancelled" && sub.status === "cancelled");

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA = a[sortBy];
        let fieldB = b[sortBy];

        // Format dates or strings
        if (sortBy === "renewalDate" || sortBy === "createdAt") {
          fieldA = new Date(fieldA).getTime();
          fieldB = new Date(fieldB).getTime();
        } else if (typeof fieldA === "string") {
          fieldA = fieldA.toLowerCase();
          fieldB = fieldB.toLowerCase();
        }

        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [subscriptions, search, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Calculate matching stats
  const filteredTotal = useMemo(() => {
    return filteredSubs
      .filter((s) => s.status === "active")
      .reduce((acc, s) => acc + (s.billingCycle === "monthly" ? s.price : s.price / 12), 0);
  }, [filteredSubs]);

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={styles.headingClass}>
            My Subscriptions
          </h2>
          <p className={styles.mutedText}>
            Manage, filter, and inspect individual services.
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className={styles.primaryBtn}
        >
          <span>Add Subscription</span>
        </button>
      </div>




      {/* Grid control filters */}
      <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 space-y-4">
        
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${styles.inputClass} pl-9.5 text-xs py-2`}
            />
          </div>

          {/* Sorter Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[#a1a1a6] text-[10px] font-bold uppercase tracking-wider">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort By</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] transition font-semibold"
            >
              <option value="renewalDate">Renewal Date</option>
              <option value="serviceName">Service Name</option>
              <option value="price">Price Fee</option>
              <option value="createdAt">Date Tracked</option>
            </select>

            <button
              onClick={toggleSortOrder}
              className="p-2 border border-[#d2d2d7] rounded-xl hover:bg-[#f5f5f7] text-[#6e6e73] transition cursor-pointer select-none text-[10px] font-semibold uppercase px-3"
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              {sortOrder === "asc" ? "Asc" : "Desc"}
            </button>
          </div>
        </div>

        {/* Filter categories tags row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#e8e8ed] pt-4 mt-2">
          
          {/* Categories tag slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <div className="flex items-center gap-1 text-[#a1a1a6] text-[10px] font-bold uppercase tracking-wider shrink-0 pr-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#0066cc] text-white"
                    : "bg-[#f5f5f7] hover:bg-[#ebebf0] text-[#1d1d1f] border border-[#e8e8ed]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedStatus("All")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition border cursor-pointer ${
                selectedStatus === "All"
                  ? "bg-[#ebebf0] border-[#d2d2d7] text-[#1d1d1f]"
                  : "bg-transparent border-[#e8e8ed] text-[#6e6e73]"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus("active")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition border cursor-pointer ${
                selectedStatus === "active"
                  ? "bg-[#34c759]/10 border-[#34c759]/20 text-[#248a3d]"
                  : "bg-transparent border-[#e8e8ed] text-[#6e6e73]"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus("cancelled")}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase transition border cursor-pointer ${
                selectedStatus === "cancelled"
                  ? "bg-[#ff3b30]/10 border-[#ff3b30]/20 text-[#cc2f26]"
                  : "bg-transparent border-[#e8e8ed] text-[#6e6e73]"
              }`}
            >
              Cancelled
            </button>
          </div>

        </div>
      </div>

      {/* Matching Results Total Bar */}
      {filteredSubs.length > 0 && (
        <div className="p-4 bg-[#0066cc]/[0.04] border border-[#0066cc]/10 rounded-2xl flex items-center justify-between text-xs font-semibold text-[#1d1d1f]">
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#0066cc]" />
            Showing {filteredSubs.length} active matching subscription configurations.
          </span>
          <span>
            Matching Cost Burn: <span className="text-[#0066cc] font-bold">${filteredTotal.toFixed(2)}/mo</span>
          </span>
        </div>
      )}

      {/* Grid of Cards */}
      {loadingSubs ? (
        <div className={styles.loadingClass}>
          Syncing records with cloud database...
        </div>
      ) : globalError ? (
        <div className={styles.errorClass}>
          Error loading subscriptions: {globalError}
        </div>
      ) : filteredSubs.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-white border border-[#e8e8ed] p-8 rounded-2xl">
          <HelpCircle className="w-12 h-12 text-[#a1a1a6] mb-3 animate-pulse" />
          <h4 className={styles.subHeadingClass}>Zero matching records</h4>
          <p className={`${styles.mutedText} mt-1 max-w-sm`}>
            No subscriptions matched your current search parameters. Try expanding your search queries or adding a new service!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubs.map((sub) => (
            <SubscriptionCard
              key={sub._id}
              sub={sub}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onInspect={handleInspect}
            />
          ))}
        </div>
      )}

      {/* --- STANDALONE MODALS OVERLAYS --- */}
      {selectedSub && (
        <SubscriptionDetails
          sub={selectedSub}
          onClose={() => setSelectedSub(null)}
          onEdit={handleEdit}
          onDelete={(subId) => setDeletingSub(subscriptions.find(s => s._id === subId))}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
          {/* Backdrop */}
          <div onClick={() => setIsAddOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity duration-300"></div>

          {/* Dialog Container */}
          <div className="relative bg-white border border-[#e8e8ed] rounded-2xl w-full max-w-lg mx-4 p-8 z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-[#e8e8ed] pb-3">
              <div>
                <h3 className={styles.subHeadingClass}>
                  Add Subscription
                </h3>
                <p className={`${styles.mutedText} text-[11px] mt-0.5`}>
                  Track a new recurring billing cycle
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] transition-colors cursor-pointer hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <SubscriptionForm
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddOpen(false)}
              loading={loadingSubs}
            />
          </div>
        </div>
      )}

      {editingSub && (
        <EditSubscriptionModal
          isOpen={!!editingSub}
          sub={editingSub}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingSub(null)}
          loading={loadingSubs}
        />
      )}

      {deletingSub && (
        <DeleteSubscriptionModal
          isOpen={!!deletingSub}
          subName={deletingSub.serviceName}
          onConfirmDelete={handleDeleteConfirm}
          onConfirmPause={() => handleToggleStatus(deletingSub)}
          onCancel={() => setDeletingSub(null)}
          loading={loadingSubs}
        />
      )}
      
      {loadingSubs && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#f5f5f7]/95 border border-[#e8e8ed] px-4 py-2.5 rounded-full flex items-center gap-3 backdrop-blur-md">
          <Loader2 className="w-4 h-4 animate-spin text-[#0066cc]" />
          <span className="text-[11px] font-semibold text-[#1d1d1f]">Synchronizing database...</span>
        </div>
      )}
    </div>
  );
}

export default SubscriptionList;

