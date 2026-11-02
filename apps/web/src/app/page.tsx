"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Server
} from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ApiInfo {
  status: string;
  serverTimeUtc: string;
  version: string;
}

export default function Home() {
  const [studentTimeLeft, setStudentTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  // Student registration deadline: 5 Dec 2026 23:59:59 UTC+6 (Dhaka) -> 17:59:59 UTC
  const studentDeadline = new Date("2026-12-05T17:59:59Z").getTime();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = studentDeadline - now;

      if (difference > 0) {
        setStudentTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [studentDeadline]);

  useEffect(() => {
    fetch("/api/v1/info")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setApiInfo(data);
        setApiLoading(false);
      })
      .catch(() => {
        setApiLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Banner / Announcement */}
      <header className="border-b border-blue-900/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-black text-xl shadow-md">
              A
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight block text-base leading-none">
                AIUB Job Fair 2026
              </span>
              <span className="text-xs text-slate-700 block mt-0.5">
                American International University-Bangladesh
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiInfo ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${apiInfo ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <span className="hidden sm:inline text-slate-700">
              {apiLoading ? "Connecting..." : apiInfo ? "API Connected" : "Local Standby"}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-800/60 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-6 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Official Event Registration Portal</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
              Let&apos;s Build Your Future Together
            </h1>

            <p className="mt-4 text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
              Connect directly with leading national and global employers, drop your CV, participate in exclusive seminars, and discover your next career milestone.
            </p>

            {/* Live Countdown Box */}
            <div className="mt-8 mx-auto max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-blue-200 mb-3">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span>Student Registration Closes: Dec 5, 2026 (Dhaka Time)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl bg-black/30 p-2.5">
                  <div className="text-xl sm:text-2xl font-black text-white">{studentTimeLeft.days}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Days</div>
                </div>
                <div className="rounded-xl bg-black/30 p-2.5">
                  <div className="text-xl sm:text-2xl font-black text-white">{studentTimeLeft.hours}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Hours</div>
                </div>
                <div className="rounded-xl bg-black/30 p-2.5">
                  <div className="text-xl sm:text-2xl font-black text-white">{studentTimeLeft.minutes}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Mins</div>
                </div>
                <div className="rounded-xl bg-black/30 p-2.5">
                  <div className="text-xl sm:text-2xl font-black text-white">{studentTimeLeft.seconds}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">Secs</div>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons (Section 9) */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/register/student"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 text-base font-bold text-slate-950 shadow-lg hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
              >
                <GraduationCap className="h-5 w-5" />
                <span>I&apos;m a Student</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>

              <Link
                href="/register/employer"
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 text-base font-bold text-white transition-all hover:scale-105 active:scale-95"
              >
                <Building2 className="h-5 w-5" />
                <span>I&apos;m an Employer</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/companies" 
                className="text-xs text-blue-200 hover:text-white underline underline-offset-4 font-medium inline-flex items-center gap-1"
              >
                View Participating Companies (Hiring & Opportunities)
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-12 bg-white px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-xl font-bold text-slate-900 mb-8 sm:text-2xl">
              How AIUB Job Fair 2026 Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Build Your Digital Profile</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Register with your AIUB email, fill in your verified academic details, upload your CV, and take the guided self-assessment.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Apply or Drop Your CV</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Browse openings with instant one-click applications, or drop your CV into the general pool for all participating organizations.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Attend Seminars & Connect</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Register for exclusive career seminars and on-campus interactive sessions hosted by industry leaders and faculty.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* System & Phase 0 Verification Card */}
        <section className="py-8 bg-slate-100 border-t border-slate-200 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-5 w-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">Phase 0 Foundation Status</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">Monorepo Architecture (Next.js + ASP.NET Core)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">Database Switch (PostgreSQL & SQL Server)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">Health Checks (`/health/live`, `/health/ready`)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="text-slate-700">Docker & Production Compose Ready</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 American International University-Bangladesh (AIUB). All rights reserved.</p>
        <p className="mt-1">Built for AIUB Job Fair 2026. Designed for zero-lock-in portability.</p>
      </footer>
    </div>
  );
}
