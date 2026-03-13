export const env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  NEXT_PUBLIC_APP_DOMAIN:
    process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000",
  NEXT_PUBLIC_ABLY_KEY: 
    process.env.NEXT_PUBLIC_ABLY_KEY || "",
  NEXT_PUBLIC_DEFAULT_TENANT:
    process.env.NEXT_PUBLIC_DEFAULT_TENANT || "demo",
} as const;
