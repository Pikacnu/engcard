import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (pathname.startsWith('/dashboard')) {
		const session = request.headers
			.get('cookie')
			?.includes('authjs.session-token');
		if (!session) {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/dashboard',
		'/tempword/:path*',
		'/auth/logout',
		'/api/card',
		'/api/chat',
		'/api/history',
		'/api/ocr',
		'/api/ocr/:path*',
		'/api/settings',
	],
};
