import { useState, useEffect } from "react";
import { Sparkles, Calendar, DollarSign, CreditCard, Bell, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as styles from "../styles/common";

// Popular services preset suggestions for automated speed prepopulating
const SERVICE_PRESETS = [
  { name: "Netflix", category: "Entertainment", price: 15.99, billingCycle: "monthly", paymentMethod: "Card" },
  { name: "Spotify", category: "Entertainment", price: 10.99, billingCycle: "monthly", paymentMethod: "UPI" },
  { name: "Amazon Prime", category: "Entertainment", price: 14.99, billingCycle: "monthly", paymentMethod: "Card" },
  { name: "ChatGPT Plus", category: "Software", price: 20.00, billingCycle: "monthly", paymentMethod: "Card" },
  { name: "GitHub Copilot", category: "Work", price: 10.00, billingCycle: "monthly", paymentMethod: "PayPal" },
  { name: "YouTube Premium", category: "Entertainment", price: 13.99, billingCycle: "monthly", paymentMethod: "UPI" },
  { name: "Adobe Creative Cloud", category: "Work", price: 54.99, billingCycle: "monthly", paymentMethod: "Card" },
  { name: "Google One", category: "Utilities", price: 1.99, billingCycle: "monthly", paymentMethod: "UPI" },
];

const CATEGORIES = ["Entertainment", "Software", "Utilities", "Health", "Work", "Others"];
const PAYMENT_METHODS = ["UPI", "Card", "PayPal", "Crypto", "Cash"];

function SubscriptionForm({ initialData = null, onSubmit, onCancel, loading = false }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceName: "",
      category: "Entertainment",
      price: "",
      billingCycle: "monthly",
      renewalDate: "",
      reminderDays: 3,
      status: "active",
      paymentMethod: "UPI",
      notes: "",
    },
  });

  const [searchFocused, setSearchFocused] = useState(false);
  const [matchingPresets, setMatchingPresets] = useState([]);

  const serviceNameVal = watch("serviceName");

  // Load initialData if editing
  useEffect(() => {
    if (initialData) {
      // Parse ISO date to YYYY-MM-DD
      const formattedDate = initialData.renewalDate
        ? new Date(initialData.renewalDate).toISOString().substring(0, 10)
        : "";

      reset({
        ...initialData,
        price: initialData.price ? initialData.price.toString() : "",
        renewalDate: formattedDate,
      });
    } else {
      reset({
        serviceName: "",
        category: "Entertainment",
        price: "",
        billingCycle: "monthly",
        renewalDate: "",
        reminderDays: 3,
        status: "active",
        paymentMethod: "UPI",
        notes: "",
      });
    }
  }, [initialData, reset]);

  // Sync auto presets matches
  useEffect(() => {
    if (!serviceNameVal || initialData) {
      setMatchingPresets([]);
      return;
    }
    const query = serviceNameVal.toLowerCase();
    const filtered = SERVICE_PRESETS.filter((preset) =>
      preset.name.toLowerCase().includes(query)
    );
    setMatchingPresets(filtered);
  }, [serviceNameVal, initialData]);

  const handleApplyPreset = (preset) => {
    setValue("serviceName", preset.name);
    setValue("category", preset.category);
    setValue("price", preset.price.toString());
    setValue("billingCycle", preset.billingCycle);
    setValue("paymentMethod", preset.paymentMethod);
    setMatchingPresets([]);
  };

  const handleFormSubmit = (data) => {
    const payload = {
      ...data,
      price: parseFloat(data.price),
      reminderDays: parseInt(data.reminderDays) || 3,
    };
    onSubmit(payload);
  };

  const statusVal = watch("status");

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 font-sans">
      {/* Service Name & Auto Suggestion */}
      <div className="space-y-1.5 relative">
        <label className={styles.labelClass}>Service Name</label>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Netflix, Spotify, AWS"
            {...register("serviceName", { required: "Service name is required" })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            className={`${styles.inputClass} ${errors.serviceName ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10" : ""}`}
          />
        </div>
        {errors.serviceName && (
          <span className="text-[10px] font-bold text-[#cc2f26] block">
            {errors.serviceName.message}
          </span>
        )}

        {/* Preset Suggestions dropdown */}
        {searchFocused && matchingPresets.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border border-[#e8e8ed] rounded-xl z-50 overflow-hidden max-h-40 overflow-y-auto divide-y divide-[#e8e8ed]">
            {matchingPresets.map((preset) => (
              <div
                key={preset.name}
                onMouseDown={() => handleApplyPreset(preset)}
                className="px-4 py-2.5 hover:bg-[#f5f5f7] flex items-center justify-between text-xs font-semibold text-[#1d1d1f] cursor-pointer select-none transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0066cc] shrink-0" />
                  <span>{preset.name}</span>
                </div>
                <span className="text-[10px] text-[#6e6e73] font-medium">
                  {preset.category} • ${preset.price}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price & Billing Cycle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Price ($)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Price cannot be negative" },
              })}
              className={`${styles.inputClass} pl-8.5 ${errors.price ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10" : ""}`}
            />
          </div>
          {errors.price && (
            <span className="text-[10px] font-bold text-[#cc2f26] block">
              {errors.price.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>Billing Cycle</label>
          <select
            {...register("billingCycle")}
            className={styles.inputClass}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Category & Payment Method */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Category</label>
          <select
            {...register("category")}
            className={styles.inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>Payment Method</label>
          <select
            {...register("paymentMethod")}
            className={styles.inputClass}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Renewal Date & Reminder Days */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Next Renewal Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <input
              type="date"
              {...register("renewalDate", { required: "Renewal date is required" })}
              className={`${styles.inputClass} pl-8.5 ${errors.renewalDate ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10" : ""}`}
            />
          </div>
          {errors.renewalDate && (
            <span className="text-[10px] font-bold text-[#cc2f26] block">
              {errors.renewalDate.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>Reminder Interval (Days)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <input
              type="number"
              placeholder="3"
              {...register("reminderDays", {
                required: "Reminder days is required",
                min: { value: 1, message: "Min 1 day" },
                max: { value: 30, message: "Max 30 days" },
              })}
              className={`${styles.inputClass} pl-8.5 ${errors.reminderDays ? "border-[#ff3b30] focus:border-[#ff3b30] focus:ring-[#ff3b30]/10" : ""}`}
            />
          </div>
          {errors.reminderDays && (
            <span className="text-[10px] font-bold text-[#cc2f26] block">
              {errors.reminderDays.message}
            </span>
          )}
        </div>
      </div>

      {/* Status Toggle (Only visible when editing) */}
      {initialData && (
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Status</label>
          <div className="flex gap-6 py-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f] cursor-pointer select-none">
              <input
                type="radio"
                value="active"
                checked={statusVal === "active"}
                onChange={() => setValue("status", "active")}
                className="text-[#0066cc] focus:ring-[#0066cc]/20"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1d1d1f] cursor-pointer select-none">
              <input
                type="radio"
                value="cancelled"
                checked={statusVal === "cancelled"}
                onChange={() => setValue("status", "cancelled")}
                className="text-[#0066cc] focus:ring-[#0066cc]/20"
              />
              Cancelled
            </label>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className={styles.labelClass}>Additional Notes</label>
        <div className="relative">
          <div className="absolute top-3 left-3.5 pointer-events-none text-[#a1a1a6]">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <textarea
            rows="2"
            placeholder="Add plan features, billing links, or cancellation notes..."
            {...register("notes")}
            className={`${styles.inputClass} pl-8.5 resize-none`}
          ></textarea>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e8ed] mt-6">
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryBtn}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={styles.primaryBtn}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span>{initialData ? "Save Changes" : "Track Service"}</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default SubscriptionForm;
