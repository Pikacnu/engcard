'use client'; // Added

import { NavBar } from '@/components/navbar';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function DownloadPage() {
	const { t } = useTranslation(); // Added

	return (
		<>
			<NavBar />
			<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-700 w-full h-full p-4'>
				<h1 className='text-4xl font-bold text-gray-800 dark:text-white mb-4'>
					{t('download.title')} {/* Translated */}
				</h1>
				<p className='text-gray-600 dark:text-gray-300 text-lg mb-4 text-center'>
					{t('download.description')} {/* Translated */}
				</p>
				<div className='flex flex-col sm:flex-row gap-4 bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-40 items-center justify-center mt-4 p-6 rounded-lg shadow-md'>
					<a
						href='/release/cardlisher-desktop.exe'
						className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl'
					>
						<Image
							src='/platform/windows.svg'
							alt={t('download.altWindows')} // Translated
							width={24}
							height={24}
							className='' // Assuming SVG is white or will be adapted via CSS filter if needed
						/>
						{t('download.buttonWindows')} {/* Translated */}
					</a>
					<a
						href='/release/cardlisher-android.apk'
						className='bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl'
					>
						<Image
							src='/platform/android.svg'
							alt={t('download.altAndroid')} // Translated
							width={24}
							height={24}
							className='' // Assuming SVG is white or will be adapted
						/>
						{t('download.buttonAndroid')} {/* Translated */}
					</a>
				</div>
			</div>
		</>
	);
}
