import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simple check for better-auth session cookie
  // For strict validation, use auth.api.getSession inside middleware (requires fetch)
  const sessionCookie = request.cookies.get('better-auth.session_token');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/api/deck/:path*',
    '/api/word/:path*',
    '/api/ocr/:path*',
    '/api/chat/:path*',
    '/api/settings/:path*',
  ],
};
