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
    // Basic frontend protection
    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/users/");
        setUsers(res.data.items);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user, router]);

  if (loading) return <p className="text-gray-500">Loading users...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">User Management</h2>
      
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{u.id}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                    u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {u.role}
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
