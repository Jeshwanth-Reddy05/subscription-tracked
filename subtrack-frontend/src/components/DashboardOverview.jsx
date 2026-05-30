import { useState, useEffect } from "react";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useToastStore } from "../store/toastStore";
import DashboardHeader from "./DashboardHeader";
import ReminderBanner from "./ReminderBanner";
import SummaryCards from "./SummaryCards";
import UpcomingRenewals from "./UpcomingRenewals";
import RecentSubscriptions from "./RecentSubscriptions";
import SubscriptionDetails from "./SubscriptionDetails";
import EditSubscriptionModal from "./EditSubscriptionModal";
import DeleteSubscriptionModal from "./DeleteSubscriptionModal";
import SubscriptionForm from "./SubscriptionForm";
import { X, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

function DashboardOverview() {
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const loading = useSubscriptionStore((state) => state.loading);
  const storeError = useSubscriptionStore((state) => state.error);
  const refreshSubscriptions = useSubscriptionStore((state) => state.refreshSubscriptions);
  const addSubscription = useSubscriptionStore((state) => state.addSubscription);
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription);
  const deleteSubscription = useSubscriptionStore((state) => state.deleteSubscription);
  const toggleStatus = useSubscriptionStore((state) => state.toggleStatus);

  const [selectedSub, setSelectedSub] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    refreshSubscriptions();
  }, [refreshSubscriptions]);

  // Create subscription handler
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

  // Update subscription handler
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

  // Delete subscription handler
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

  // Pause / Cancel toggle handler
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

  // Watch for global subscription store errors to show them elegantly via toast
  useEffect(() => {
    if (storeError) {
      addToast(storeError, "error");
    }
  }, [storeError, addToast]);

  return (
    <div className="space-y-8 pb-12 font-sans select-none">
      
      {/* Reminder Banner for dues within 3 days */}
      <ReminderBanner />

      {/* Greeting Header */}
      <DashboardHeader 
        onAddClick={() => setIsAddOpen(true)} 
      />

      {/* Grid Stats Summary Row */}
      <SummaryCards />

      {/* Dual timeline grids (2 Column Desktop layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-7">
        <UpcomingRenewals onSelectSub={setSelectedSub} />
        <RecentSubscriptions onSelectSub={setSelectedSub} />
      </div>

      {/* --- CRUD MODALS OVERLAYS --- */}

      {/* Inspect Detail sheet */}
      {selectedSub && (
        <SubscriptionDetails
          sub={selectedSub}
          onClose={() => setSelectedSub(null)}
          onEdit={(sub) => setEditingSub(sub)}
          onDelete={(subId) => setDeletingSub(subscriptions.find(s => s._id === subId))}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Add Subscription Modal Dialog */}
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
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Edit Subscription Modal Overlay */}
      {editingSub && (
        <EditSubscriptionModal
          isOpen={!!editingSub}
          sub={editingSub}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingSub(null)}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingSub && (
        <DeleteSubscriptionModal
          isOpen={!!deletingSub}
          subName={deletingSub.serviceName}
          onConfirmDelete={handleDeleteConfirm}
          onConfirmPause={() => handleToggleStatus(deletingSub)}
          onCancel={() => setDeletingSub(null)}
          loading={loading}
        />
      )}
      
      {/* Global Activity Loader Indicator */}
      {loading && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#f5f5f7]/95 border border-[#e8e8ed] px-4 py-2.5 rounded-full flex items-center gap-3 backdrop-blur-md">
          <Loader2 className="w-4 h-4 animate-spin text-[#0066cc]" />
          <span className="text-[11px] font-semibold text-[#1d1d1f]">Synchronizing database...</span>
        </div>
      )}
    </div>
  );
}

export default DashboardOverview;
