import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is the strict allowlist of public-facing pages during Launch Mode.
const LAUNCH_MODE_ALLOWLIST = ['/', '/terms', '/privacy', '/login'];

export function middleware(request: NextRequest) {
  // Check if Launch Mode is active. The variable must be the string "true".
  if (process.env.LAUNCH_MODE !== 'true') {
    // If not in Launch Mode, do nothing and allow the request to proceed.
    return NextResponse.next();
  }

  // --- LAUNCH MODE IS ON ---
  
  // This helper function ensures the diagnostic header is added to every response from the middleware.
  const addLaunchModeHeader = (response: NextResponse) => {
    response.headers.set('x-launch-mode', 'on');
    return response;
  };
  
  // 1. Check for the admin bypass cookie. If it exists, allow access to any page.
  const isAdmin = request.cookies.get('isAdminBypass')?.value === 'true';
  if (isAdmin) {
    return addLaunchModeHeader(NextResponse.next());
  }

  // 2. For non-admins, check if the requested path is in the public allowlist.
  const pathname = request.nextUrl.pathname;
  
  // This logic checks for an exact match or if the path is a sub-path of an allowlisted directory.
  const isPubliclyAllowed = LAUNCH_MODE_ALLOWLIST.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route + '/'))
  );

  if (isPubliclyAllowed) {
    // If the path is public, allow the request.
    return addLaunchModeHeader(NextResponse.next());
  }

  // 3. If the user is not an admin and the route is not in the allowlist, redirect to the homepage.
  const url = request.nextUrl.clone();
  url.pathname = '/';
  return addLaunchModeHeader(NextResponse.redirect(url));
}

// This matcher applies the middleware to all page routes, while excluding API endpoints and static files.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}
