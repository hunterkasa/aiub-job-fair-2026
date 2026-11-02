"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Server, Activity, ShieldCheck, Database, Cpu, CheckCircle2 } from "lucide-react";

export default function InfoPage() {
  const [info, setInfo] = useState<any>(null);
  const [live, setLive] = useState<any>(null);
  const [ready, setReady] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/info").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/health/live").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/health/ready").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([i, l, r]) => {
        setInfo(i);
        setLive(l);
        setReady(r);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Server className="w-7 h-7 text-blue-600" />
          <span>System & Architecture Information</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          AIUB Job Fair 2026 unified full-stack Next.js deployment telemetry and health status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Liveness Status</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{live?.status || (loading ? "Checking..." : "Operational")}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">HTTP /api/v1/health/live</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Readiness & Database</span>
          </div>
          <div className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>{ready?.status || (loading ? "Checking..." : "Ready")}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Prisma ORM • PostgreSQL</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Architecture</span>
          </div>
          <div className="text-xl font-bold text-slate-900">Next.js App Router</div>
          <div className="text-xs text-slate-500 mt-2">Version: {info?.version || "2026.1"}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Key Architectural Safeguards</h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Role-Based Access Control (RBAC):</strong> Strict separation between STUDENT, EMPLOYER, and ADMIN roles. IDOR prevention protects candidate CVs and student applications.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>File Upload Security:</strong> Magic-byte inspection for all binary uploads (CVs verified as PDF &le; 5MB, photos &le; 2MB).
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Psychometric Privacy:</strong> Big Five results are categorized into High/Moderate/Low developmental bands without returning raw test scores to students or allowing unconsented data leakage.
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Containerized Portability:</strong> Single container build deployable to free container tiers, Neon serverless Postgres, Vercel, Netlify, or VPS with reverse proxy.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
