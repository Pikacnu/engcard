'use client';
import Link from 'next/link';
import { NavBar } from './../components/navbar'; // Assuming NavBar will also be themed
import { useTranslation } from '@/context/LanguageContext';

export default function Home() {
	const { t } = useTranslation();
	return (
		// Main div: bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900
		<div className='flex flex-col items-center h-screen p-0 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 w-full overflow-y-auto'>
			<NavBar /> {/* Ensure NavBar adapts */}
			<div className='flex items-center flex-col w-full mt-8 px-4 pb-8'>
				<h1 className='flex flex-col sm:flex-row items-center justify-center mb-6 text-center'>
					{/* Title: text-transparent is specific, gradient is likely fine for both modes */}
					<span className='text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide p-2'>
						{t('page.home.title')}
					</span>
					{/* Subtitle: text-blue-600 dark:text-blue-300 */}
					<span className='text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-300 sm:ml-2 mt-2 sm:mt-0 p-2'>
						{t('page.home.subtitle')}
					</span>
				</h1>
				{/* Description: text-gray-700 dark:text-gray-200 */}
				<p className='text-gray-700 dark:text-gray-200 text-xl mt-4 max-w-2xl text-center leading-relaxed'>
					{t('page.home.description')}
				</p>
				<div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl flex-grow'>
					{/* Card: bg-white dark:bg-gray-800, border-gray-300 dark:border-gray-700 */}
					<div className='bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'>
						<span className='text-5xl mb-4'>🗂️</span> {/* Emoji, no color change needed */}
						{/* Card Title: text-gray-800 dark:text-white */}
						<p className='text-gray-800 dark:text-white font-semibold text-lg mb-2'>
							{t('page.home.feature1.title')}
						</p>
						{/* Card Description: text-gray-600 dark:text-gray-300 */}
						<p className='text-gray-600 dark:text-gray-300 text-center'>
							{t('page.home.feature1.description')}
						</p>
					</div>
					{/* Card 2 */}
					<div className='bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'>
						<span className='text-5xl mb-4'>📷</span>
						<p className='text-gray-800 dark:text-white font-semibold text-lg mb-2'>
							{t('page.home.feature2.title')}
						</p>
						<p className='text-gray-600 dark:text-gray-300 text-center'>
							{t('page.home.feature2.description')}
						</p>
					</div>
					{/* Card 3 */}
					<div className='bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'>
						<span className='text-5xl mb-4'>🤖</span>
						<p className='text-gray-800 dark:text-white font-semibold text-lg mb-2'>
							{t('page.home.feature3.title')}
						</p>
						<p className='text-gray-600 dark:text-gray-300 text-center'>
							{t('page.home.feature3.description')}
						</p>
					</div>
					{/* Card 4 */}
					<div className='bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'>
						<span className='text-5xl mb-4'>📊</span>
						<p className='text-gray-800 dark:text-white font-semibold text-lg mb-2'>
							{t('page.home.feature4.title')}
						</p>
						<p className='text-gray-600 dark:text-gray-300 text-center'>
							{t('page.home.feature4.description')}
						</p>
					</div>
				</div>
				<div className='flex flex-col sm:flex-row gap-4 mt-14 mb-20'>
					{/* Get Started Button: Light mode: blue gradient, Dark mode: slightly different blue gradient or solid color */}
					<Link
						href='/dashboard'
						className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center'
					>
						{t('page.home.getStartedButton')}
					</Link>
					{/* GitHub Button: Light mode: gray, Dark mode: slightly lighter gray */}
					<Link
						href='https://github.com/Pikacnu/engcard'
						target='_blank'
						className='bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white dark:text-gray-100 font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400 transform hover:-translate-y-1 text-center mt-4 sm:mt-0'
					>
						{t('page.home.githubButton')}
					</Link>
				</div>
			</div>
		</div>
	);
}
