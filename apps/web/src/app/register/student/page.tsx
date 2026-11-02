"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Industry {
  id: string;
  name: string;
}

interface Seminar {
  id: string;
  title: string;
  startsAtUtc: string;
}

export default function StudentRegisterPage() {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    aiubId: "",
    email: "",
    mobile: "",
    password: "",
    preferredJobType: "FULL_TIME",
    studyLevel: "ONGOING",
    preferredIndustryIds: [] as string[],
    attendsSeminar: false,
    seminarIds: [] as string[],
    gender: "Male",
    address: "",
  });

  useEffect(() => {
    fetch("/api/v1/lookups/industries")
      .then((res) => (res.ok ? res.json() : []))
      .then(setIndustries)
      .catch(console.error);

    fetch("/api/v1/lookups/seminars")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSeminars)
      .catch(console.error);
  }, []);

  const handleIndustryToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredIndustryIds: prev.preferredIndustryIds.includes(id)
        ? prev.preferredIndustryIds.filter((item) => item !== id)
        : [...prev.preferredIndustryIds, id],
    }));
  };

  const handleSeminarToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      seminarIds: prev.seminarIds.includes(id)
        ? prev.seminarIds.filter((item) => item !== id)
        : [...prev.seminarIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || Object.values(data.errors || {}).flat()[0] || "Registration failed");
      }

      router.push("/student/profile?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6 w-full">
      <div>
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Student Registration</h1>
          <p className="text-sm text-slate-600 mt-1">
            Register using your official university email (<code>@student.aiub.edu</code>)
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
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  AIUB Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aiubId}
                  onChange={(e) => setFormData({ ...formData, aiubId: e.target.value })}
                  placeholder="21-45678-1"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="017XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                AIUB Student Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="21-45678-1@student.aiub.edu"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Create Password *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Type Preference *
                </label>
                <select
                  value={formData.preferredJobType}
                  onChange={(e) => setFormData({ ...formData, preferredJobType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Study Level *
                </label>
                <select
                  value={formData.studyLevel}
                  onChange={(e) => setFormData({ ...formData, studyLevel: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
            </div>

            {/* Preferred Industry Type Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Company / Industry Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                {industries.map((ind) => (
                  <label key={ind.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.preferredIndustryIds.includes(ind.id)}
                      onChange={() => handleIndustryToggle(ind.id)}
                      className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span className="truncate">{ind.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seminar Participation */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.attendsSeminar}
                  onChange={(e) => setFormData({ ...formData, attendsSeminar: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                />
                <span className="text-xs font-bold text-blue-950">
                  Participate in Job Fair Seminars & Workshops?
                </span>
              </label>

              {formData.attendsSeminar && seminars.length > 0 && (
                <div className="mt-3 pl-6 space-y-2 border-t border-blue-200/50 pt-2.5">
                  <span className="text-[11px] font-semibold text-blue-900 block">Select Seminar Sessions:</span>
                  {seminars.map((sem) => (
                    <label key={sem.id} className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.seminarIds.includes(sem.id)}
                        onChange={() => handleSeminarToggle(sem.id)}
                        className="rounded border-slate-300 text-blue-900 mt-0.5"
                      />
                      <span>{sem.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Complete Student Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-blue-900 hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
