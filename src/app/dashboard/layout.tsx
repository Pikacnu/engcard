'use client';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function DashBoardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isBiMenuOpen, setIsBiMenuOpen] = useState(false);

	return (
		<div className='flex flex-row max-md:flex-col-reverse w-full h-dvh dark:bg-gray-700 bg-blue-100 relative'>
			<SessionProvider>
				<div className='flex flex-col max-md:flex-row h-full bg-gray-50 md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between text-black items-center'>
					{isBiMenuOpen ? (
						<div className='*:bg-emerald-600 *:bg-opacity-40 *:p-2 *:m-2 *:hover:bg-opacity-40 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
							<Link href={'/tempword'}>7000單</Link>
							<Link href={'/auth/logout'}>
								<Image
									src='/icons/box-arrow-in-left.svg'
									alt='logout'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link href={'/dashboard/settings'}>
								<Image
									src='/icons/gear.svg'
									alt='settings'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<button
								className=''
								onClick={() => setIsBiMenuOpen(false)}
							>
								<Image
									src='/icons/more.svg'
									alt='menu'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</button>
						</div>
					) : (
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
							<button
								className=''
								onClick={() => setIsBiMenuOpen(true)}
							>
								<Image
									src='/icons/more.svg'
									alt='menu'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</button>
						</div>
					)}
				</div>
				<div className='flex-grow w-full overflow-auto h-full relative'>
					{children}
				</div>
			</SessionProvider>
		</div>
	);
}
