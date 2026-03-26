"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") { router.push("/dashboard"); return; }
    const fetchUsers = async () => {
      try { const res = await api.get("/api/users/"); setUsers(res.data.items); }
      catch (err) { console.error("Failed to fetch users", err); }
      finally { setLoading(false); }
    };
    if (user?.role === "admin") fetchUsers();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#2a3048] border-t-indigo-500 rounded-full"
          style={{ animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const adminCount = users.filter(u => u.role === "admin").length;
  const devCount   = users.filter(u => u.role !== "admin").length;

  const stats = [
    { label: "Total Members", value: users.length, color: "indigo",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
    { label: "Admins", value: adminCount, color: "violet",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { label: "Developers", value: devCount, color: "blue",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    violet: "bg-violet-500/10 text-violet-400",
    blue:   "bg-blue-500/10 text-blue-400",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} total members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#161b27] border border-[#2a3048] rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                {stat.icon}
              </div>
              <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#161b27] border border-[#2a3048] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3048]">
              {["Member", "Email", "Role", "ID"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a3048]/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-indigo-500/[0.03] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                      u.role === "admin" ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-200">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-400">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    u.role === "admin"
                      ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                      : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-[11px] text-slate-600 bg-indigo-500/8 px-2 py-0.5 rounded-md">
                    #{u.id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
