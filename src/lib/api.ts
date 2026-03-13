import { env } from "./env";

type ApiOptions = RequestInit & {
  tenant?: string;
  token?: string;
  params?: Record<string, string | number | boolean>;
};

export async function api(path: string, options: ApiOptions = {}) {
  const { tenant, token, params, ...fetchOptions } = options;
  
  let url = `${env.NEXT_PUBLIC_API_URL}${path}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    url += (url.includes("?") ? "&" : "?") + queryString;
  }

  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (tenant) {
    headers.set("X-Tenant", tenant);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}
