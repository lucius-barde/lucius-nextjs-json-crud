import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Only protect /admin subroutes, not /admin itself
  const isProtectedAdminSubroute = pathname.startsWith('/admin/') && pathname !== '/admin';

  if (isProtectedAdminSubroute && !session) {
    // Redirect to /admin (login form will be shown)
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on /admin routes
export const config = {
  matcher: ['/admin/:path*'],
}; 