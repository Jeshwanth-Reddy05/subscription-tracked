import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { AuthService } from "../services/auth";
import { User, Mail, Loader2 } from "lucide-react";
import * as styles from "../styles/common";

function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await AuthService.updateProfile(user.id || user._id, { name: data.name, email: data.email });
      if (res.updatedUser) {
        const updated = {
          ...user,
          name: res.updatedUser.name,
          email: res.updatedUser.email,
        };
        setUser(updated);
        addToast("Profile details updated successfully!", "success");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#e8e8ed] rounded-2xl p-6 font-sans select-none space-y-5">
      <div className="border-b border-[#e8e8ed] pb-3">
        <h3 className={styles.subHeadingClass}>Profile Configurations</h3>
        <p className={`${styles.mutedText} text-[11px] mt-0.5`}>Edit username or address logs</p>
      </div>



      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className={styles.labelClass}>Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className={`${styles.inputClass} pl-9.5 text-xs py-2 ${errors.name ? "border-[#ff3b30] focus:border-[#ff3b30]" : ""}`}
            />
          </div>
          {errors.name && (
            <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
              {errors.name.message}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={styles.labelClass}>Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format",
                },
              })}
              className={`${styles.inputClass} pl-9.5 text-xs py-2 ${errors.email ? "border-[#ff3b30] focus:border-[#ff3b30]" : ""}`}
            />
          </div>
          {errors.email && (
            <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
              {errors.email.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.primaryBtn}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;
