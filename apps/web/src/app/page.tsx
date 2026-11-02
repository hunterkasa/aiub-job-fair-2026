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
  Server,
  Briefcase,
  FileText,
  BrainCircuit,
  MapPin
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white px-4 pt-12 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-800/60 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AIUB Official Campus Recruitment 2026</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
            Let&apos;s Build Your Future Together
          </h1>

          <p className="mt-4 text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
            Connect directly with leading corporate employers, explore vacancies across Bangladesh, drop your verified CV, and take your optional Big Five behavioral assessment.
          </p>

          {/* Live Countdown Box */}
          <div className="mt-8 mx-auto max-w-md rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/15 shadow-xl">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-blue-200 mb-3">
              <Calendar className="h-4 w-4 text-amber-400" />
              <span>Registration Deadline: Saturday, Dec 5, 2026</span>
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

          {/* Primary Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register/student"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all group"
            >
              <GraduationCap className="h-5 w-5" />
              <span>I&apos;m an AIUB Student / Alumni</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/register/employer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-6 py-3.5 text-sm font-bold text-white border border-white/20 shadow-md backdrop-blur-sm transition-all"
            >
              <Building2 className="h-5 w-5" />
              <span>I&apos;m an Employer / Recruiter</span>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-blue-200">
            <Link href="/jobs" className="hover:underline flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Browse Job Board</span>
            </Link>
            <span>•</span>
            <Link href="/companies" className="hover:underline flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              <span>Participating Stalls</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Campus Fair Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A High-Precision Recruitment Ecosystem
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              Everything students and recruiters need for structured, fair, and high-impact hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% Profile Completeness</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Build a standardized academic and experience profile. Ensure recruiters see your verified CGPA, department, and PDF resume.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Big Five Psychometrics</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Take the 20-item IPIP Big Five behavioral self-assessment. Band summaries help recruiters discover candidates that fit their team culture.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">8-Division Opportunities</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Filter jobs by division (Dhaka, Chattogram, Rajshahi, Khulna, etc.), workplace type (On-Site, Hybrid, Remote), and employment status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Status Banner */}
      <section className="py-6 bg-slate-100 border-t border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiInfo ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${apiInfo ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <span>
              Core Service: <strong>{apiLoading ? "Connecting..." : apiInfo ? "Operational (Full-Stack Next.js)" : "Standby"}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/info" className="text-blue-600 hover:underline">
              System Info & Health
            </Link>
            <span>•</span>
            <Link href="/companies" className="text-blue-600 hover:underline">
              Stall Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
