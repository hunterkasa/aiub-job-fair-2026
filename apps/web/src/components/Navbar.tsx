"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Briefcase, 
  Building2, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  BrainCircuit, 
  ShieldAlert, 
  ClipboardCheck,
  Building
} from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  role: "STUDENT" | "EMPLOYER" | "ADMIN";
  studentProfile?: {
    fullName: string;
    completenessPercentage: number;
  };
  employerProfile?: {
    companyName: string;
    isApproved: boolean;
  };
}

export default function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data?.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-blue-900 font-extrabold text-lg sm:text-xl tracking-tight">
              <span className="w-9 h-9 bg-blue-700 text-white flex items-center justify-center rounded-lg shadow-sm font-black text-xl">
                A
              </span>
              <span>
                AIUB <span className="text-blue-600 font-bold">Job Fair</span> <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-1">2026</span>
              </span>
            </Link>

            {/* Desktop primary nav */}
            <div className="hidden md:flex md:space-x-1 ml-6">
              <Link
                href="/jobs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/jobs") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Jobs
              </Link>
              <Link
                href="/companies"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/companies") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Companies
              </Link>
            </div>
          </div>

          {/* Desktop Right Side Nav */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 animate-pulse rounded"></div>
            ) : user ? (
              <>
                {user.role === "STUDENT" && (
                  <>
                    <Link
                      href="/student/profile"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/student/profile") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Profile</span>
                      {typeof user.studentProfile?.completenessPercentage === "number" && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                          user.studentProfile.completenessPercentage === 100 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {user.studentProfile.completenessPercentage}%
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/student/assessment"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/student/assessment") ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <BrainCircuit className="w-4 h-4 text-indigo-600" />
                      <span>Assessment</span>
                    </Link>

                    <Link
                      href="/student/applications"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive("/student/applications") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ClipboardCheck className="w-4 h-4 text-slate-500" />
                      <span>My Applications</span>
                    </Link>
                  </>
                )}

                {user.role === "EMPLOYER" && (
                  <Link
                    href="/employer/dashboard"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/employer/dashboard") ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Employer Portal</span>
                    {!user.employerProfile?.isApproved && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Pending</span>
                    )}
                  </Link>
                )}

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive("/admin") ? "bg-purple-50 text-purple-700 font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="h-4 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 max-w-[140px] truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </Link>

                <div className="relative group">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center space-x-1">
                    <span>Register</span>
                  </button>
                  <div className="absolute right-0 top-full pt-1.5 w-52 hidden group-hover:block z-50">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden">
                      <Link
                        href="/register/student"
                        className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        🎓 AIUB Student / Alumni
                      </Link>
                      <Link
                        href="/register/employer"
                        className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        🏢 Company / Employer Stall
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Jobs
          </Link>
          <Link
            href="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Companies
          </Link>

          {user ? (
            <>
              {user.role === "STUDENT" && (
                <>
                  <Link
                    href="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Student Profile ({user.studentProfile?.completenessPercentage || 0}%)
                  </Link>
                  <Link
                    href="/student/assessment"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Psychometric Assessment
                  </Link>
                  <Link
                    href="/student/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                </>
              )}

              {user.role === "EMPLOYER" && (
                <Link
                  href="/employer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Employer Portal
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-purple-700 hover:bg-purple-50"
                >
                  Admin Panel
                </Link>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate">{user.email}</span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 rounded bg-rose-50 text-rose-700 text-sm font-medium"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Log In
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/register/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Student Register
                </Link>
                <Link
                  href="/register/employer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                >
                  Employer Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
