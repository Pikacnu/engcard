'use server';

import { signOut } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function GET() {
	// This is a server action
	await signOut();
	// redirect to login page
	return NextResponse.redirect('/auth/login');
}
