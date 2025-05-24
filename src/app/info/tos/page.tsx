'use client'; // Added

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function TOS() {
	const { t } = useTranslation(); // Added

	return (
		<div className='flex flex-col items-center min-h-screen py-8 bg-gray-100 dark:bg-gray-700 w-full'>
			<h1 className='text-3xl font-bold text-gray-800 dark:text-white mt-16 mb-8'> {/* Added margins */}
				{t('info.tos.title')} {/* Translated */}
			</h1>
			<main className='flex flex-col items-start mt-2 w-full max-w-4xl px-6 text-gray-700 dark:text-gray-300 overflow-y-auto max-h-[calc(100vh-200px)] prose dark:prose-invert prose-h2:text-xl prose-h2:font-semibold prose-h2:text-gray-800 dark:prose-h2:text-white prose-p:mt-2 prose-ul:list-disc prose-ul:list-inside prose-ul:mt-2'>
				<section className='mb-6'>
					<h2>{t('info.tos.introTitle')}</h2> {/* Translated */}
					<p>{t('info.tos.introP1')}</p> {/* Translated */}
					<p>{t('info.tos.introP2')}</p> {/* Translated */}
					<p>{t('info.tos.introP3')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.tos.userRespTitle')}</h2> {/* Translated */}
					<p>{t('info.tos.userRespP1')}</p> {/* Translated */}
					<p>{t('info.tos.userRespP2')}</p> {/* Translated */}
					<p>{t('info.tos.userRespP3')}</p> {/* Translated */}
					<p>{t('info.tos.userRespP4')}</p> {/* Translated */}
					<p>{t('info.tos.userRespP5')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.tos.prohibitedTitle')}</h2> {/* Translated */}
					<p>{t('info.tos.prohibitedP1')}</p> {/* Translated */}
					<p>{t('info.tos.prohibitedP2')}</p> {/* Translated */}
					<p>{t('info.tos.prohibitedP3')}</p> {/* Translated */}
					<p>{t('info.tos.prohibitedP4')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.tos.terminationTitle')}</h2> {/* Translated */}
					<p>{t('info.tos.terminationP1')}</p> {/* Translated */}
					<ul>
						<li>{t('info.tos.terminationL1')}</li> {/* Translated */}
						<li>{t('info.tos.terminationL2')}</li> {/* Translated */}
						<li>{t('info.tos.terminationL3')}</li> {/* Translated */}
						<li>{t('info.tos.terminationL4')}</li> {/* Translated */}
						<li>{t('info.tos.terminationL5')}</li> {/* Translated */}
					</ul>
					<p>{t('info.tos.terminationP2')}</p> {/* Translated */}
				</section>
				<p className='mt-4'>
					{t('info.tos.contactUsP1')} {/* Translated */}
					<Link
						href='mailto:pika@mail.pikacnu.com'
						className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline'
					>
						pika@mail.pikacnu.com
					</Link>
					.
				</p>
			</main>
		</div>
	);
}
