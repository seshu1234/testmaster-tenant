import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/favicon.ico'];
const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
};

function extractTenantSlug(host: string): string {
  // host can be "demo.localhost:3000" or just "demo.localhost"
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  
  // If we have at least 2 parts like demo.localhost, the first part is the slug
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const secondLastPart = parts[parts.length - 2];
    
    // Check for common local domains
    if (lastPart === 'localhost' || (secondLastPart === 'localhost' && lastPart === 'local')) {
      return parts[0];
    }
    
    // Check for production domain
    if (hostname.endsWith('.testmaster.in')) {
      return hostname.replace('.testmaster.in', '');
    }
  }
  
  return '';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const tenantSlug = extractTenantSlug(hostname);

  // Clone response to set forwarding headers
  const requestHeaders = new Headers(request.headers);

  // Always forward X-Tenant slug so server components can read it
  if (tenantSlug) {
    requestHeaders.set('X-Tenant', tenantSlug);
    requestHeaders.set('X-Tenant-Slug', tenantSlug);
  }

  // Allow public paths through without auth check
  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublicPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Allow Next.js internals through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Read auth token + role from cookie
  const token = request.cookies.get('auth_token')?.value;
  const role  = request.cookies.get('user_role')?.value;

  // If no token, redirect to login
  if (!token || !role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  for (const [routeRole, routePrefix] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(routePrefix) && routeRole !== role) {
      // Redirect to the user's actual role dashboard
      const correctDashboard = ROLE_ROUTES[role] ?? '/login';
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
