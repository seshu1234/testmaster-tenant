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
  tenant_id: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Determine tenant right away (safe for SSR)
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const rootDomain = isLocal ? 'localhost' : 'testmaster.in';
  const tenantSlug = hostname && hostname.split('.')[0] !== rootDomain ? hostname.split('.')[0] : null;

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    const timer = setTimeout(() => {
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = async (credentials: Record<string, string>) => {
    // Determine tenant from hostname
    const hostname = window.location.hostname;
    const isLocal =
      hostname.includes("localhost") || hostname.includes("127.0.0.1");
    const rootDomain = isLocal ? "localhost" : "testmaster.in";
    let tenantSlug =
      hostname.split(".")[0] === rootDomain ? null : hostname.split(".")[0];

    // Override if user manually provided a workspace slug
    if (credentials.tenant) {
      tenantSlug = credentials.tenant;
    }

    try {
      const response = await api("/tenant/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        tenant: tenantSlug || undefined,
      });

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      switch (user.role) {
        case "admin":
          router.push("/admin");
          break;
        case "teacher":
          router.push("/teacher");
          break;
        case "student":
          router.push("/student");
          break;
        default:
          router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
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
