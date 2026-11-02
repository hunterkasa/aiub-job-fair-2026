"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [droppingCv, setDroppingCv] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New Education form state
  const [showEduModal, setShowEduModal] = useState(false);
  const [newEdu, setNewEdu] = useState({
    level: "BSC",
    institutionName: "American International University-Bangladesh",
    cgpa: "3.75",
    subject: "Computer Science and Engineering",
    passingYear: "2026",
    notes: "",
  });

  // New Experience form state
  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({
    companyName: "",
    designation: "",
    jobType: "INTERNSHIP",
    startDate: "",
    endDate: "",
    isContinuous: false,
    responsibilities: "",
  });

  // New Reference form state
  const [showRefModal, setShowRefModal] = useState(false);
  const [newRef, setNewRef] = useState({
    name: "",
    designation: "",
    organization: "",
    email: "",
    mobile: "",
    relation: "ACADEMIC",
  });

  const fetchData = async () => {
    try {
      const [profileRes, completeRes] = await Promise.all([
        fetch("/api/v1/student/profile"),
        fetch("/api/v1/student/profile-completeness"),
      ]);

      if (profileRes.status === 401) {
        router.push("/login");
        return;
      }

      if (profileRes.ok) {
        setProfile(await profileRes.json());
      }
      if (completeRes.ok) {
        setCompleteness(await completeRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCv(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "CV");

    try {
      const res = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload CV");
      setMessage("CV uploaded successfully (PDF verified).");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingCv(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "PHOTO");

    try {
      const res = await fetch("/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload photo");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/student/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEdu),
      });
      if (!res.ok) throw new Error("Failed to add education");
      setShowEduModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/v1/student/education?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/student/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExp),
      });
      if (!res.ok) throw new Error("Failed to add experience");
      setShowExpModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/v1/student/experience?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/student/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRef),
      });
      if (!res.ok) throw new Error("Failed to add reference");
      setShowRefModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteReference = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/v1/student/references?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleGeneralCvDrop = async () => {
    setDroppingCv(true);
    try {
      const res = await fetch("/api/v1/applications/cv-drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joiningOption: "IMMEDIATELY" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to drop CV");
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDroppingCv(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Student & Alumni Profile Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {profile?.fullName || "Student Profile"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AIUB ID: <strong className="font-mono text-slate-800">{profile?.aiubId}</strong> • Complete all sections to unlock job applications
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/jobs"
            className="rounded-lg bg-blue-50 text-blue-700 px-3.5 py-2 text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            Browse Open Jobs
          </Link>
          <Link
            href="/student/assessment"
            className="rounded-lg bg-indigo-50 text-indigo-700 px-3.5 py-2 text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            Take Assessment
          </Link>
        </div>
      </div>
        {/* Profile Completeness Card (Section 7 & 9) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile Completeness Status</h2>
              <p className="text-xs text-slate-500">
                You must complete all required sections to unlock job applications and CV drop.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-900">{completeness?.percentage || 0}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full transition-all duration-500 ${
                completeness?.isComplete ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${completeness?.percentage || 0}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completeness?.checks?.map((check: any) => (
              <div
                key={check.key}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  check.completed
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {check.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <span className="font-medium">{check.label}</span>
              </div>
            ))}
          </div>

          {/* Direct CTA Buttons (Section 2.1A: "Want to apply for Job? Yes / No") */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/jobs"
              className={`w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold shadow-sm transition-all text-center ${
                completeness?.isComplete
                  ? "bg-blue-900 text-white hover:bg-blue-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
            >
              <span>Search Companies & Apply For Jobs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={handleGeneralCvDrop}
              disabled={!completeness?.isComplete || droppingCv}
              className={`w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition-all ${
                completeness?.isComplete
                  ? "border-blue-900 text-blue-900 hover:bg-blue-50"
                  : "border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {droppingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>Just Drop Your CV (General Candidate Pool)</span>
            </button>
          </div>
        </section>

        {/* Section 1: Personal Info & Photo */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Personal Profile</h3>
                <p className="text-xs text-slate-500">Your core academic identity and contact numbers</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Photo Column */}
            <div className="text-center md:border-r border-slate-100 md:pr-6">
              <div className="relative mx-auto h-28 w-28 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mb-3">
                {profile?.profilePhotoFileId ? (
                  <img
                    src={`/api/v1/files/${profile.profilePhotoFileId}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-slate-400" />
                )}
              </div>

              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-800">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, or WEBP (≤ 2 MB)</p>
            </div>

            {/* Info Columns */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Full Name:</span>
                <span className="font-bold text-slate-900 text-sm">{profile?.fullName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">AIUB Student ID:</span>
                <span className="font-bold text-slate-900 text-sm">{profile?.aiubId}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Mobile Number:</span>
                <span className="text-slate-800 font-medium">{profile?.mobile}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Preferred Job Type:</span>
                <span className="text-slate-800 font-medium">
                  {profile?.preferredJobType === "FULL_TIME" ? "Full-Time" : "Internship"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Current Study Level:</span>
                <span className="text-slate-800 font-medium">
                  {profile?.studyLevel === "ONGOING" ? "Ongoing Student" : "Graduated Alumni"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block mb-0.5">Present Address:</span>
                <span className="text-slate-800 font-medium">{profile?.address || "Kuril, Dhaka"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: CV Document */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Curriculum Vitae (CV)</h3>
                <p className="text-xs text-slate-500">PDF document attached automatically to job applications</p>
              </div>
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-blue-900 text-white px-3.5 py-2 text-xs font-bold hover:bg-blue-800">
                <Upload className="h-3.5 w-3.5" />
                <span>{uploadingCv ? "Uploading..." : profile?.defaultCvFileId ? "Replace CV" : "Upload CV (PDF)"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleCvUpload}
                  disabled={uploadingCv}
                />
              </label>
            </div>
          </div>

          {profile?.defaultCvFileId ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Official CV document is verified and on file</span>
              </div>
              <a
                href={`/api/v1/files/${profile.defaultCvFileId}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>View CV</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-xs text-amber-900">
              No CV uploaded yet. Please upload a standard PDF document (≤ 5 MB).
            </div>
          )}
        </section>

        {/* Section 3: Self-Assessment (IPIP Big Five) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Psychometric Self-Assessment</h3>
                <p className="text-xs text-slate-500">IPIP Big-Five 20-item behavioral profile</p>
              </div>
            </div>

            <div>
              {profile?.assessmentAttempts?.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Assessment Completed</span>
                </span>
              ) : (
                <Link
                  href="/student/assessment"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold hover:bg-amber-300 shadow-sm"
                >
                  <span>Take Self-Assessment (5 mins)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Educational Qualifications */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Educational Qualification</h3>
                <p className="text-xs text-slate-500">SSC, HSC, BSc, MSc, and Professional Degrees</p>
              </div>
            </div>

            <button
              onClick={() => setShowEduModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          {profile?.educations?.length === 0 ? (
            <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">
              No educational qualifications added yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {profile?.educations?.map((edu: any) => (
                <div
                  key={edu.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {edu.level} — {edu.subject || "General"}
                    </span>
                    <span className="text-slate-600">
                      {edu.institutionName} • Passing Year: {edu.passingYear || "N/A"} • CGPA: {edu.cgpa || "N/A"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 5: Experience (Optional) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Experience (Optional)</h3>
                <p className="text-xs text-slate-500">Full-time, part-time, or internship history</p>
              </div>
            </div>

            <button
              onClick={() => setShowExpModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          {profile?.experiences?.length === 0 ? (
            <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">
              No previous experience listed (optional).
            </p>
          ) : (
            <div className="space-y-2.5">
              {profile?.experiences?.map((exp: any) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {exp.designation} at {exp.companyName}
                    </span>
                    <span className="text-slate-600">
                      {exp.jobType} • {new Date(exp.startDate).toLocaleDateString()} to{" "}
                      {exp.isContinuous ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 6: References (Optional) */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">References (Optional)</h3>
              <p className="text-xs text-slate-500">Academic professors or professional supervisors</p>
            </div>

            <button
              onClick={() => setShowRefModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Reference</span>
            </button>
          </div>

          {profile?.references?.length === 0 ? (
            <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl">
              No references added yet (optional).
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile?.references?.map((ref: any) => (
                <div
                  key={ref.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs relative"
                >
                  <button
                    onClick={() => handleDeleteReference(ref.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-slate-900 block text-sm">{ref.name}</span>
                  <span className="text-slate-600 block">{ref.designation}, {ref.organization}</span>
                  <span className="text-slate-500 block mt-1">{ref.email} • {ref.mobile}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      {/* Modal: Add Education */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Educational Qualification</h3>
            <form onSubmit={handleAddEducation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree Level *</label>
                <select
                  value={newEdu.level}
                  onChange={(e) => setNewEdu({ ...newEdu, level: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 bg-white"
                >
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="BSC">BSc / Bachelor</option>
                  <option value="MSC1">MSc 1 / Master&apos;s</option>
                  <option value="MSC2">MSc 2</option>
                  <option value="PROFESSIONAL">Professional Degree / Certification</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={newEdu.institutionName}
                  onChange={(e) => setNewEdu({ ...newEdu, institutionName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject / Major</label>
                  <input
                    type="text"
                    value={newEdu.subject}
                    onChange={(e) => setNewEdu({ ...newEdu, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CGPA / GPA</label>
                  <input
                    type="text"
                    value={newEdu.cgpa}
                    onChange={(e) => setNewEdu({ ...newEdu, cgpa: e.target.value })}
                    placeholder="3.80"
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="number"
                  value={newEdu.passingYear}
                  onChange={(e) => setNewEdu({ ...newEdu, passingYear: e.target.value })}
                  placeholder="2026"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold"
                >
                  Save Degree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Experience */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Experience</h3>
            <form onSubmit={handleAddExperience} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newExp.companyName}
                  onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={newExp.designation}
                  onChange={(e) => setNewExp({ ...newExp, designation: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newExp.startDate}
                    onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={newExp.isContinuous}
                    value={newExp.endDate}
                    onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 disabled:opacity-50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newExp.isContinuous}
                  onChange={(e) => setNewExp({ ...newExp, isContinuous: e.target.checked })}
                  className="rounded border-slate-300 text-blue-900"
                />
                <span className="font-medium text-slate-700">Currently working here</span>
              </label>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Reference */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Reference</h3>
            <form onSubmit={handleAddReference} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newRef.name}
                  onChange={(e) => setNewRef({ ...newRef, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={newRef.designation}
                    onChange={(e) => setNewRef({ ...newRef, designation: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization *</label>
                  <input
                    type="text"
                    required
                    value={newRef.organization}
                    onChange={(e) => setNewRef({ ...newRef, organization: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newRef.email}
                    onChange={(e) => setNewRef({ ...newRef, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={newRef.mobile}
                    onChange={(e) => setNewRef({ ...newRef, mobile: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
