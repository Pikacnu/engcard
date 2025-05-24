'use client'; // Added

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function PrivacyPolicyPage() { // Renamed component for clarity
	const { t } = useTranslation(); // Added

	return (
		<div className='flex flex-col items-center min-h-screen py-8 bg-gray-100 dark:bg-gray-700 w-full'>
			<h1 className='text-3xl font-bold text-gray-800 dark:text-white mt-16 mb-8'> {/* Added margins */}
				{t('info.privacy.title')} {/* Translated */}
			</h1>
			<main className='flex flex-col items-start mt-2 w-full max-w-4xl px-6 text-gray-700 dark:text-gray-300 overflow-y-auto max-h-[calc(100vh-200px)] prose dark:prose-invert prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-800 dark:prose-h2:text-white prose-p:mt-2'>
				<section className='mb-6'>
					<h2>{t('info.privacy.introTitle')}</h2> {/* Translated */}
					<p>{t('info.privacy.introP1')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.privacy.infoCollectTitle')}</h2> {/* Translated */}
					<p>{t('info.privacy.infoCollectP1')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.privacy.howWeUseTitle')}</h2> {/* Translated */}
					<p>{t('info.privacy.howWeUseP1')}</p> {/* Translated */}
					<p>{t('info.privacy.howWeUseP2')}</p> {/* Translated */}
					<p>{t('info.privacy.howWeUseP3')}</p> {/* Translated */}
					<p>{t('info.privacy.howWeUseP4')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.privacy.yourRightsTitle')}</h2> {/* Translated */}
					<p>{t('info.privacy.yourRightsP1')}</p> {/* Translated */}
					<p>{t('info.privacy.yourRightsP2')}</p> {/* Translated */}
					<p>{t('info.privacy.yourRightsP3')}</p> {/* Translated */}
					<p>{t('info.privacy.yourRightsP4')}</p> {/* Translated */}
					<p>{t('info.privacy.yourRightsP5')}</p> {/* Translated */}
				</section>
				<section className='mb-6'>
					<h2>{t('info.privacy.contactUsTitle')}</h2> {/* Translated */}
					<p>
						{t('info.privacy.contactUsP1')} {/* Translated */}
						<Link
							href='mailto:pika@mail.pikacnu.com'
							className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
						>
							pika@mail.pikacnu.com
						</Link>
						.
					</p>
				</section>
			</main>
		</div>
	);
}
