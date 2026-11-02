"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Briefcase, 
  Users, 
  PlusCircle, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  BrainCircuit, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar
} from "lucide-react";

interface CompanyProfile {
  id: string;
  name: string;
  shortIntro: string;
  about?: string;
  websiteUrl?: string;
  industryId: string;
  hrName: string;
  hrEmail: string;
  hrMobile: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  industry?: {
    id: string;
    name: string;
  };
}

interface JobPost {
  id: string;
  title: string;
  division: string;
  jobType: string;
  workPlace: string;
  vacancies?: number;
  applicationDeadline: string;
  shortDescription: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  question1?: string;
  question2?: string;
  _count?: {
    applications: number;
  };
}

interface Applicant {
  applicationId: string;
  joiningOption: string;
  answer1?: string;
  answer2?: string;
  status: string;
  submittedAt: string;
  cvDownloadUrl: string;
  student: {
    id: string;
    fullName: string;
    aiubId: string;
    mobile: string;
    gender?: string;
    studyLevel: string;
    linkedInUrl?: string;
    gitHubUrl?: string;
    educations: Array<{
      id: string;
      level: string;
      institutionName: string;
      cgpa?: number;
      subject?: string;
      passingYear?: number;
    }>;
    experiences: Array<{
      id: string;
      companyName: string;
      designation: string;
      startDate: string;
      isCurrent: boolean;
    }>;
    assessmentSummary?: {
      disclaimer: string;
      completedAt: string;
      categories: Array<{
        category: string;
        band: string;
      }>;
    } | null;
  } | null;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "profile" | "applicants">("jobs");
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    shortIntro: "",
    about: "",
    websiteUrl: "",
    hrName: "",
    hrEmail: "",
    hrMobile: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    division: "DHAKA",
    jobType: "FULL_TIME",
    workPlace: "ON_SITE",
    vacancies: 1,
    applicationDeadline: "2026-12-05",
    shortDescription: "",
    requirements: "",
    question1: "",
    question2: "",
  });
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobError, setJobError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, jobsRes] = await Promise.all([
        fetch("/api/v1/employers/me/company"),
        fetch("/api/v1/employers/me/jobs"),
      ]);

      if (compRes.status === 401) {
        router.push("/login");
        return;
      }

      if (compRes.ok) {
        const compData = await compRes.json();
        setCompany(compData);
        setProfileForm({
          name: compData.name || "",
          shortIntro: compData.shortIntro || "",
          about: compData.about || "",
          websiteUrl: compData.websiteUrl || "",
          hrName: compData.hrName || "",
          hrEmail: compData.hrEmail || "",
          hrMobile: compData.hrMobile || "",
        });
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess("");
    try {
      const res = await fetch("/api/v1/employers/me/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        setProfileSuccess("Company profile updated successfully.");
        loadData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingJob(true);
    setJobError("");
    try {
      const res = await fetch("/api/v1/employers/me/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...jobForm,
          vacancies: Number(jobForm.vacancies),
          applicationDeadline: new Date(jobForm.applicationDeadline).toISOString(),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setJobForm({
          title: "",
          division: "DHAKA",
          jobType: "FULL_TIME",
          workPlace: "ON_SITE",
          vacancies: 1,
          applicationDeadline: "2026-12-05",
          shortDescription: "",
          requirements: "",
          question1: "",
          question2: "",
        });
        loadData();
      } else {
        const data = await res.json();
        setJobError(data.message || "Failed to publish job post");
      }
    } catch (err: any) {
      setJobError(err.message || "An error occurred");
    } finally {
      setCreatingJob(false);
    }
  };

  const viewApplicants = async (job: JobPost) => {
    setSelectedJob(job);
    setActiveTab("applicants");
    setLoadingApplicants(true);
    try {
      const res = await fetch(`/api/v1/employers/me/jobs/${job.id}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error(err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm">Loading Employer Portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner with Approval Status */}
      {company && (
        <div className="mb-6">
          {company.approvalStatus === "PENDING" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Company Account Pending Admin Verification</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your registration is being verified by the AIUB Office of Placement & Alumni (OPA). You can draft job openings now, and they will become publicly visible once approved.
                </p>
              </div>
            </div>
          )}

          {company.approvalStatus === "REJECTED" && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">Application Notice</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {company.rejectionReason || "Please contact the AIUB Placement Office for clarification."}
                </p>
              </div>
            </div>
          )}

          {company.approvalStatus === "APPROVED" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs sm:text-sm font-semibold text-emerald-900">
                  Verified AIUB 2026 Employer Stall Participant
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-medium">Stall confirmed</span>
            </div>
          )}
        </div>
      )}

      {/* Header and Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Employer Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {company?.name || "Company Dashboard"}
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "jobs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            My Job Posts ({jobs.length})
          </button>
          <button
            onClick={() => {
              if (jobs.length > 0 && !selectedJob) {
                viewApplicants(jobs[0]);
              } else {
                setActiveTab("applicants");
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "applicants" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Applicants & Assessment
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Company Profile
          </button>
        </div>
      </div>

      {/* Tab 1: Job Posts */}
      {activeTab === "jobs" && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active Job Vacancies</h2>
              <p className="text-xs text-slate-500">Post vacancies and internships for AIUB candidates to apply.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Job Posts Yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Publish your job openings to begin receiving verified applications from AIUB students and alumni.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Create First Job Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        job.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {job.jobType.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                      {job.shortDescription}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.division} ({job.workPlace})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      <strong>{job._count?.applications || 0}</strong> Candidates
                    </span>

                    <button
                      onClick={() => viewApplicants(job)}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Review Applicants</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applicants & Psychometrics */}
      {activeTab === "applicants" && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Job Applicants</span>
              </h2>
              <p className="text-xs text-slate-500">
                Review candidate credentials, download verified CVs, and inspect Big Five psychometric profiles.
              </p>
            </div>

            {/* Job selector dropdown */}
            {jobs.length > 0 && (
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold text-slate-600">Selected Job:</label>
                <select
                  value={selectedJob?.id || ""}
                  onChange={(e) => {
                    const found = jobs.find((j) => j.id === e.target.value);
                    if (found) viewApplicants(found);
                  }}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j._count?.applications || 0})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loadingApplicants ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Fetching applicants...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Applicants Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                When students apply for this opening, their resumes and psychometric summaries will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((app) => (
                <div
                  key={app.applicationId}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0">
                          {app.student?.fullName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">
                            {app.student?.fullName || "Candidate"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700">AIUB ID: {app.student?.aiubId}</span>
                            <span>•</span>
                            <span>Mobile: {app.student?.mobile}</span>
                            <span>•</span>
                            <span>Joined on {new Date(app.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Education snippet */}
                      {app.student?.educations && app.student.educations.length > 0 && (
                        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong>Latest Education:</strong> {app.student.educations[0].institutionName} (
                          {app.student.educations[0].subject || app.student.educations[0].level}
                          {app.student.educations[0].cgpa && `, CGPA: ${app.student.educations[0].cgpa}`}
                          )
                        </div>
                      )}

                      {/* Q1 / Q2 Answers */}
                      {(app.answer1 || app.answer2) && (
                        <div className="mt-2 text-xs text-slate-600 space-y-1">
                          {app.answer1 && (
                            <p>
                              <strong>Q1 Answer:</strong> {app.answer1}
                            </p>
                          )}
                          {app.answer2 && (
                            <p>
                              <strong>Q2 Answer:</strong> {app.answer2}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions and CV */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch md:self-auto shrink-0">
                      <a
                        href={app.cvDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download CV (PDF)</span>
                      </a>

                      <button
                        onClick={() => setSelectedApplicant(app)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs transition-colors"
                      >
                        <BrainCircuit className="w-4 h-4" />
                        <span>Psychometric Profile</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Psychometric Preview */}
                  {app.student?.assessmentSummary ? (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                          <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Big Five Bands:</span>
                        </span>
                        {app.student.assessmentSummary.categories.map((cat) => (
                          <span
                            key={cat.category}
                            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              cat.band === "High"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : cat.band === "Moderate"
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {cat.category}: <strong>{cat.band}</strong>
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">
                        * {app.student.assessmentSummary.disclaimer}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 italic">
                      Candidate has not yet completed the optional psychometric self-assessment.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Company Profile */}
      {activeTab === "profile" && (
        <div className="mt-8 max-w-2xl bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Company Stall Information</h2>
          <p className="text-xs text-slate-500 mb-6">
            Update your organization details, stall description, and target candidate criteria shown to AIUB students.
          </p>

          {profileSuccess && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Criteria / "What We Are Looking For"
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Seeking passionate CS & EEE graduates proficient in fullstack, data analysis, or embedded systems..."
                value={profileForm.shortIntro}
                onChange={(e) => setProfileForm({ ...profileForm, shortIntro: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400">
                Shown prominently on your stall card and company profile.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About Organization</label>
              <textarea
                rows={4}
                placeholder="Detailed company overview, engineering culture, technologies used..."
                value={profileForm.about}
                onChange={(e) => setProfileForm({ ...profileForm, about: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                placeholder="https://company.com"
                value={profileForm.websiteUrl}
                onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">HR Focal Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">HR Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.hrName}
                    onChange={(e) => setProfileForm({ ...profileForm, hrName: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">HR Email</label>
                  <input
                    type="email"
                    required
                    value={profileForm.hrEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, hrEmail: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">HR Mobile</label>
                  <input
                    type="tel"
                    required
                    value={profileForm.hrMobile}
                    onChange={(e) => setProfileForm({ ...profileForm, hrMobile: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {savingProfile ? "Saving Changes..." : "Save Company Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create Job Post */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Post a New Vacancy</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify position requirements, divisional location, and screening questions.
            </p>

            {jobError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {jobError}
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Software Engineer, Trainee Analyst"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Division</label>
                  <select
                    value={jobForm.division}
                    onChange={(e) => setJobForm({ ...jobForm, division: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white"
                  >
                    <option value="DHAKA">Dhaka</option>
                    <option value="CHATTOGRAM">Chattogram</option>
                    <option value="RAJSHAHI">Rajshahi</option>
                    <option value="KHULNA">Khulna</option>
                    <option value="BARISHAL">Barishal</option>
                    <option value="SYLHET">Sylhet</option>
                    <option value="RANGPUR">Rangpur</option>
                    <option value="MYMENSINGH">Mymensingh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTUAL">Contractual</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace</label>
                  <select
                    value={jobForm.workPlace}
                    onChange={(e) => setJobForm({ ...jobForm, workPlace: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-2 bg-white"
                  >
                    <option value="ON_SITE">On-Site</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vacancies</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.vacancies}
                    onChange={(e) => setJobForm({ ...jobForm, vacancies: Number(e.target.value) })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={jobForm.applicationDeadline}
                    onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of responsibilities and day-to-day work..."
                  value={jobForm.shortDescription}
                  onChange={(e) => setJobForm({ ...jobForm, shortDescription: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Required technologies, degrees, problem-solving skills..."
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Optional Screening Questions
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Question 1 (e.g. What is your preferred tech stack?)"
                    value={jobForm.question1}
                    onChange={(e) => setJobForm({ ...jobForm, question1: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Question 2 (e.g. Expected graduation semester or notice period?)"
                    value={jobForm.question2}
                    onChange={(e) => setJobForm({ ...jobForm, question2: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingJob}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {creatingJob ? "Publishing..." : "Publish Vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Full Psychometric & Student Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedApplicant.student?.fullName}
                </h3>
                <span className="text-xs text-slate-500">
                  AIUB ID: {selectedApplicant.student?.aiubId}
                </span>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>IPIP Big Five Assessment Summary</span>
                </h4>

                {selectedApplicant.student?.assessmentSummary ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="space-y-2.5">
                      {selectedApplicant.student.assessmentSummary.categories.map((c) => (
                        <div key={c.category} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{c.category}</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            c.band === "High" ? "bg-emerald-100 text-emerald-800" :
                            c.band === "Moderate" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                          }`}>
                            {c.band}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed italic">
                      Notice: This psychometric profile is a self-reported developmental snapshot. It must not be used as an automated disqualification or sole determinant for hiring.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl">
                    Candidate has not completed the psychometric self-assessment.
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Credentials
                </h4>
                {selectedApplicant.student?.educations.map((e) => (
                  <div key={e.id} className="text-xs text-slate-600 py-1 border-b border-slate-100 last:border-0">
                    <span className="font-semibold text-slate-800">{e.level}:</span> {e.institutionName}
                    {e.subject && ` (${e.subject})`}
                    {e.cgpa && <span className="ml-1 text-blue-600 font-bold">CGPA: {e.cgpa}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <a
                href={selectedApplicant.cvDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV</span>
              </a>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
