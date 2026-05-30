import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { AuthService } from "../services/auth";
import AuthLayout from "./AuthLayout";
import { Mail, Lock, Loader2, Sparkles } from "lucide-react";
import * as styles from "../styles/common";

function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await AuthService.login(data.email, data.password);
      login(res.user, res.token);
      addToast("Successfully logged in! Welcome back.", "success");
      if (res.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      addToast(
        err.response?.data?.message ||
        "Invalid email or password. Please try again.",
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
        <div className="mb-8 text-center">
          <span className="text-[10px] font-semibold text-[#0066cc] uppercase tracking-wider block mb-1">
            Welcome Back
          </span>
          <h2 className={styles.formTitle}>Sign in to your account</h2>
          <p className={styles.mutedText}>Access your subscriptions dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email field */}
          <div className={styles.formGroup}>
            <label className={styles.labelClass}>Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className={`${styles.inputClass} pl-10`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i,
                    message: "Invalid email address format",
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
            <div className="flex justify-between items-center mb-1">
              <label className={styles.labelClass}>Password</label>
              <span className="text-[10px] font-semibold text-[#0066cc] hover:underline cursor-pointer transition">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#a1a1a6]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`${styles.inputClass} pl-10`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
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
            className={styles.submitBtn}
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin mx-auto" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Sign In
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#e8e8ed] text-center">
          <p className="text-xs text-[#6e6e73]">
            New to SubTrack?{" "}
            <Link
              to="/register"
              className={styles.linkClass}
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;