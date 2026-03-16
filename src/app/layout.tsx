import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/hooks/use-auth';
import { SWRProvider } from '@/components/providers/swr-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TestMaster Tenant',
  description: 'Advanced coaching centre management platform',
};

// Helper to fetch branding for the current tenant (SSR)
async function fetchBranding(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const tenantSlug = cookieStore.get('X-Tenant')?.value || '';
  if (!tenantSlug) return {};
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/branding`, {
      headers: {
        'X-Tenant': tenantSlug,
      },
      cache: 'no-store' // Fetch fresh from Redis-backed API
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch branding:", error);
    return {};
  }
}

import { Toaster } from 'sonner';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await fetchBranding();
  
  // Build CSS custom properties
  const cssVars = Object.entries(branding)
    .filter(([key]) => typeof branding[key] === 'string' && !key.includes('url'))
    .reduce((acc, [key, value]) => ({
      ...acc,
      [`--${key.replace(/_/g, '-')}`]: value
    }), {} as React.CSSProperties);

  return (
    <html lang="en" style={cssVars} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider branding={branding}>
          <SWRProvider>
            {children}
            <Toaster position="top-center" richColors />
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
