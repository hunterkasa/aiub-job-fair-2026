"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, FileText, Loader2 } from "lucide-react";

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/student/applications")
      .then((res) => (res.ok ? res.json() : []))
      .then(setApplications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/student/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">My Job Applications</h1>
          <p className="text-xs text-slate-500">Track your submitted applications and candidate pool entries</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900 mx-auto" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1">No Applications Yet</h3>
            <p className="text-xs text-slate-500 mb-4">
              Browse participating companies and submit one-click applications.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 text-white px-4 py-2.5 text-xs font-bold"
            >
              Browse Open Positions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-base">
                      {app.jobPost?.positionName || "General CV Drop (All Companies)"}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {app.jobPost?.company?.name || "AIUB General Pool"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-medium">Joining Availability: </span>
                    <span>{app.joiningOption.replace(/_/g, " ")}</span>
                  </div>
                </div>

                <div>
                  <a
                    href={`/api/v1/files/${app.cvFileId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 inline-block"
                  >
                    View Attached CV
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
