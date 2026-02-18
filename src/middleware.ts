
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Specify public routes
const publicRoutes = ['/', '/terms', '/privacy', '/login', '/join', '/signup'];

export function middleware(request: NextRequest) {
  // 2. Check for LAUNCH_MODE
  if (process.env.NEXT_PUBLIC_LAUNCH_MODE !== 'true') {
    return NextResponse.next();
  }

  // 3. Check for admin bypass cookie
  const isAdmin = request.cookies.get('isAdminBypass')?.value === 'true';
  if (isAdmin) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // 4. Check if the path is public or a public sub-path.
  // This allows access to /join, /join/guide, etc.
  const isPublic = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // 5. Redirect non-public routes to the homepage
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - any files inside /public (e.g., /logo.svg)
     */
    '/((?!api|_next/static|_next/image|.*\\.svg$|.*\\.png$).*)',
  ],
}
