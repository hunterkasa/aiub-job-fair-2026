"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function StudentAssessmentPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/assessments/current")
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setAssessment(data);
          if (data.alreadyCompleted) {
            setSubmitted(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleOptionSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assessment?.questions?.length || 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("Please check the consent agreement to proceed.");
      return;
    }

    if (answeredCount < totalQuestions) {
      alert(`Please answer all questions before submitting (${answeredCount}/${totalQuestions} completed).`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId: assessment.id,
          answers,
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit assessment");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Submitted!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Thank you! Your behavioral self-assessment has been successfully recorded and linked to your student profile.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left mb-6 text-slate-600">
            <p className="font-semibold text-slate-900 mb-1">Notice regarding result visibility:</p>
            <p>
              In accordance with AIUB Job Fair guidelines, category summaries are provided exclusively to recruiters when you apply for their job postings. No score ranking or diagnostic labels are computed.
            </p>
          </div>

          <Link
            href="/student/profile"
            className="w-full inline-flex items-center justify-center rounded-xl bg-blue-900 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800 transition-all text-center"
          >
            Back to Student Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/student/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Profile</span>
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-slate-900">Psychometric Self-Assessment</h1>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment?.disclaimer}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
            <span>Questions Completed</span>
            <span>{answeredCount} of {totalQuestions} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {assessment?.questions?.map((q: any, idx: number) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-900 leading-relaxed">{q.text}</span>
              </div>

              {/* 5-point Likert Scale buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {q.options?.map((opt: any) => {
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionSelect(q.id, opt.value)}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-blue-900 border-blue-900 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold text-sm">{opt.value}</span>
                      <span className="text-[10px] leading-tight opacity-90">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Consent Checkbox (Section 7A.3) */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="h-4 w-4 rounded border-amber-400 text-blue-900 mt-0.5"
              />
              <span className="text-xs text-amber-950 leading-relaxed">
                <strong>Informed Consent Notice:</strong> I understand that this is a self-reported behavioral profile (not a pass/fail diagnostic test). I consent to having high-level category summaries shared strictly with registered employers receiving my job applications for AIUB Job Fair 2026.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || answeredCount < totalQuestions}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-6 py-4 text-sm font-bold text-white shadow-md hover:bg-blue-800 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Assessment...</span>
              </>
            ) : (
              <span>Submit Self-Assessment</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
