import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from '@/lib/client';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	adapter: MongoDBAdapter(client, {
		databaseName: process.env.NODE_ENV === 'development' ? 'test' : 'prod',
	}),
});
