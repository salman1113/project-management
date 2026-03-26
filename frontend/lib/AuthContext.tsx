"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { User } from "./types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        if (pathname.startsWith("/dashboard")) router.push("/");
        return;
      }
      try {
        const res = await api.get("/api/users/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        if (pathname.startsWith("/dashboard")) router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname, router]);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
