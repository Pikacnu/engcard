'use client'; // Added

import { Suspense } from 'react';
import Content from './content'; // Assuming Content component handles its own translations or doesn't have text
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Market() {
	const { t } = useTranslation(); // Added

	return (
		<div className='flex flex-col items-center justify-start min-h-screen py-2 bg-gray-100 dark:bg-gray-700 w-full mt-16'>
			<h1 className='mb-6'> {/* Added margin-bottom for spacing */}
				<span className='text-2xl font-bold text-gray-800 dark:text-white'>
					{t('market.title')} {/* Translated */}
				</span>
			</h1>
			<Suspense fallback={<div className="text-black dark:text-white">{t('common.loadingText')}</div>}> {/* Translated */}
				<Content />
			</Suspense>
		</div>
	);
}
