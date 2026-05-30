import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { AuthService } from "../services/auth";
import { useToastStore } from "../store/toastStore";
import AuthLayout from "./AuthLayout";
import { User, Mail, Lock, Loader2, Sparkles } from "lucide-react";
import * as styles from "../styles/common";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await AuthService.register(data.name, data.email, data.password, "user");
      addToast("Account created successfully! Welcome to SubTrack.", "success");
      navigate("/");
    } catch (err) {
      addToast(
        err.response?.data?.message ||
        "Registration failed. Please check your details and try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.formCard}>
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="text-[10px] font-semibold text-[#0066cc] uppercase tracking-wider block mb-1">
            Start Today
          </span>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.mutedText}>Start tracking your subscription plans</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Name field */}
          <div className={styles.formGroup}>
            <label className={styles.labelClass}>Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                className={`${styles.inputClass} pl-10`}
                {...register("name", { required: "Full name is required" })}
              />
            </div>
            {errors.name && (
              <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email field */}
          <div className={styles.formGroup}>
            <label className={styles.labelClass}>Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="john@example.com"
                className={`${styles.inputClass} pl-10`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i,
                    message: "Invalid email format",
                  },
                })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className={styles.formGroup}>
            <label className={styles.labelClass}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="At least 6 characters"
                className={`${styles.inputClass} pl-10`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters long",
                  },
                })}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] font-bold text-[#cc2f26] block mt-0.5">
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitBtn} mt-2`}
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Create Account
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#e8e8ed] text-center">
          <p className="text-xs text-[#6e6e73]">
            Already have an account?{" "}
            <Link
              to="/"
              className={styles.linkClass}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;