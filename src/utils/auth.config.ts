import type { NextAuthConfig } from 'next-auth';
import Discord from 'next-auth/providers/discord';

export default {
	providers: [Discord],
	callbacks: {
		authorized({ request, auth }) {
			const url = new URL(request.url);
			if (url.pathname.startsWith('/dashboard')) {
				if (auth) return true;
				const url = new URL('/auth/login', request.url);
				return Response.redirect(url.toString(), 302);
			}
			return true;
		},
	},
} satisfies NextAuthConfig;
