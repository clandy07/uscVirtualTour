import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/admin'];
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  // Auth routes (signin, register) - redirect to home if already authenticated
  const authRoutes = ['/signin', '/register'];
  const isAuthRoute = authRoutes.includes(path);

  // Get the session token from cookies
  const sessionToken = request.cookies.get('better-auth.session_token')?.value;

  // If accessing protected route without session, redirect to signin
  if (isProtectedRoute && !sessionToken) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  // If accessing auth routes with session, redirect to home
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
