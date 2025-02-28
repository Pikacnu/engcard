import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [Discord],
	callbacks: {
		authorized({ request, auth }) {
			const url = new URL(request.url);
			console.log(url.pathname);
			if (url.pathname.startsWith('/dashboard')) {
				if (auth) return true;
				const url = new URL('/auth/login', request.url);
				return Response.redirect(url.toString(), 302);
			}
			return true;
		},
	},
});
