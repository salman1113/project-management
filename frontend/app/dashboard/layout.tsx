"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";

function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [uncompletedCount, setUncompletedCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get(`/api/tasks/?assigned_to=${user.id}`).then((res) => {
        const count = res.data.items.filter((t: any) => t.status !== "done").length;
        setUncompletedCount(count);
      }).catch(console.error);
    }
  }, [user, pathname]);

  if (!user) return null;

  const navLinks = [
    {
      href: "/dashboard",
      label: "Projects",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/tasks",
      label: "Tasks",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    ...(user.role === "admin"
      ? [{
          href: "/dashboard/users",
          label: "Users",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          ),
        }]
      : []),
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#131621] border-r border-[#2a3048] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#2a3048]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Project Manager</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-slate-400 hover:bg-indigo-500/10 hover:text-slate-200"
              }`}
            >
              <span className="flex items-center gap-2.5 flex-1">
                {link.icon}
                {link.label}
              </span>
              {link.label === "Tasks" && uncompletedCount > 0 && (
                <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto shadow-sm shadow-red-500/10">
                  {uncompletedCount} new
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 border-t border-[#2a3048] pt-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-indigo-500/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 border border-[#2a3048] hover:border-red-500/25 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#2a3048] border-t-indigo-500 rounded-full mx-auto mb-3"
            style={{ animation: "spin 0.8s linear infinite" }} />
          <p className="text-slate-500 text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="flex-1 p-8 min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}