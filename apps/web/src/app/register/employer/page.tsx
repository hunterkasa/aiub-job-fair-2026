"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface Industry {
  id: string;
  name: string;
}

export default function EmployerRegisterPage() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    industryId: "",
    shortIntro: "",
    about: "",
    hrName: "",
    hrEmail: "",
    hrMobile: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/v1/lookups/industries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setIndustries(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, industryId: data[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register/employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || Object.values(data.errors || {}).flat()[0] || "Registration failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Welcome, <strong>{formData.companyName}</strong>. Your account has been registered and is currently{" "}
            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Awaiting Admin Approval
            </span>.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left mb-6 space-y-2 text-slate-700">
            <p className="font-bold text-slate-900">What happens next?</p>
            <p>1. Check your email for a verification link.</p>
            <p>2. Once verified and approved by the AIUB Job Fair committee, your company will appear in the directory.</p>
            <p>3. You can sign in immediately to post jobs or upload desired candidates criteria.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/employer/dashboard"
              className="w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 transition-all text-center"
            >
              Go to Employer Dashboard
            </Link>
            <Link
              href="/login"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-900 font-extrabold text-xl mb-2">
            <span className="h-9 w-9 rounded-xl bg-blue-900 text-white flex items-center justify-center text-lg">A</span>
            <span>AIUB Job Fair 2026</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Employer Registration</h1>
          <p className="text-sm text-slate-600 mt-1">
            Partner with AIUB to hire top graduates and interns
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Brain Station 23 Ltd."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Website
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Industry Type *
                </label>
                <select
                  required
                  value={formData.industryId}
                  onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Company Introduction *
              </label>
              <textarea
                required
                rows={2}
                maxLength={500}
                value={formData.shortIntro}
                onChange={(e) => setFormData({ ...formData, shortIntro: e.target.value })}
                placeholder="Brief summary of your organization and core line of business (max 500 characters)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-4">
                HR / Recruitment Focal Point
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    HR Focal Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hrName}
                    onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                    placeholder="e.g. Ayesha Siddiqua"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      HR Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.hrEmail}
                      onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                      placeholder="hr@company.com"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      HR Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.hrMobile}
                      onChange={(e) => setFormData({ ...formData, hrMobile: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering Company...</span>
                </>
              ) : (
                <>
                  <span>Submit Employer Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-blue-900 hover:underline">
              Sign in to employer portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
