import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain (e.g., tenant1.testmaster.com -> tenant1)
  // For local development, assume localhost:3000
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const rootDomain = isLocal ? 'localhost:3000' : 'testmaster.in'
  
  const subdomain = hostname.replace(`.${rootDomain}`, '')
  
  // If the hostname is the root domain or empty subdomain
  if (subdomain === hostname || subdomain === '') {
    // This is the root domain (e.g., testmaster.in or localhost:3000)
    // We can redirect to a landing page or just continue
    return NextResponse.next()
  }

  // Rewrite the URL to include the tenant context if needed
  // Or just pass the tenant info in a header for the app to use
  const response = NextResponse.next()
  response.headers.set('X-Tenant-Slug', subdomain)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
