"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState<string>(
    token ? "Verifying your email address..." : "No verification token provided in URL."
  );

  useEffect(() => {
    if (!token) return;

    fetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage("Your AIUB email address has been successfully verified! You may now log in to complete your profile.");
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid or expired verification link.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage("A network error occurred while verifying your token.");
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        {status === "loading" && (
          <div>
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-bold text-slate-800">Verifying Email...</h2>
            <p className="text-xs text-slate-500 mt-1">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center space-x-1.5 w-full justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <XCircle className="w-14 h-14 text-rose-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
              {message}
            </p>
            <div className="space-y-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-1.5 w-full justify-center py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition-colors"
              >
                <span>Return to Login</span>
              </Link>
              <Link
                href="/"
                className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 py-1"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
