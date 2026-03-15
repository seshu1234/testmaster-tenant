"use client";

import { SWRConfig } from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const { token, tenantSlug } = useAuth();

  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => 
          api(url, { 
            token: token || undefined, 
            tenant: tenantSlug || undefined 
          }),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        dedupingInterval: 5000,
        revalidateIfStale: true,
        revalidateOnReconnect: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
