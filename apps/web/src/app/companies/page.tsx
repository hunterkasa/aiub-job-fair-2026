"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Globe, Briefcase, Search, Filter } from "lucide-react";

interface Industry {
  id: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  websiteUrl?: string;
  shortIntro: string;
  about?: string;
  industry: {
    id: string;
    name: string;
  };
  _count?: {
    jobPosts: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  useEffect(() => {
    // Fetch industries
    fetch("/api/v1/lookups/industries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setIndustries(data))
      .catch(() => setIndustries([]));
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [search, selectedIndustry]);

  const fetchCompanies = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.append("q", search.trim());
    if (selectedIndustry !== "All") params.append("industryId", selectedIndustry);

    fetch(`/api/v1/companies?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCompanies(data))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-blue-600 font-semibold text-sm mb-1">
          <Building2 className="w-4 h-4" />
          <span>Campus Recruitment 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Participating Companies & Stalls
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
          Explore approved corporate partners, tech giants, and innovative firms setting up stalls at AIUB Job Fair 2026. Discover their open positions and what candidate profiles they are seeking.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies by name or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="All">All Industries</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse h-64">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded"></div>
                <div className="h-3 bg-slate-100 rounded"></div>
                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Companies Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search criteria or selecting a different industry.
          </p>
          {(search || selectedIndustry !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedIndustry("All");
              }}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 font-bold text-lg flex items-center justify-center border border-blue-100 shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors">
                      <Link href={`/companies/${c.id}`}>{c.name}</Link>
                    </h2>
                    <span className="inline-block mt-0.5 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                      {c.industry?.name || "General"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 mb-4 flex-1">
                {c.shortIntro || c.about || "Corporate participant at AIUB Job Fair 2026."}
              </p>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    <strong>{c._count?.jobPosts ?? 0}</strong> open positions
                  </span>
                </div>

                <Link
                  href={`/companies/${c.id}`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
