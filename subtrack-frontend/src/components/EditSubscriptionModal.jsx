import { X } from "lucide-react";
import SubscriptionForm from "./SubscriptionForm";
import * as styles from "../styles/common";

function EditSubscriptionModal({ isOpen, sub, onSubmit, onCancel, loading = false }) {
  if (!isOpen || !sub) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      {/* Backdrop */}
      <div onClick={onCancel} className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity duration-300"></div>

      {/* Modal Dialog Content */}
      <div className="relative bg-white border border-[#e8e8ed] rounded-2xl w-full max-w-lg mx-4 p-8 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-[#e8e8ed] pb-3">
          <div>
            <h3 className={styles.subHeadingClass}>
              Edit Subscription
            </h3>
            <p className={`${styles.mutedText} text-[11px] mt-0.5`}>
              Modify the details of your tracked plan
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <SubscriptionForm
          initialData={sub}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default EditSubscriptionModal;
