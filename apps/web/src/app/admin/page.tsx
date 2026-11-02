"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  Briefcase, 
  ClipboardList, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface AdminStats {
  totalStudents: number;
  totalEmployers: number;
  pendingEmployers: number;
  totalJobPosts: number;
  totalApplications: number;
  totalSeminars: number;
}

interface EmployerItem {
  id: string;
  name: string;
  websiteUrl?: string;
  shortIntro: string;
  hrName: string;
  hrEmail: string;
  hrMobile: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  industry?: {
    name: string;
  };
}

interface StudentItem {
  id: string;
  fullName: string;
  aiubId: string;
  mobile: string;
  studyLevel: string;
  preferredJobType: string;
  createdAt: string;
  user: {
    email: string;
    emailConfirmed: boolean;
  };
  _count: {
    applications: number;
  };
}

interface EventSettingItem {
  id: string;
  key: string;
  value: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "employers" | "students" | "exports" | "settings">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [employers, setEmployers] = useState<EmployerItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [settings, setSettings] = useState<EventSettingItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [employerFilter, setEmployerFilter] = useState("ALL");
  const [studentSearch, setStudentSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal
  const [rejectingCompanyId, setRejectingCompanyId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      setLoading(true);
      const userRes = await fetch("/api/v1/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      if (userData?.user?.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      await refreshAllData();
    } catch (err) {
      console.error("Admin load error", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, empRes, studRes, settingsRes] = await Promise.all([
        fetch("/api/v1/admin/stats"),
        fetch("/api/v1/admin/employers"),
        fetch("/api/v1/admin/students"),
        fetch("/api/v1/admin/event-settings"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (empRes.ok) setEmployers(await empRes.json());
      if (studRes.ok) {
        const sData = await studRes.json();
        setStudents(sData.students || []);
      }
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (err) {
      console.error("Refresh error", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproveEmployer = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/v1/admin/employers/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setEmployers((prev) =>
          prev.map((e) => (e.id === id ? { ...e, approvalStatus: "APPROVED" } : e))
        );
        refreshAllData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to approve employer");
      }
    } catch (err: any) {
      alert(err.message || "Approval request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEmployer = async () => {
    if (!rejectingCompanyId) return;
    setActionLoading(rejectingCompanyId);
    try {
      const res = await fetch(`/api/v1/admin/employers/${rejectingCompanyId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason || "Criteria not met" }),
      });
      if (res.ok) {
        setEmployers((prev) =>
          prev.map((e) =>
            e.id === rejectingCompanyId
              ? { ...e, approvalStatus: "REJECTED", rejectionReason }
              : e
          )
        );
        setRejectingCompanyId(null);
        setRejectionReason("");
        refreshAllData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to reject employer");
      }
    } catch (err: any) {
      alert(err.message || "Rejection request failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/v1/admin/event-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        alert(`Setting '${key}' updated successfully.`);
      }
    } catch (err) {
      alert("Failed to update setting");
    }
  };

  const filteredEmployers = employers.filter((e) => {
    if (employerFilter === "ALL") return true;
    return e.approvalStatus === employerFilter;
  });

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(term) ||
      s.aiubId.toLowerCase().includes(term) ||
      s.user.email.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm">Authenticating Administrator Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>AIUB OPA • Central Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Fair 2026 Management Console
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refreshAllData}
            disabled={refreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <a
            href="/api/v1/admin/students/export-csv"
            download="aiub_students.csv"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Students CSV</span>
          </a>

          <a
            href="/api/v1/admin/applications/export-csv"
            download="aiub_applications.csv"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Applications CSV</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 mt-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "overview" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab("employers")}
          className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === "employers" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Employer Stalls</span>
          {stats && stats.pendingEmployers > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {stats.pendingEmployers} pending
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("students")}
          className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "students" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Student Directory ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("exports")}
          className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "exports" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Export Center
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "settings" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Event Deadlines
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && stats && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Students</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalStudents}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Verified @aiub.edu registrations</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Participating Companies</span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalEmployers}
              </div>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                {stats.pendingEmployers} pending verification
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Published Jobs</span>
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalJobPosts}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Vacancies across 8 divisions</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Applications</span>
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalApplications}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">CVs submitted by candidates</div>
            </div>
          </div>

          {/* Quick Action Pending Approvals Card */}
          {stats.pendingEmployers > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      {stats.pendingEmployers} Company Stall Applications Awaiting Review
                    </h3>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Review HR credentials and approve their participation for stall allocation and job postings.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEmployerFilter("PENDING");
                    setActiveTab("employers");
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Review Pending
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Employers */}
      {activeTab === "employers" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Employer Stalls Management</h2>
              <p className="text-xs text-slate-500">
                Approve or reject company registrations for AIUB Job Fair 2026.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold">
              <button
                onClick={() => setEmployerFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg ${employerFilter === "ALL" ? "bg-slate-800 text-white" : "bg-white border text-slate-600"}`}
              >
                All ({employers.length})
              </button>
              <button
                onClick={() => setEmployerFilter("PENDING")}
                className={`px-3 py-1.5 rounded-lg ${employerFilter === "PENDING" ? "bg-amber-600 text-white" : "bg-white border text-slate-600"}`}
              >
                Pending ({employers.filter((e) => e.approvalStatus === "PENDING").length})
              </button>
              <button
                onClick={() => setEmployerFilter("APPROVED")}
                className={`px-3 py-1.5 rounded-lg ${employerFilter === "APPROVED" ? "bg-emerald-600 text-white" : "bg-white border text-slate-600"}`}
              >
                Approved ({employers.filter((e) => e.approvalStatus === "APPROVED").length})
              </button>
              <button
                onClick={() => setEmployerFilter("REJECTED")}
                className={`px-3 py-1.5 rounded-lg ${employerFilter === "REJECTED" ? "bg-rose-600 text-white" : "bg-white border text-slate-600"}`}
              >
                Rejected ({employers.filter((e) => e.approvalStatus === "REJECTED").length})
              </button>
            </div>
          </div>

          {filteredEmployers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No employers match this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployers.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{emp.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        emp.approvalStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : emp.approvalStatus === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {emp.approvalStatus}
                      </span>
                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                        {emp.industry?.name || "Corporate"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mb-2">
                      {emp.shortIntro}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>HR: <strong>{emp.hrName}</strong></span>
                      <span>•</span>
                      <span>Email: {emp.hrEmail}</span>
                      <span>•</span>
                      <span>Mobile: {emp.hrMobile}</span>
                      {emp.websiteUrl && (
                        <>
                          <span>•</span>
                          <a
                            href={emp.websiteUrl.startsWith("http") ? emp.websiteUrl : `https://${emp.websiteUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>

                    {emp.rejectionReason && (
                      <p className="text-xs text-rose-600 mt-2 italic">
                        Rejection reason: {emp.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Approve / Reject buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {emp.approvalStatus !== "APPROVED" && (
                      <button
                        onClick={() => handleApproveEmployer(emp.id)}
                        disabled={actionLoading === emp.id}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {emp.approvalStatus !== "REJECTED" && (
                      <button
                        onClick={() => {
                          setRejectingCompanyId(emp.id);
                          setRejectionReason("");
                        }}
                        disabled={actionLoading === emp.id}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Students */}
      {activeTab === "students" && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered AIUB Candidates</h2>
              <p className="text-xs text-slate-500">
                View student registrations, academic profile completeness, and job submissions.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or AIUB ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">AIUB ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Study Level</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3 text-center">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{s.aiubId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{s.user?.email}</td>
                      <td className="px-4 py-3 text-slate-600">{s.studyLevel}</td>
                      <td className="px-4 py-3 text-slate-600">{s.mobile}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                          {s._count?.applications || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Exports */}
      {activeTab === "exports" && (
        <div className="mt-8 max-w-2xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Data Export Center</h2>
            <p className="text-xs text-slate-500 mt-1">
              Download clean CSV snapshots of student registrations and candidate job applications for OPA records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-blue-900 text-sm">Students & Profiles Export</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Full list of registered AIUB students with academic info, contact numbers, and profile status.
                </p>
              </div>
              <a
                href="/api/v1/admin/students/export-csv"
                download="aiub_students.csv"
                className="mt-4 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download students.csv</span>
              </a>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">Job Applications Export</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Complete record of all job applications, companies, divisions, and candidate answers.
                </p>
              </div>
              <a
                href="/api/v1/admin/applications/export-csv"
                download="aiub_applications.csv"
                className="mt-4 inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" />
                <span>Download applications.csv</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div className="mt-8 max-w-2xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Event Deadlines & Configuration</h2>
          <p className="text-xs text-slate-500 mb-6">
            Modify core cutoff deadlines for AIUB Job Fair 2026.
          </p>

          <div className="space-y-4">
            {settings.map((s) => (
              <div key={s.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-800">{s.key}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">Current Value: {s.value}</div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <input
                    type="text"
                    defaultValue={s.value}
                    id={`setting-${s.key}`}
                    className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-full sm:w-48"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`setting-${s.key}`) as HTMLInputElement;
                      if (input) handleSaveSetting(s.key, input.value);
                    }}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingCompanyId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reject Employer Application</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide a clear reason for the company. This will be shown on their dashboard.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Incomplete corporate profile, non-standard business registration..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setRejectingCompanyId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectEmployer}
                disabled={!rejectionReason.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
