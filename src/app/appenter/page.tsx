import { auth } from '@/utils';
import { redirect } from 'next/navigation';

export default async function AppEnter() {
	const session = await auth();
	if (session) {
		return redirect('/dashboard');
	}
	redirect('/auth/login');
}
