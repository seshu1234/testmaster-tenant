import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/favicon.ico'];
const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
};

function extractTenantSlug(hostname: string): string {
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const rootDomain = isLocal ? 'localhost:3001' : 'testmaster.in';
  const slugRaw = hostname.replace(`.${rootDomain}`, '');
  // If no subdomain (bare root domain) return empty
  return slugRaw === hostname ? '' : slugRaw;
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
