import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToastStore } from "../store/toastStore";
import { Lock, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

function ChangePassword() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const newPasswordVal = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);

    // Simulate secure API hashing update for local demo protection
    setTimeout(() => {
      addToast("Account password changed successfully!", "success");
      reset();
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 font-sans select-none space-y-5">
      <div className="border-b border-[#e8e8ed] pb-3">
        <h3 className={styles.subHeadingClass}>Change Password</h3>
        <p className={`${styles.mutedText} text-[11px] mt-0.5`}>Protect and secure your account credentials</p>
      </div>



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Current Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register("currentPassword", { required: "Current password is required" })}
              className={`${styles.inputClass} pl-9.5 text-xs py-2 ${
                errors.currentPassword ? "border-[#ff3b30] focus:border-[#ff3b30]" : ""
              }`}
            />
          </div>
          {errors.currentPassword && (
            <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Min. 6 characters"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "New password must be at least 6 characters long",
                },
              })}
              className={`${styles.inputClass} pl-9.5 text-xs py-2 ${
                errors.newPassword ? "border-[#ff3b30] focus:border-[#ff3b30]" : ""
              }`}
            />
          </div>
          {errors.newPassword && (
            <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
              {errors.newPassword.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === newPasswordVal || "New passwords do not match",
              })}
              className={`${styles.inputClass} pl-9.5 text-xs py-2 ${
                errors.confirmPassword ? "border-[#ff3b30] focus:border-[#ff3b30]" : ""
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.primaryBtn}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;
