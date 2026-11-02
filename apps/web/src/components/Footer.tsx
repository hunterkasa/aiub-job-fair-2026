import Link from "next/link";
import { GraduationCap, Mail, MapPin, Calendar, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <span className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-black">
                A
              </span>
              <span>AIUB Job Fair 2026</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official campus recruitment and matching platform for the annual American International University-Bangladesh Job Fair.
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Main Event: Saturday, 5 Dec 2026</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>AIUB Campus, Kuratoli, Dhaka</span>
              </p>
            </div>
          </div>

          {/* Quick links for Students */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">For Students</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register/student" className="hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link href="/student/profile" className="hover:text-white transition-colors">
                  Build 100% Complete Profile
                </Link>
              </li>
              <li>
                <Link href="/student/assessment" className="hover:text-white transition-colors">
                  Big Five Psychometric Assessment
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors">
                  Explore Open Jobs & Internships
                </Link>
              </li>
              <li>
                <Link href="/student/applications" className="hover:text-white transition-colors">
                  Track Submitted Applications
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links for Employers */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">For Employers</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register/employer" className="hover:text-white transition-colors">
                  Register Company Stall
                </Link>
              </li>
              <li>
                <Link href="/employer/dashboard" className="hover:text-white transition-colors">
                  Employer Portal
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  Directory of Participating Stalls
                </Link>
              </li>
            </ul>
          </div>

          {/* Support and Institutional */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Office of Placement</h3>
            <p className="text-xs text-slate-400 mb-2">
              Office of Placement & Alumni (OPA), AIUB
            </p>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mb-2">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>opa@aiub.edu</span>
            </p>
            <a
              href="https://www.aiub.edu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <span>aiub.edu</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© 2026 American International University-Bangladesh. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/info" className="hover:text-slate-400">System Info</Link>
            <span>•</span>
            <Link href="/jobs" className="hover:text-slate-400">All Vacancies</Link>
            <span>•</span>
            <Link href="/companies" className="hover:text-slate-400">Company Stalls</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
