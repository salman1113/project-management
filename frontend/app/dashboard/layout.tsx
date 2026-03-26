"use client";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

function DashboardNavbar() {
  const { user, logout } = useAuth();
  
  if (!user) return null; // handled by loading state

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">ProjectManager</h1>
      <div className="flex gap-6 items-center">
        {user.role === "admin" && (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase mr-2.5">
            Admin
          </span>
        )}
        <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
          Projects
        </Link>
        <Link href="/dashboard/tasks" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
          Tasks
        </Link>
        
        {/* Conditional Admin Tab */}
        {user.role === "admin" && (
           <Link href="/dashboard/users" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
             Users
           </Link>
        )}

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }
  
  if (!user) return null; // Context handles redirect
  
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
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