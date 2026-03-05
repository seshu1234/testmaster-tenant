import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/hooks/use-auth';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/branding`, {
      headers: {
        'X-Tenant': tenantSlug,
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch branding:", error);
    return {};
  }
}

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
    <html lang="en" style={cssVars}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
