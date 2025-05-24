'use client'; // Added

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function About() {
	const { t } = useTranslation(); // Added

	return (
		<div className='flex flex-col items-center min-h-screen py-2 bg-gray-100 dark:bg-gray-700 w-full'>
			<h1 className='text-2xl font-bold text-gray-800 dark:text-white mt-16 mb-6'> {/* Added margins */}
				{t('info.about.title')} {/* Translated */}
			</h1>
			<div className='flex flex-col items-start mt-4 w-full max-w-md px-4 space-y-4 dark:text-gray-200'> {/* Added space-y, max-width */}
				<div>
					<h2 className='text-xl font-semibold text-gray-700 dark:text-gray-100'>{t('info.about.creatorLabel')}</h2> {/* Translated */}
					<p className='text-gray-600 dark:text-gray-300'>Pikacnu</p>
				</div>
				<div>
					<h2 className='text-xl font-semibold text-gray-700 dark:text-gray-100'>{t('info.about.emailLabel')}</h2> {/* Translated */}
					<p>
						<Link href='mailto:pika@mail.pikacnu.com' className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
							pika@mail.pikacnu.com
						</Link>
					</p>
				</div>
				<div>
					<h2 className='text-xl font-semibold text-gray-700 dark:text-gray-100'>{t('info.about.versionLabel')}</h2> {/* Translated */}
					<p className='text-gray-600 dark:text-gray-300'>0.0.1</p>
				</div>
			</div>
		</div>
	);
}
