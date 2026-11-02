"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Loader2,
  Clock,
  Sparkles
} from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Apply Form State
  const [joiningOption, setJoiningOption] = useState("IMMEDIATELY");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/jobs/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/student/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/student/profile-completeness").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([jobData, profileData, completeData]) => {
        setJob(jobData);
        setProfile(profileData);
        setCompleteness(completeData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeness?.isComplete) {
      alert("Please complete your profile to 100% before applying.");
      return;
    }

    setApplying(true);
    setApplyError(null);

    try {
      const res = await fetch(`/api/v1/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joiningOption,
          answer1: answer1.trim() || undefined,
          answer2: answer2.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setApplySuccess(true);
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Position Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            This job post may have expired, or does not exist.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Jobs</span>
        </Link>

        {job.company?.id && (
          <Link
            href={`/companies/${job.company.id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Company Profile & Stall →
          </Link>
        )}
      </div>

      {/* Job Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.positionName || job.title}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {(job.employmentStatus || job.jobType || "FULL_TIME").replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-600">{job.company?.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg font-medium text-slate-700">
              {job.workplace || job.workPlace || "On-Site"}
            </span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg font-medium text-slate-700">
              {job.location || job.division || "Dhaka"}
            </span>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Location</span>
            <span className="font-semibold text-slate-800">{job.location || job.division || "Dhaka"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Workplace</span>
            <span className="font-semibold text-slate-800">{job.workplace || job.workPlace || "Office"}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Application Deadline</span>
            <span className="font-semibold text-slate-800">
              {job.deadlineUtc || job.applicationDeadline
                ? new Date(job.deadlineUtc || job.applicationDeadline).toLocaleDateString()
                : "Dec 5, 2026"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Salary</span>
            <span className="font-semibold text-slate-800">{job.salaryMode || "Negotiable"}</span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-6 space-y-6">
          {job.responsibilities && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Key Responsibilities
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {job.responsibilities}
              </div>
            </div>
          )}

          {job.skillsAndExpertise && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Required Skills & Qualifications
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {job.skillsAndExpertise}
              </div>
            </div>
          )}

          {job.additionalRequirements && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Additional Requirements
              </h3>
              <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {job.additionalRequirements}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Apply for this Position</h2>
        <p className="text-xs text-slate-500 mb-6">
          Submit your AIUB profile credentials and default PDF resume directly to this recruiter.
        </p>

        {applySuccess ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-bold text-emerald-950 text-base">Application Submitted Successfully!</h3>
            <p className="text-xs text-emerald-800 mt-1">
              Your resume and academic profile have been delivered to <strong>{job.company?.name}</strong>.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                href="/student/applications"
                className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                View in My Applications
              </Link>
              <Link
                href="/jobs"
                className="inline-block px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Browse Other Vacancies
              </Link>
            </div>
          </div>
        ) : !completeness?.isComplete ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Profile Incomplete ({completeness?.completenessPercentage || 0}%)</span>
            </div>
            <p className="mb-3">
              Before submitting job applications, AIUB regulations require a 100% complete profile. Please complete the following items:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4 font-medium text-amber-800">
              {completeness?.missing?.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <Link
              href="/student/profile"
              className="inline-block rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
            >
              Complete My Profile Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                When can you join if selected? *
              </label>
              <select
                value={joiningOption}
                onChange={(e) => setJoiningOption(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="IMMEDIATELY">Immediately</option>
                <option value="WITHIN_1_WEEK">Within 1 Week</option>
                <option value="WITHIN_15_DAYS">Within 15 Days</option>
                <option value="WITHIN_1_MONTH">Within 1 Month</option>
              </select>
            </div>

            {job.question1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {job.question1}
                </label>
                <textarea
                  rows={2}
                  value={answer1}
                  onChange={(e) => setAnswer1(e.target.value)}
                  placeholder="Your answer to employer..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}

            {job.question2 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {job.question2}
                </label>
                <textarea
                  rows={2}
                  value={answer2}
                  onChange={(e) => setAnswer2(e.target.value)}
                  placeholder="Your answer to employer..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-2 text-slate-600">
              <FileText className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                Default CV attached: <strong>Verified PDF resume from your profile</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={applying}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {applying ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
