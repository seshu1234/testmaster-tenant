export const env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  NEXT_PUBLIC_APP_DOMAIN:
    process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000",
} as const;
