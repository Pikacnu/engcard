'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeToggler } from './ThemeToggler';

export function NavBar() {
	const { t } = useTranslation();
	return (
		// Background: bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-70 backdrop-blur-sm
		<div className='sickey top-0 z-10 flex items-center justify-between w-full bg-white bg-opacity-30 dark:bg-gray-800 dark:bg-opacity-70 backdrop-blur-sm shadow-lg'>
			{/* Link icon color: text-gray-700 dark:text-white */}
			<div className='flex items-center justify-center text-gray-700 dark:text-white'>
				<Link
					href={'/'}
					className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/home.svg`} // These SVGs should ideally use currentColor for stroke/fill to adapt
						width={24}
						height={24}
						alt={t('navbar.altHome')}
					/>
				</Link>
				<Link
					href={'/info'}
					className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/info.svg`}
						width={24}
						height={24}
						alt={t('navbar.altInfo')}
					/>
				</Link>
				<Link
					href={'/market'}
					className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/shop.svg`}
						width={24}
						height={24}
						alt={t('navbar.altMarket')}
					/>
				</Link>
				<Link
					href={'/download'}
					className='flex items-center justify-center p-2 m-2 bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/download.svg`}
						width={24}
						height={24}
						alt={t('navbar.altDownload')}
					/>
				</Link>
			</div>
			{/* Login button icon color: text-gray-700 dark:text-white */}
			<div className='flex items-center text-gray-700 dark:text-white'>
				<ThemeToggler />{' '}
				{/* ThemeToggler itself handles its icon color internally now */}
				<Link
					href={'/auth/login'}
					className='self-center min-w-max
								bg-white bg-opacity-0 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-all duration-200 p-2 m-2 hover:shadow-xl shadow-white rounded-full'
				>
					<Image
						src={`/icons/box-arrow-in-left.svg`}
						width={24}
						height={24}
						alt={t('navbar.altLogin')}
					/>
				</Link>
			</div>
		</div>
	);
}
