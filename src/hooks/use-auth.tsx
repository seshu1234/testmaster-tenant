"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student" | "superadmin" | "parent";
  tenant_id?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  tenantSlug: string | null;
  isLoading: boolean;
  login: (credentials: Record<string, string>) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper to get cookie
const getCookie = (name: string) => {
  return document.cookie.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1];
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const rootDomain = isLocal ? 'localhost' : 'testmaster.in';
  const tenantSlug = hostname && !hostname.includes(rootDomain) ? hostname.split('.')[0] : null;

  useEffect(() => {
    const savedToken = getCookie("auth_token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: Record<string, string>) => {
    try {
      const response = await api("/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          role: credentials.role || 'student',
        }),
        tenant: tenantSlug || undefined,
      });

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      
      // Store in cookies for middleware/SSR
      setCookie("auth_token", token);
      setCookie("user_role", user.role);
      
      // Store user object in localStorage for client-side UI
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      const routes = {
        admin: "/admin",
        teacher: "/teacher",
        student: "/student",
        parent: "/parent",
        superadmin: "/dashboard", // Should normally be on superadmin repo
      };
      
      router.push(routes[user.role as keyof typeof routes] || "/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    deleteCookie("auth_token");
    deleteCookie("user_role");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, tenantSlug, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
