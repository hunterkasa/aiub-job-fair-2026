"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, Calendar, ArrowRight, Loader2 } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All");
  const [employmentStatus, setEmploymentStatus] = useState("All");

  useEffect(() => {
    fetch("/api/v1/lookups/divisions")
      .then((res) => (res.ok ? res.json() : []))
      .then(setDivisions)
      .catch(console.error);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (location !== "All") params.append("location", location);
      if (employmentStatus !== "All") params.append("employmentStatus", employmentStatus);

      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [location, employmentStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-900 font-extrabold text-base">
            <span className="h-8 w-8 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm">A</span>
            <span>AIUB Job Fair 2026</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/companies" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
              Companies Directory
            </Link>
            <Link
              href="/student/profile"
              className="rounded-lg bg-blue-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-blue-800"
            >
              My Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Available Positions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse openings published by approved employers attending the fair
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, keywords, or company..."
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                <option value="All">All Locations (8 Divisions)</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
              >
                <option value="All">All Types</option>
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-900 mx-auto" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-sm mb-1">No Openings Found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your search criteria, or browse participating companies directly.
            </p>
            <Link
              href="/companies"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 text-white px-4 py-2 text-xs font-bold"
            >
              View Participating Companies
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{job.positionName}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {job.employmentStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {job.workplace}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <Building2 className="h-3.5 w-3.5 text-blue-900" />
                      {job.company?.name}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Deadline: {job.deadlineUtc ? new Date(job.deadlineUtc).toLocaleDateString() : "Open"}
                    </span>
                  </div>

                  {job.skillsAndExpertise && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      <span className="font-medium text-slate-700">Skills: </span>
                      {job.skillsAndExpertise}
                    </p>
                  )}
                </div>

                <div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-all w-full sm:w-auto"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
