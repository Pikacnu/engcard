import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	if (!request.headers.get('cookie')?.includes('authjs.session-token')) {
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
