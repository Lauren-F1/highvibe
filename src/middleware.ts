import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 1. Specify public routes
const publicRoutes = ['/', '/terms', '/privacy', '/login'];

export function middleware(request: NextRequest) {
  // 2. Check for LAUNCH_MODE
  if (process.env.LAUNCH_MODE !== 'true') {
    return NextResponse.next();
  }

  // --- In Launch Mode ---

  // 3. Check for admin bypass cookie
  const isAdmin = request.cookies.get('isAdminBypass')?.value === 'true';
  if (isAdmin) {
    const response = NextResponse.next();
    response.headers.set('x-launch-mode', 'on');
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // 4. Check if the path is public or a public sub-path.
  const isPublic = publicRoutes.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  if (isPublic) {
    const response = NextResponse.next();
    response.headers.set('x-launch-mode', 'on');
    return response;
  }

  // 5. Redirect non-public routes to the homepage
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const response = NextResponse.redirect(url);
  response.headers.set('x-launch-mode', 'on');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals)
     * - files with extensions (e.g., .png, .jpg, .svg)
     */
    '/((?!api/|_next/|.*\\..*).*)',
  ],
}
