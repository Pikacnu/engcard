'use client'; // Added

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Info() {
	const { t } = useTranslation(); // Added

	return (
		<div className='flex flex-col items-center justify-center flex-grow py-2 bg-gray-100 dark:bg-gray-700 w-full'>
			<h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
				{t('info.title')} {/* Translated */}
			</h1>
			<div className='flex items-center justify-center mt-4 gap-4 w-[80%] flex-wrap'>
				<Link href='/info/about'>
					<div className='bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						{t('info.aboutLink')} {/* Translated */}
					</div>
				</Link>
				<Link href='/info/tos'>
					<div className='bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						{t('info.tosLink')} {/* Translated */}
					</div>
				</Link>
				<Link href='/info/privacy'>
					<div className='bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						{t('info.privacyLink')} {/* Translated */}
					</div>
				</Link>
			</div>
		</div>
	);
}
