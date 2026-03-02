import { env } from "./env";

type ApiOptions = RequestInit & {
  tenant?: string;
  token?: string;
};

export async function api(path: string, options: ApiOptions = {}) {
  const { tenant, token, ...fetchOptions } = options;
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`;

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
