import type { NextAuthConfig } from 'next-auth';
import Discord from 'next-auth/providers/discord';
import Google from 'next-auth/providers/google';

export default {
	providers: [
		Discord({
			clientId: process.env.AUTH_DISCORD_ID || '',
			clientSecret: process.env.AUTH_DISCORD_SECRET || '',
		}),
		Google({
			clientId: process.env.AUTH_GOOGLE_ID || '',
			clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
		}),
	],
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
