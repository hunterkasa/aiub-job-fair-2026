"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Briefcase, 
  ArrowLeft, 
  Clock, 
  Users, 
  Sparkles, 
  Mail,
  ExternalLink
} from "lucide-react";

interface JobPost {
  id: string;
  title?: string;
  positionName?: string;
  division?: string;
  location?: string;
  jobType?: string;
  employmentStatus?: string;
  workPlace?: string;
  workplace?: string;
  vacancies?: number;
  applicationDeadline?: string;
  deadlineUtc?: string;
  shortDescription?: string;
  responsibilities?: string;
  createdAt?: string;
}

interface CompanyDetail {
  id: string;
  name: string;
  websiteUrl?: string;
  shortIntro: string;
  about?: string;
  hrName: string;
  hrEmail: string;
  industry: {
    id: string;
    name: string;
  };
  jobPosts: JobPost[];
}

export default function CompanyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/companies/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load company details");
        }
        return res.json();
      })
      .then((data) => setCompany(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Company Not Found</h2>
        <p className="text-slate-500 text-sm mt-1">{error || "This company does not exist or has not been approved yet."}</p>
        <button
          onClick={() => router.push("/companies")}
          className="mt-6 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/companies"
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Companies</span>
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-2xl flex items-center justify-center border border-blue-100 shadow-sm">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {company.industry?.name || "Corporate"}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Official Stall Participant
                </span>
              </div>
            </div>
          </div>

          {company.websiteUrl && (
            <a
              href={company.websiteUrl.startsWith("http") ? company.websiteUrl : `https://${company.websiteUrl}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Visit Website</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>

        {/* Intro */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">About Company</h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {company.about || company.shortIntro}
          </p>
        </div>

        {/* Candidate Hiring Criteria / Looking For */}
        {company.shortIntro && company.about && company.shortIntro !== company.about && (
          <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center space-x-2 text-blue-900 font-semibold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>What We Are Looking For at AIUB 2026:</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
              {company.shortIntro}
            </p>
          </div>
        )}
      </div>

      {/* Open Positions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span>Open Vacancies ({company.jobPosts.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Apply directly before the fair deadline</span>
        </div>

        {company.jobPosts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-700">No Active Job Posts</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              This company has not published any open vacancy yet. You can visit their stall in person on Job Fair Day (5 Dec 2026) to drop your CV directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.jobPosts.map((job) => (
              <div
                key={job.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                        {job.title || job.positionName}
                      </Link>
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">
                      {(job.jobType || job.employmentStatus || "FULL_TIME").replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {job.shortDescription || job.responsibilities || "View details for full requirements."}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.division || job.location || "Dhaka"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Deadline: {job.applicationDeadline || job.deadlineUtc
                          ? new Date((job.applicationDeadline || job.deadlineUtc)!).toLocaleDateString()
                          : "Dec 5, 2026"}
                      </span>
                    </span>
                    {job.vacancies && (
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.vacancies} vacancies</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View & Apply →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
