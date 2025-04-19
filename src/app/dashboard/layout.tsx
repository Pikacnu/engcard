'use server';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/utils/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SignOutButton from '@/components/account/signout';
import Image from 'next/image';

export default async function DashBoardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!session) {
		return redirect('/auth/login');
	}
	return (
		<div className='flex flex-row max-md:flex-col-reverse w-full h-dvh dark:bg-gray-700 bg-blue-100 '>
			<SessionProvider>
				<div className='flex flex-col max-md:flex-row h-full bg-gray-50 md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between text-black items-center'>
					<div className='*:bg-emerald-600 *:bg-opacity-40 *:p-2 *:m-2 *:hover:bg-opacity-40 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
						<Link href='/dashboard'>
							<Image
								src='/icons/home.svg'
								alt='logo'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
						<Link href='/dashboard/search'>
							<Image
								src='/icons/search.svg'
								alt='search'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
						<Link href='/dashboard/deck'>
							<Image
								src='/icons/card.svg'
								alt='deck'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
						<Link href='/dashboard/preview'>
							<Image
								src='/icons/file-play.svg'
								alt='preview'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
						<Link href='/dashboard/chat'>
							<Image
								src='/icons/chat.svg'
								alt='chat'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
						<Link href='/market'>
							<Image
								src='/icons/shop.svg'
								alt='market'
								width={24}
								height={24}
								className='cursor-pointer'
							></Image>
						</Link>
					</div>
					<SignOutButton />
				</div>
				<div className='flex-grow w-full overflow-auto h-full relative'>
					{children}
				</div>
			</SessionProvider>
		</div>
	);
}
