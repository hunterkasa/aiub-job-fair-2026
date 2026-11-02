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
  Loader2
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
      alert("Please complete your profile before applying.");
      return;
    }

    setApplying(true);
    setApplyError(null);

    try {
      const res = await fetch(`/api/v1/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvFileId: profile.defaultCvFileId,
          joiningOption,
          answer1,
          answer2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit application");
      setApplySuccess(true);
    } catch (err: any) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center max-w-sm">
          <p className="font-bold text-slate-900">Position Not Found</p>
          <Link href="/jobs" className="text-xs text-blue-900 font-bold hover:underline mt-2 inline-block">
            Back to Openings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Jobs</span>
          </Link>
          <Link href="/student/profile" className="text-xs font-bold text-blue-900">
            My Student Profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        {/* Job Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-black text-slate-900">{job.positionName}</h1>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                  {job.employmentStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-900">{job.company?.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                {job.workplace}
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl font-medium text-slate-700">
                {job.location}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Salary</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{job.salaryMode}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Benefits</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{job.compensationBenefits || "Company Policy"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Deadline</span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {job.deadlineUtc ? new Date(job.deadlineUtc).toLocaleDateString() : "Open"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Industry</span>
              <span className="font-bold text-slate-900 mt-0.5 block">{job.company?.industry?.name}</span>
            </div>
          </div>

          {/* Job Details */}
          <div className="pt-6 space-y-5 text-xs leading-relaxed text-slate-700">
            {job.educationRequirement && (
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Educational Requirement</h3>
                <p>{job.educationRequirement}</p>
              </div>
            )}

            {job.responsibilities && (
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Responsibilities</h3>
                <p className="whitespace-pre-line">{job.responsibilities}</p>
              </div>
            )}

            {job.skillsAndExpertise && (
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Skills & Expertise</h3>
                <p>{job.skillsAndExpertise}</p>
              </div>
            )}

            {job.additionalRequirements && (
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Additional Requirements</h3>
                <p className="whitespace-pre-line">{job.additionalRequirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Action Card (Section 2.3) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Apply for this Position</h2>
          <p className="text-xs text-slate-500 mb-6">
            Your name, academic details, and verified CV will be attached automatically.
          </p>

          {applySuccess ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-emerald-950 text-base">Application Submitted!</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your application has been received by <strong>{job.company?.name}</strong>.
              </p>
              <Link
                href="/student/applications"
                className="mt-4 inline-block text-xs font-bold text-emerald-900 underline"
              >
                View in My Applications
              </Link>
            </div>
          ) : !completeness?.isComplete ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Profile Incomplete</span>
              </div>
              <p className="mb-3">
                Before you can apply, you must complete the following required items:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4 font-medium">
                {completeness?.missing?.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <Link
                href="/student/profile"
                className="inline-block rounded-xl bg-blue-900 text-white px-4 py-2 text-xs font-bold"
              >
                Complete Profile Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-4">
              {applyError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{applyError}</span>
                </div>
              )}

              {/* Joining Date Selection (Section 2.3) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  When can you join if selected? *
                </label>
                <select
                  value={joiningOption}
                  onChange={(e) => setJoiningOption(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="IMMEDIATELY">Immediately</option>
                  <option value="WITHIN_1_WEEK">Within 1 Week</option>
                  <option value="WITHIN_15_DAYS">Within 15 Days</option>
                  <option value="WITHIN_1_MONTH">Within 1 Month</option>
                </select>
              </div>

              {/* Employer Screening Questions (Section 2.2 Sheet 2) */}
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
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
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
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                  />
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2 text-slate-600">
                <FileText className="h-4 w-4 text-blue-900" />
                <span>Default CV attached: <strong>Verified PDF on file</strong></span>
              </div>

              <button
                type="submit"
                disabled={applying}
                className="w-full rounded-xl bg-blue-900 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {applying ? "Submitting Application..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
