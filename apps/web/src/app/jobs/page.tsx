"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight,
  Loader2 
} from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All");
  const [employmentStatus, setEmploymentStatus] = useState("All");

  const divisions = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (location !== "All") params.append("location", location);
    if (employmentStatus !== "All") params.append("employmentStatus", employmentStatus);

    fetch(`/api/v1/jobs?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setJobs(Array.isArray(data) ? data : data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [location, employmentStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm mb-1">
          <Briefcase className="w-4 h-4" />
          <span>Campus Recruitment 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Available Positions & Internships
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Explore vacancies across 8 divisions published by verified corporate partners participating in AIUB Job Fair 2026.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or company..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Locations (8 Divisions)</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Employment Types</option>
              <option value="FULL_TIME">Full-time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACTUAL">Contractual</option>
            </select>
          </div>
        </form>
      </div>

      {/* Job Listings */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading open positions...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-md mx-auto">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">No Openings Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search criteria, or browse participating companies directly.
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            View Participating Companies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-slate-900 text-base sm:text-lg">{job.positionName}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {(job.employmentStatus || "").replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.workplace}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    {job.company?.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Deadline: {job.deadlineUtc ? new Date(job.deadlineUtc).toLocaleDateString() : "Fair Day (5 Dec 2026)"}
                  </span>
                </div>

                {job.skillsAndExpertise && (
                  <p className="text-xs text-slate-500 line-clamp-1">
                    <span className="font-medium text-slate-700">Skills: </span>
                    {job.skillsAndExpertise}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-all w-full sm:w-auto shadow-sm"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
