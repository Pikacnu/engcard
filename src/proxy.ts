import { NextResponse, type NextRequest } from 'next/server';
import { auth } from './utils';

export default async function proxy(request: NextRequest) {
  const session = await auth();
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
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
