'use server';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/utils/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/account/signout';

export default async function DashBoardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!session) {
		return redirect(new URL('/auth/login', 'http://localhost:3000').toString());
	}
	return (
		<SessionProvider>
			<div className='flex flex-row w-full h-screen dark:bg-gray-700 bg-blue-100 '>
				<div className='flex flex-col min-w-16 h-full bg-gray-50 md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between text-black items-center'>
					<div className='*:bg-emerald-600 *:bg-opacity-40 *:p-2 *:m-2 *:hover:bg-opacity-40 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
						<Link href='/dashboard'>Home</Link>
						<Link href='/dashboard/search'>search</Link>
						<Link href='/dashboard/deck'>deck</Link>
					</div>
					<SignOutButton />
				</div>
				<div className='flex-grow w-full p-4'>{children}</div>
			</div>
		</SessionProvider>
	);
}
