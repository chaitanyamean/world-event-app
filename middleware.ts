import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const role = token?.role;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname === '/dashboard';
  const isLoginRoute = pathname === '/login';

  // Redirect authenticated users away from /login to their respective dashboard
  if (isLoginRoute && isAuthenticated) {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect /dashboard and /admin/* — redirect unauthenticated requests to /login
  if ((isDashboardRoute || isAdminRoute) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect Guest sessions accessing /admin/* to /dashboard
  if (isAdminRoute && role === 'guest') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect Admin sessions accessing /dashboard to /admin
  if (isDashboardRoute && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/admin/:path*', '/login'],
};
