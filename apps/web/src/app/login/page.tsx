"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      const role = data.user.role;
      if (role === "STUDENT") {
        window.location.href = "/student/profile";
      } else if (role === "EMPLOYER") {
        window.location.href = "/employer/dashboard";
      } else if (role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 sm:py-16 px-4 w-full">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Your Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access student profiles, employer dashboards, or admin console
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 space-y-2">
            <div>
              Don&apos;t have an account yet?
            </div>
            <div className="flex items-center justify-center gap-4 font-semibold text-blue-900">
              <Link href="/register/student" className="hover:underline">
                Register as Student
              </Link>
              <span>•</span>
              <Link href="/register/employer" className="hover:underline">
                Register as Employer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
